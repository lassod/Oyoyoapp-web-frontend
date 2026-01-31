"use client";
import { useEffect, useState } from "react";
import AgoraRTC, { AgoraRTCProvider, IAgoraRTCClient } from "agora-rtc-react";

export default function SprayAgoraClient({
  children,
  isHost = false,
}: {
  children: React.ReactNode;
  isHost?: boolean;
}) {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);

  useEffect(() => {
    // Only create client on the client side
    if (typeof window !== "undefined") {
      const agoraClient = AgoraRTC.createClient({
        mode: "live",
        codec: "h264",
      });

      // Set client role based on whether user is host or audience
      if (isHost) {
        agoraClient.setClientRole("host");
      } else {
        agoraClient.setClientRole("audience");
      }

      setClient(agoraClient);
    }
  }, [isHost]);

  // Don't render until client is created (client-side only)
  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white">Loading stream...</div>
      </div>
    );
  }

  return <AgoraRTCProvider client={client}>{children}</AgoraRTCProvider>;
}
