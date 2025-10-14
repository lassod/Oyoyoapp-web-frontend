// lib/upload-chat-image.ts
import { storage } from "@/lib/firebase-config";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

export async function uploadChatImage(
  file: File,
  convId = "generic",
  userId = "me"
) {
  const key = `chat_uploads/${convId}/${userId}-${Date.now()}-${file.name}`;
  const fileRef = storageRef(storage, key); // ✅ real Storage ref
  const snap = await uploadBytes(fileRef, file, { contentType: file.type });
  return await getDownloadURL(snap.ref);
}
