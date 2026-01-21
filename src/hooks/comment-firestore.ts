// lib/firebase-comments.ts
import { db } from "@/lib/firebase-config"; // Same import as your chat code
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  limit,
  Timestamp,
  where,
} from "firebase/firestore";

// Determine collection name based on environment
const getCommentsCollection = () => {
  const isProd = process.env.NODE_ENV === "production";
  return isProd ? "spray_rooms" : "spray_rooms_dev";
};

export type StreamComment = {
  id: string;
  userId: string | number;
  username: string;
  avatar?: string;
  text: string;
  createdAt: Timestamp | any;
  eventId: string;
  [k: string]: any;
};

/**
 * Listen to real-time comments for a specific event
 * @param eventId - The event/spray room ID
 * @param cb - Callback function that receives the comments array
 * @param limitCount - Number of recent comments to fetch (default: 50)
 * @returns Unsubscribe function
 */
export function listenToStreamComments(
  eventId: string,
  cb: (comments: StreamComment[]) => void,
  limitCount: number = 50,
) {
  // Validate eventId
  if (!eventId || typeof eventId !== "string") {
    console.error("❌ Invalid eventId:", eventId);
    cb([]);
    return () => {}; // Return empty unsubscribe function
  }

  const collectionName = getCommentsCollection();

  // Ensure eventId is a string
  const eventIdStr = String(eventId);

  // Build the path as a string first to debug
  const path = `${collectionName}/${eventIdStr}/comments`;
  console.log("📍 Listening to comments at path:", path);

  const commentsRef = collection(db, collectionName, eventIdStr, "comments");

  // Query to get latest comments, ordered by timestamp
  const q = query(commentsRef, orderBy("createdAt", "desc"), limit(limitCount));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      console.log(`✅ Received ${snapshot.docs.length} comments`);
      const comments: StreamComment[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId ?? data.senderId ?? "",
          username: data.username ?? data.senderName ?? "Anonymous",
          avatar: data.avatar ?? data.senderAvatar ?? null,
          text: data.text ?? data.message ?? "",
          createdAt: data.createdAt ?? data.timestamp ?? null,
          eventId: eventId,
          ...data,
        };
      });

      // Reverse to show oldest first (bottom to top)
      cb(comments.reverse());
    },
    (error) => {
      console.error("❌ Error listening to comments:", error);
      cb([]);
    },
  );

  return unsubscribe;
}

/**
 * Send a comment to the stream
 * @param params - Comment data
 * @returns Document ID of the created comment
 */
export async function sendStreamComment(params: {
  eventId: string;
  userId: string | number;
  username: string;
  avatar?: string;
  text: string;
}): Promise<string> {
  const { eventId, userId, username, avatar, text } = params;

  if (!text.trim()) {
    throw new Error("Comment text cannot be empty");
  }

  // Validate and convert eventId
  if (!eventId) {
    throw new Error("eventId is required");
  }

  const eventIdStr = String(eventId).trim();

  if (!eventIdStr) {
    throw new Error("eventId cannot be empty");
  }

  console.log(
    "📤 Sending comment with eventId:",
    eventIdStr,
    "type:",
    typeof eventIdStr,
  );

  const collectionName = getCommentsCollection();
  const commentsRef = collection(db, collectionName, eventIdStr, "comments");

  const payload = {
    userId: Number(userId),
    username: username,
    avatar: avatar || null,
    text: text.trim(),
    createdAt: serverTimestamp(),
    timestamp: serverTimestamp(), // For compatibility
    eventId: eventId,
    type: "comment",
  };

  console.log(
    "📤 Sending comment to:",
    `${collectionName}/${eventId}/comments`,
  );
  const docRef = await addDoc(commentsRef, payload);
  console.log("✅ Comment sent with ID:", docRef.id);
  return docRef.id;
}

/**
 * Listen to new comments only (for notifications/animations)
 * @param eventId - The event/spray room ID
 * @param cb - Callback function that receives new comments
 * @returns Unsubscribe function
 */
export function listenToNewComments(
  eventId: string,
  cb: (comment: StreamComment) => void,
) {
  const collectionName = getCommentsCollection();
  const commentsRef = collection(db, collectionName, eventId, "comments");

  const now = new Date();
  const q = query(
    commentsRef,
    where("createdAt", ">", now),
    orderBy("createdAt", "asc"),
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          const comment: StreamComment = {
            id: change.doc.id,
            userId: data.userId ?? data.senderId ?? "",
            username: data.username ?? data.senderName ?? "Anonymous",
            avatar: data.avatar ?? data.senderAvatar ?? null,
            text: data.text ?? data.message ?? "",
            createdAt: data.createdAt ?? data.timestamp ?? null,
            eventId: eventId,
            ...data,
          };
          cb(comment);
        }
      });
    },
    (error) => {
      console.error("Error listening to new comments:", error);
    },
  );

  return unsubscribe;
}
