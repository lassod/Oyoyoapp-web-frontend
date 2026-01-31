"use client";
import dynamic from "next/dynamic";
import { useGetUser } from "@/hooks/user";
import { useGetEvent } from "@/hooks/events";
import { useParams } from "next/navigation";

// Dynamically import components that use Agora to prevent SSR issues
const SprayAgoraClient = dynamic(() => import("@/components/dashboard/Agora"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-white text-lg">Loading stream...</div>
    </div>
  ),
});

const AudienceView = dynamic(
  () =>
    import("@/components/dashboard/Livestream").then((mod) => ({
      default: mod.AudienceView,
    })),
  {
    ssr: false,
  },
);

function SprayDashboard() {
  const { id } = useParams();
  const { data: eventData } = useGetEvent(String(id));
  const { data: user } = useGetUser();
  const isHost = user?.id === eventData?.UserId;

  return (
    <SprayAgoraClient isHost={isHost}>
      <AudienceView />
    </SprayAgoraClient>
  );
}

export default SprayDashboard;
