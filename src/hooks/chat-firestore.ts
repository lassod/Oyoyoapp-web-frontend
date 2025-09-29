// chat-firestore.ts
import { db } from "@/lib/firebase-config";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  limit,
  collectionGroup,
  where,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";

/** Deterministic 1:1 conversation id */
export const conversationIdFor = (a: string, b: string) =>
  [String(a), String(b)].sort().join("__");

/** Ensure the conversation doc exists (idempotent) */
export async function ensureConversation(userId: string, peerId: string) {
  const conversationId = conversationIdFor(userId, peerId);
  const ref = doc(db, "conversations", conversationId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      participants: [userId, peerId],
      lastMessage: "",
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
  }
  return { conversationId, ref };
}

/** Send a message */
export async function sendMessage(params: {
  userId: string; // your backend user id (string)
  peerId: string; // other user id
  text?: string;
  imageUrl?: string;
}) {
  const { userId, peerId, text = "", imageUrl } = params;
  const { conversationId, ref } = await ensureConversation(userId, peerId);

  const messagesCol = collection(
    db,
    "conversations",
    conversationId,
    "messages"
  );
  const docRef = await addDoc(messagesCol, {
    senderId: userId,
    text,
    imageUrl: imageUrl || null,
    createdAt: serverTimestamp(),
  });

  await updateDoc(ref, {
    lastMessage: text || (imageUrl ? "[image]" : ""),
    lastMessageAt: serverTimestamp(),
  });

  return docRef.id;
}

/** Live message stream for a conversation */
export function listenToMessages(
  userId: string,
  peerId: string,
  cb: (
    messages: Array<{
      id: string;
      senderId: string;
      text?: string;
      imageUrl?: string | null;
      createdAt?: any;
    }>
  ) => void
) {
  const conversationId = conversationIdFor(userId, peerId);
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    cb(list);
  });
}

type ConversationItem = {
  id: string; // conversation id (e.g., "1_77")
  lastMessage: string;
  lastMessageAt?: Date | null;
  lastSenderId?: string;
};

export function listenToConversations(
  userId: string | number,
  cb: (items: ConversationItem[]) => void
) {
  console.log(userId);
  const uid = String(userId);
  const tag = `[listenToConversations uid=${uid}]`;

  console.log(`${tag} init`);
  const base = collectionGroup(db, "chats_dev");

  const qSender = query(
    base,
    where("senderId", "==", uid),
    orderBy("createdAt", "desc"),
    limit(200)
  );
  const qReceiver = query(
    base,
    where("receiverId", "==", uid),
    orderBy("createdAt", "desc"),
    limit(200)
  );

  console.log(`${tag} queries built`, {
    senderQuery:
      "collectionGroup('chats') WHERE senderId==uid ORDER BY createdAt DESC LIMIT 200",
    receiverQuery:
      "collectionGroup('chats') WHERE receiverId==uid ORDER BY createdAt DESC LIMIT 200",
  });

  const unsubs: Array<() => void> = [];
  let buffer: any[] = [];
  let done = 0;

  const logSnap = (
    kind: "sender" | "receiver",
    snap: QuerySnapshot<DocumentData>
  ) => {
    const n = snap.size;
    const first = n ? snap.docs[0]?.data()?.createdAt?.toDate?.() : null;
    const last = n ? snap.docs[n - 1]?.data()?.createdAt?.toDate?.() : null;
    console.log(`${tag} ${kind} snapshot`, { count: n, first, last });
    if (n > 0) {
      const sample = snap.docs.slice(0, Math.min(3, n)).map((d) => {
        const data = d.data() as any;
        const parentId = d.ref.parent.parent?.id ?? "(no-parent)";
        return {
          docId: d.id,
          convId: parentId,
          senderId: data.senderId,
          receiverId: data.receiverId,
          text: data.text ?? (data.imageUrl ? "[image]" : ""),
          createdAt: data.createdAt?.toDate?.() ?? null,
        };
      });
      console.log(`${tag} ${kind} sample (up to 3)`, sample);
    }
  };

  const flush = () => {
    done += 1;
    if (done < 2) return; // wait for both snapshots

    console.log(`${tag} merging`, { bufferedDocs: buffer.length });

    // Group by parent conversation id (…/chats_dev/{convId}/chats/{msg})
    const latestByConv = new Map<string, any>();
    for (const d of buffer) {
      const parent = d.ref.parent.parent; // chats (sub) -> parent doc
      const convId = parent?.id;
      if (!convId) continue;

      const prev = latestByConv.get(convId);
      const currTs = d.data()?.createdAt?.toMillis?.() ?? 0;
      const prevTs = prev?.data()?.createdAt?.toMillis?.() ?? -1;
      if (!prev || currTs > prevTs) latestByConv.set(convId, d);
    }

    console.log(`${tag} grouped`, {
      conversations: latestByConv.size,
    });

    const items: ConversationItem[] = Array.from(latestByConv.entries())
      .map(([convId, docSnap]) => {
        const data = docSnap.data() || {};
        const createdAt = data.createdAt?.toDate?.() ?? null;
        const text = data.text || (data.imageUrl ? "[image]" : "");
        return {
          id: convId,
          lastMessage: text,
          lastMessageAt: createdAt,
          lastSenderId: data.senderId,
        };
      })
      .sort((a, b) => {
        const ta = a.lastMessageAt?.getTime?.() ?? 0;
        const tb = b.lastMessageAt?.getTime?.() ?? 0;
        return tb - ta;
      });

    console.log(`${tag} items (sorted desc by lastMessageAt)`, items);
    cb(items);
  };

  // Sender stream
  unsubs.push(
    onSnapshot(
      qSender,
      (snap) => {
        logSnap("sender", snap);
        buffer = buffer.concat(snap.docs);
        flush();
      },
      (err) => {
        console.error(`${tag} sender onSnapshot error`, err);
      }
    )
  );

  // Receiver stream
  unsubs.push(
    onSnapshot(
      qReceiver,
      (snap) => {
        logSnap("receiver", snap);
        buffer = buffer.concat(snap.docs);
        flush();
      },
      (err) => {
        console.error(`${tag} receiver onSnapshot error`, err);
      }
    )
  );

  // Return unsubscribe that also logs
  return () => {
    console.info(`${tag} unsubscribe`);
    unsubs.forEach((u) => u());
  };
}
