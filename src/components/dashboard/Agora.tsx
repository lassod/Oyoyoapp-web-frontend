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
  useEffect(() => {
    // Set client role based on whether user is host or audience
    if (isHost) client.setClientRole("host");
    else client.setClientRole("audience"); // ← FIX: This was set to "host" before
  }, [client, isHost]);

  return <AgoraRTCProvider client={client}>{children}</AgoraRTCProvider>;
}
