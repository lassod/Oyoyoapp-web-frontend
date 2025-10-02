import { app, db } from "@/lib/firebase-config";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  getDatabase,
  ref,
  query as rtdbQuery,
  orderByChild,
  limitToLast,
  onValue,
  off,
  DataSnapshot,
  update as rtdbUpdate,
} from "firebase/database";

export const conversationIdFor = (a: string | number, b: string | number) =>
  [String(a), String(b)].sort().join("_");

export type ChatMessageFS = {
  id: string;
  senderId: string | number;
  text?: string;
  imageUrl?: string | null;
  createdAt?: any; // Firestore Timestamp
  [k: string]: any;
};

export function listenToMessagesByConvId(
  convId: string,
  cb: (messages: ChatMessageFS[]) => void
) {
  const q = query(
    collection(db, "chats_dev", convId, "chats"),
    orderBy("date", "asc")
  );

  return onSnapshot(
    q,
    (snap) => {
      const list: ChatMessageFS[] = snap.docs.map((d) => {
        const data = d.data() as any;
        // Normalize legacy/current schemas
        const createdAt = data.createdAt ?? data.date ?? null;
        const senderId = data.senderId ?? data.sender ?? "";
        const imageUrl = data.imageUrl ?? data.url ?? null;

        return {
          id: d.id,
          ...data,
          senderId,
          imageUrl,
          createdAt,
        };
      });
      console.log("[listen] docs =", snap.size);
      cb(list);
    },
    async (err) => {
      console.error("[listen] onSnapshot error:", err);
      // Fallback w/o orderBy if needed
      try {
        const fallback = await getDocs(
          collection(db, "chats_dev", convId, "chats")
        );
        const list: ChatMessageFS[] = fallback.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            ...data,
            senderId: data.senderId ?? data.sender ?? "",
            imageUrl: data.imageUrl ?? data.url ?? null,
            createdAt: data.createdAt ?? data.date ?? null,
          };
        });
        cb(list);
      } catch (e) {
        console.error("[fallback getDocs] error:", e);
      }
    }
  );
}

/** --- Member shape stored in RTDB (unchanged) --- */
export type ConversationMember = {
  id: number;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  phone?: string;
  country?: string;
  state?: string;
  bio?: string;
  avatar?: string;
  preferredCurrency?: string;
  currencySymbol?: string;
  isVendor?: boolean;
  isVerified?: boolean;
};

/** --- RTDB conversation row --- */
export type RTDBConversation = {
  initiator: number;
  members: ConversationMember[];
  message: string;
  seen: boolean;
  updated: number; // unix ms
};

/** Returned to UI */
export type ConversationItem = RTDBConversation & { id: string };

/** --- Live conversations list from RTDB (unchanged, points to user_messages_dev) --- */
export function listenToConversations(
  userId: string,
  cb: (items: ConversationItem[]) => void
) {
  const rtdb = getDatabase(app);
  const baseRef = ref(rtdb, `user_messages_dev/${userId}`);
  const q = rtdbQuery(baseRef, orderByChild("updated"), limitToLast(50));

  const handler = (snap: DataSnapshot) => {
    const raw = snap.val();
    const entries: Array<[string, RTDBConversation]> =
      raw && typeof raw === "object" ? (Object.entries(raw) as any) : [];

    const items: ConversationItem[] = entries
      .map(([id, row]) => ({
        id,
        initiator: Number(row?.initiator ?? 0),
        members: Array.isArray(row?.members) ? row.members : [],
        message: String(row?.message ?? ""),
        seen: Boolean(row?.seen),
        updated: Number(row?.updated ?? 0),
      }))
      .sort((a, b) => b.updated - a.updated);

    cb(items);
  };

  onValue(q, handler);
  return () => off(q, "value", handler);
}

export async function ensureRTDBConversation(params: {
  userId: string; // creator
  peerId: string; // the other user
  convId: string;
  members: ConversationMember[]; // must include avatar for both
  initiatorId?: string | number; // default userId
}) {
  const { userId, peerId, convId, members, initiatorId } = params;
  const rtdb = getDatabase(app);
  const now = Date.now();

  // Find the counterparty for each side
  const userViewOther = members.find((m) => String(m.id) === String(peerId));
  const peerViewOther = members.find((m) => String(m.id) === String(userId));

  const userSideAvatar = userViewOther?.avatar || "";
  const peerSideAvatar = peerViewOther?.avatar || "";

  console.log(userSideAvatar);
  console.log(peerSideAvatar);
  // Sender sees as read; peer as unread. Also store the counterpart's avatar.
  await Promise.all([
    rtdbUpdate(ref(rtdb, `user_messages_dev/${userId}/${convId}`), {
      initiator: Number(initiatorId ?? userId),
      members,
      message: "",
      seen: true,
      updated: now,
    }),
    rtdbUpdate(ref(rtdb, `user_messages_dev/${peerId}/${convId}`), {
      initiator: Number(initiatorId ?? userId),
      members,
      message: "",
      seen: false,
      updated: now,
    }),
  ]);
}

async function ensureFirestoreChatDoc(convId: string, participants: string[]) {
  const parentRef = doc(db, "chats_dev", convId);
  const snap = await getDoc(parentRef);
  if (!snap.exists()) {
    await setDoc(parentRef, {
      participants,
      createdAt: serverTimestamp(),
    });
  }
}

export async function sendMessage(params: {
  userId: string;
  peerId: string;
  text?: string;
  imageUrl?: string;
  convId: string;
}) {
  const { userId, peerId, text = "", imageUrl, convId } = params;

  await ensureFirestoreChatDoc(convId, [userId, peerId]);
  const messagesCol = collection(db, "chats_dev", convId, "chats");
  const docRef = await addDoc(messagesCol, {
    senderId: userId,
    text: text || null,
    imageUrl: imageUrl || null,
    createdAt: serverTimestamp(),
    date: serverTimestamp(), // <- for existing listeners that orderBy("date")
    type: "message",
  });

  // Update RTDB last message meta
  const rtdb = getDatabase(app);
  const last = text?.trim() ? text.trim() : imageUrl ? "[image]" : "";
  const now = Date.now();
  await Promise.all([
    rtdbUpdate(ref(rtdb, `user_messages_dev/${userId}/${convId}`), {
      message: last,
      updated: now,
      seen: true,
    }),
    rtdbUpdate(ref(rtdb, `user_messages_dev/${peerId}/${convId}`), {
      message: last,
      updated: now,
      seen: false,
    }),
  ]);

  return docRef.id;
}
