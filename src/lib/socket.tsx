"use client";
import { StreamReaction } from "@/hooks/comment";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useLiveReactions({
  eventId,
  onReaction,
}: {
  eventId: number;
  onReaction: (reaction: StreamReaction) => void;
}) {
  const socketRef = useRef<Socket | null>(null);
  const onReactionRef = useRef(onReaction);

  // Keep the callback ref up to date
  useEffect(() => {
    onReactionRef.current = onReaction;
  }, [onReaction]);

  useEffect(() => {
    if (!eventId) return;

    console.log("🔌 Connecting to Socket.IO for reactions...");

    const socket = io(process.env.NEXT_PUBLIC_APP_BACKEND_URL!, {
      transports: ["websocket"],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      socket.emit("join_event", { eventId });
    });

    socket.on("new_stream_reaction", (reaction: StreamReaction) => {
      console.log("🎉 New reaction received:", reaction);
      if (reaction.eventId === eventId) {
        // Use the ref to get the latest callback
        onReactionRef.current(reaction);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });

    return () => {
      console.log("🔌 Cleaning up socket connection");
      socket.emit("leave_event", { eventId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [eventId]); // Only eventId in dependencies
}
