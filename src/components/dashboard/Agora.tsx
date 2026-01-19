"use client";
import { useEffect } from "react";
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";

export default function SprayAgoraClient({
  children,
  isHost = false,
}: {
  children: React.ReactNode;
  isHost?: boolean;
}) {
  const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });

  console.log("isHost:", isHost);

  useEffect(() => {
    // Set client role based on whether user is host or audience
    if (isHost) {
      client.setClientRole("host");
      console.log("Client role set to: host");
    } else {
      client.setClientRole("audience"); // ← FIX: This was set to "host" before
      console.log("Client role set to: audience");
    }
  }, [client, isHost]);

  console.log("Agora client:", client);

  return <AgoraRTCProvider client={client}>{children}</AgoraRTCProvider>;
}
