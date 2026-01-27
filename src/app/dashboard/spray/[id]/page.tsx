"use client";
import { useGetUserFollowing, usePostFollow } from "@/hooks/follow";
import {
  useGetStreamEventReactions,
  // usePostStreamReaction,
} from "@/hooks/guest";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  MessageCircleMore,
  Users,
  X,
  Send,
  Smile,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { useGetUser } from "@/hooks/user";
import {
  Dashboard,
  DashboardHeader,
  DashboardHeaderText,
} from "@/components/ui/containers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Alhaji from "@/components/assets/images/dashboard/spray/Alhaji VIP.png";
import Digital from "@/components/assets/images/dashboard/spray/Digital Oracle.png";
import Inkosi from "@/components/assets/images/dashboard/spray/Inkosi yenkosi.png";
import Lion from "@/components/assets/images/dashboard/spray/Lion sprayer.png";
import Masked from "@/components/assets/images/dashboard/spray/Masked Legend.png";
import Mswali from "@/components/assets/images/dashboard/spray/Mswali wa Heshima.png";
import Oloye from "@/components/assets/images/dashboard/spray/Oloye.png";
import Queen from "@/components/assets/images/dashboard/spray/Queen Naira.png";
import Sarkin from "@/components/assets/images/dashboard/spray/Sarkin Gida.png";
import Logo from "@/components/assets/images/dashboard/Logo.png";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaTrophy } from "react-icons/fa6";
import {
  Leaderboard,
  Livechat,
  TopLeaders,
} from "@/components/dashboard/events/SprayFeature";
import {
  useGetEvent,
  useGetEventLeaderboard,
  useGetEventStream,
} from "@/hooks/events";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import { useParams, useRouter } from "next/navigation";
import { useGetCowrieRates, useGetWalletBalance } from "@/hooks/spray";
import { Reveal3 } from "@/app/components/animations/Text";
import { SprayCowrie } from "@/components/dashboard/events/spray/Wallet";
import { formatLargeVolume, scrollToTop } from "@/lib/auth-helper";
import { Coins } from "@/components/assets/images/icon/Coins";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
} from "firebase/firestore";
import { limit } from "firebase/firestore";
import {
  RemoteUser,
  useIsConnected,
  useJoin,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  usePublish,
  useRemoteUsers,
  useClientEvent,
  useRTCClient,
  LocalUser,
} from "agora-rtc-react";
import SprayAgoraClient from "@/components/dashboard/Agora";
import { db } from "@/lib/firebase-config";

function AudienceView() {
  const { id } = useParams();
  const [isFollowed, setIsFollowed] = useState(false);
  const [isAnimation, setIsAnimation] = useState<any>(null);
  const [isSpray, setIsSpray] = useState<any>(null);
  const { data: eventData, status } = useGetEvent(String(id));
  const { data: user } = useGetUser();
  const router = useRouter();
  const { data: wallet } = useGetWalletBalance();
  const { mutation: toggleFollow } = usePostFollow();
  const { data: following } = useGetUserFollowing();
  const { data: reactions } = useGetStreamEventReactions(id as string);
  const [thumbsUpCount, setThumbsUpCount] = useState(0);
  const [sprayOption, setSprayOption] = useState(0);
  const [event, setEvent] = useState<any>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: rate } = useGetCowrieRates(wallet?.wallet?.symbol);
  const { data: leaderboard } = useGetEventLeaderboard(id);
  const { data: streamData, isLoading: streamLoading } = useGetEventStream(
    id as string,
  );
  const [calling, setCalling] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  const isHost = user?.id === eventData?.UserId;
  const isConnected = useIsConnected();

  // Host-specific hooks (only enabled when isHost is true)
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(isHost);
  const { localCameraTrack } = useLocalCameraTrack(isHost);

  // Auto-start stream when host and tracks are ready
  useEffect(() => {
    if (isHost) {
      // Host needs camera and mic tracks ready
      if (localMicrophoneTrack && localCameraTrack && streamData?.streamId) {
        console.log("Host starting stream...");
        setCalling(true);
      }
    } else {
      // Audience can join as soon as stream data is available
      if (streamData?.streamId) {
        console.log("Audience joining stream...");
        setCalling(true);
      }
    }
  }, [isHost, localMicrophoneTrack, localCameraTrack, streamData?.streamId]);

  // Publish tracks if host (audience doesn't publish)
  usePublish(isHost && calling ? [localMicrophoneTrack, localCameraTrack] : []);

  // Join channel
  useJoin(
    {
      appid: process.env.NEXT_PUBLIC_AGORA_APP_ID!,
      channel: streamData?.streamId || "",
      token: streamData?.streamKey || null,
      uid: isHost ? user?.id || null : null,
    },
    calling && !!streamData?.streamId,
  );

  const remoteUsers = useRemoteUsers();
  const isTab = isHost || remoteUsers.length !== 0;

  // Get the Agora client instance
  const agoraClient = useRTCClient();

  // Handle connection state
  useClientEvent(
    agoraClient,
    "connection-state-change",
    (curState, prevState) => {
      console.log(`Connection state changed from ${prevState} to ${curState}`);

      // Handle disconnected state
      if (curState === "DISCONNECTED") {
        setStreamError("Connection lost. The stream may have ended.");
        setTokenExpired(true);
      }
    },
  );

  // Handle token privilege expiration
  useClientEvent(agoraClient, "token-privilege-will-expire", async () => {
    console.log("Token will expire soon");
    // You can request a new token here and renew it
    // await agoraClient.renewToken(newToken);
  });

  // Handle token privilege expired
  useClientEvent(agoraClient, "token-privilege-did-expire", () => {
    console.log("Token expired");
    setTokenExpired(true);
    setStreamError("The live stream has ended.");
    setCalling(false);
  });

  // Handle network quality
  useClientEvent(agoraClient, "network-quality", (stats) => {
    // Monitor network quality
    if (stats.downlinkNetworkQuality > 4 || stats.uplinkNetworkQuality > 4) {
      console.warn("Poor network quality detected");
    }
  });

  // Handle errors
  useClientEvent(agoraClient, "exception", (event) => {
    console.error("Agora exception:", event);
    if (event.code === 1001) {
      // Token expired
      setTokenExpired(true);
      setStreamError("The live stream has ended.");
    }
  });

  // Handle leaving/ending stream
  const handleLeaveStream = () => {
    setCalling(false);
    setTokenExpired(false);
    setStreamError(null);
    router.back();
  };

  const scrollLeft = () => {
    if (scrollRef.current)
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (scrollRef.current)
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
  };

  useEffect(() => {
    if (eventData) setEvent(eventData);
  }, [eventData]);

  useEffect(() => {
    if (reactions) {
      const upCount = reactions.filter(
        (reaction: any) => reaction.type === "Thumbs_Up",
      ).length;
      setThumbsUpCount(upCount);
    }
  }, [reactions]);

  useEffect(() => {
    if (following) {
      const follow = following?.find(
        (item: any) => item.followingId === event?.User?.id,
      );
      if (follow) setIsFollowed(true);
      else setIsFollowed(false);
    }
  }, [following, event]);

  const handleFollowToggle = (action: string) => {
    toggleFollow.mutate(
      {
        userId: event?.User?.id,
        action: action,
      },
      {
        onSuccess: () => {
          setIsFollowed((prev: any) => !prev);
        },
      },
    );
  };

  useEffect(() => {
    if (!id) return;

    const isProd = process.env.NODE_ENV === "production";
    // const collectionName = isProd ? "spray_rooms" : "spray_rooms_dev";
    const collectionName = "spray_rooms_dev";

    const spraysRef = collection(db, collectionName, id.toString(), "sprays");

    const now = new Date();
    const q = query(
      spraysRef,
      where("timestamp", ">", now),
      orderBy("timestamp", "desc"),
      limit(1),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const sprayData = change.doc.data();
            console.log("New spray received:", sprayData);

            setIsAnimation({
              id: change.doc.id,
              video: sprayData.path,
              response: {
                senderName: sprayData.name || "Anonymous",
                badge: sprayData.badge || "Sprayer",
                characterInfo: { description: sprayData.badge || "Legend" },
              },
            });
          }
        });
      },
      (error) => {
        console.error("Firestore listener error:", error);
      },
    );

    return () => unsubscribe();
  }, [id]);

  const reactionData = [
    {
      icon: Users,
      count: formatLargeVolume(eventData?.User?._count?.followers || 0),
    },
    {
      icon: Eye,
      count: formatLargeVolume(remoteUsers?.length || 0),
    },
    {
      icon: Heart,
      count: thumbsUpCount,
    },
  ];

  const itemTab = [
    {
      title: "Live chat",
      component: <Livechat user={user} eventId={String(event.id)} />,
    },
    {
      title: "Leaderboard",
      component: <Leaderboard data={leaderboard} rate={rate} />,
    },
  ];

  const videoRef = useRef<HTMLDivElement>(null);

  const requestFullscreen = () => {
    const el = videoRef.current;
    if (!el) return;

    if (el.requestFullscreen) el.requestFullscreen();
    else if ((el as any).webkitRequestFullscreen)
      (el as any).webkitRequestFullscreen();
  };

  // Mobile live chat state
  const [mobileComments, setMobileComments] = useState<any[]>([]);
  const [mobileCommentInput, setMobileCommentInput] = useState("");
  const [showReactions, setShowReactions] = useState(false);
  const [showSprayOptions, setShowSprayOptions] = useState(false);
  const mobileCommentsRef = useRef<HTMLDivElement>(null);

  // Common reactions
  const commonReactions = [
    { emoji: "❤️", type: "Heart" },
    { emoji: "🔥", type: "Fire" },
    { emoji: "👏", type: "Clap" },
    { emoji: "😂", type: "Laugh" },
    { emoji: "😍", type: "Love" },
    { emoji: "🎉", type: "Celebrate" },
  ];

  // Listen for mobile comments from Firestore
  useEffect(() => {
    if (!id) return;

    const collectionName = "spray_rooms_dev";
    const messagesRef = collection(
      db,
      collectionName,
      id.toString(),
      "messages",
    );
    const q = query(messagesRef, orderBy("timestamp", "desc"), limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const comments: any[] = [];
        snapshot.forEach((doc) => {
          comments.push({ id: doc.id, ...doc.data() });
        });
        setMobileComments(comments);
      },
      (error) => {
        console.error("Comments listener error:", error);
      },
    );

    return () => unsubscribe();
  }, [id]);

  // Handle sending reaction
  const handleSendReaction = (reactionType: string) => {
    setShowReactions(false);
  };

  if (status !== "success") return <SkeletonCard2 />;

  // Check if we're live on mobile (hide header when live)
  const isMobileLive = isHost || isConnected;

  // Token expired or stream error overlay
  if (tokenExpired || streamError) {
    return (
      <>
        <div className={cn(isMobileLive ? "hidden md:block" : "block")}>
          <DashboardHeader>
            <DashboardHeaderText>Live Stream</DashboardHeaderText>
            <Button
              onClick={() => router.push(`/dashboard/spray/${id}/overview`)}
              variant="link-red"
              size="no-padding"
            >
              Spray dashboard
              <ChevronRight className="w-5 h-5" />
            </Button>
          </DashboardHeader>
        </div>
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black via-black/95 to-black z-50">
          <div className="flex flex-col items-center gap-4 p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 shadow-2xl max-w-md mx-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <X className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-white text-xl font-bold">Stream Ended</h3>
              <p className="text-white/70 text-sm">
                {streamError ||
                  "The live stream has ended. Thank you for watching!"}
              </p>
            </div>
            <Button
              onClick={handleLeaveStream}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Only show header on desktop OR when not live on mobile */}
      <div className={cn(isMobileLive ? "hidden md:block" : "block")}>
        <DashboardHeader>
          <DashboardHeaderText>Live Stream</DashboardHeaderText>
          <Button
            onClick={() => router.push(`/dashboard/spray/${id}/overview`)}
            variant="link-red"
            size="no-padding"
          >
            Spray dashboard
            <ChevronRight className="w-5 h-5" />
          </Button>
        </DashboardHeader>
      </div>
      {!isHost && !isConnected ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/80 via-black/90 to-black z-20 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 shadow-2xl">
            <div className="relative">
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <Eye className="w-8 sm:w-12 h-8 sm:h-12 text-white/70" />
            </div>
            <div className="text-center">
              <h3 className="text-white text-base font-semibold tracking-wide">
                {isHost ? "Starting Stream..." : "Stream Offline"}
              </h3>
              <p className="text-white/60 text-sm">
                {isHost
                  ? "Preparing your broadcast"
                  : "Waiting for the host to go live"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile TikTok-style layout - TRUE FULLSCREEN */}
          <div className="md:hidden fixed inset-0 bg-black z-50">
            <div className="relative w-full h-full">
              {/* Full Video Container */}
              <div ref={videoRef} className="absolute inset-0 bg-black">
                <div className="w-full h-full">
                  {isHost ? (
                    localCameraTrack && localMicrophoneTrack ? (
                      <LocalUser
                        audioTrack={localMicrophoneTrack}
                        videoTrack={localCameraTrack}
                        cameraOn={true}
                        micOn={true}
                        playAudio={false}
                        playVideo={true}
                        cover="https://via.placeholder.com/300x400/000000/FFFFFF/?text=Loading..."
                      >
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </LocalUser>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-black">
                        <p className="text-white">Initializing camera...</p>
                      </div>
                    )
                  ) : (
                    <>
                      {remoteUsers.length === 0 ? (
                        <div className="flex items-center justify-center h-full bg-black/80">
                          <p className="text-white">
                            Waiting for host to go live...
                          </p>
                        </div>
                      ) : (
                        remoteUsers.map((remoteUser) => (
                          <div
                            key={remoteUser.uid}
                            style={{ width: "100%", height: "100%" }}
                          >
                            <RemoteUser
                              user={remoteUser}
                              cover="https://via.placeholder.com/300x400/000000/FFFFFF/?text=Loading..."
                            >
                              <div
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </RemoteUser>
                          </div>
                        ))
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Loading state */}
              {streamLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
                  <div className="text-white text-lg font-medium">
                    Connecting to stream...
                  </div>
                </div>
              )}

              {/* Spray animation overlay */}
              {isAnimation && (
                <video
                  key={isAnimation.id || isAnimation.video}
                  src={isAnimation.video}
                  autoPlay
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none z-40"
                  onEnded={() => setIsAnimation(null)}
                />
              )}

              {/* Close/Back button */}
              <button
                onClick={handleLeaveStream}
                className="absolute top-4 left-4 z-30 p-2 rounded-full bg-black/40 backdrop-blur-sm"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Top-left User Info Overlay */}
              <div className="absolute top-4 left-14 z-30 flex gap-2 items-center">
                <div className="relative flex items-center justify-center">
                  <Image
                    alt="Avatar"
                    src={event?.User?.avatar || "/noavatar.png"}
                    width={44}
                    height={44}
                    className="object-cover rounded-full border-2 border-white w-11 h-11"
                  />
                  {isTab && (
                    <span className="text-white bg-red-500 px-1.5 absolute -bottom-1 text-[10px] font-bold rounded-full">
                      Live
                    </span>
                  )}
                </div>
                <div className="bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
                  <span className="text-white font-medium text-sm truncate max-w-[100px]">
                    {event?.User?.username}
                  </span>
                </div>
              </div>

              {/* Top-right Viewer Count */}
              <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
                <div className="bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">
                    {formatLargeVolume(remoteUsers?.length || 0)}
                  </span>
                  <span className="text-red-500 text-sm font-medium">Live</span>
                </div>
              </div>

              {/* Spray notification overlay */}
              {isAnimation && (
                <div className="flex z-50 mx-auto p-2 rounded-full overflow-hidden left-4 top-20 justify-between absolute max-w-[280px] border border-white/20 w-fit bg-black/50 backdrop-blur-md items-center gap-3">
                  <div className="flex gap-2 items-center">
                    <Image
                      src={user?.avatar || "/noavatar.png"}
                      alt="Avatar"
                      width={28}
                      height={28}
                      className="rounded-full object-cover"
                    />
                    <div className="flex items-center gap-1">
                      <h6 className="text-white max-w-[100px] truncate text-xs font-medium">
                        @{isAnimation?.response?.senderName}
                      </h6>
                      <span className="text-gray-300 text-xs">sent</span>
                      <span className="text-yellow-400 text-xs font-medium">
                        {isAnimation?.response?.badge}
                      </span>
                    </div>
                  </div>
                  <FaTrophy className="text-yellow-500 w-4 h-4 animate-bounce" />
                </div>
              )}

              {/* Mobile Live Comments Overlay - TikTok style */}
              <div className="absolute bottom-32 left-0 right-16 z-30 px-3">
                <div
                  ref={mobileCommentsRef}
                  className="flex flex-col-reverse gap-1.5 max-h-[200px] overflow-hidden"
                >
                  {mobileComments.slice(0, 8).map((comment, index) => (
                    <div
                      key={comment.id || index}
                      className={cn(
                        "flex items-start gap-2 animate-in slide-in-from-left duration-300",
                        index > 4 && "opacity-50",
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Image
                        src={comment.avatar || "/noavatar.png"}
                        alt="Avatar"
                        width={28}
                        height={28}
                        className="rounded-full object-cover flex-shrink-0"
                      />
                      <div className="bg-black/40 backdrop-blur-sm rounded-2xl px-3 py-1.5 max-w-[85%]">
                        <span className="text-yellow-400 text-xs font-medium">
                          @{comment.username || "User"}:{" "}
                        </span>
                        <span className="text-white text-xs">
                          {comment.message || comment.text}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Input Area - TikTok style */}
              <div className="absolute bottom-0 left-0 right-0 z-30 p-3 pb-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <div className="flex items-center gap-2">
                  {/* Comment Input */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={mobileCommentInput}
                      onChange={(e) => setMobileCommentInput(e.target.value)}
                      placeholder="Comment..."
                      className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-white/60 rounded-full px-4 py-2.5 text-sm border border-white/20 focus:outline-none focus:border-white/40"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    className="p-2.5 rounded-full bg-red-500 hover:bg-red-600 transition active:scale-90"
                    onClick={() => {
                      if (mobileCommentInput.trim()) {
                        // Send comment via existing websocket/firebase
                        setMobileCommentInput("");
                      }
                    }}
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>

                  {/* Reactions Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowReactions(!showReactions)}
                      className="p-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 transition active:scale-90 border border-white/20"
                    >
                      <Heart className="w-5 h-5 text-white fill-white" />
                    </button>

                    {/* Reactions Popup */}
                    {showReactions && (
                      <div className="absolute bottom-14 right-0 bg-black/90 backdrop-blur-xl rounded-2xl p-2 border border-white/20 animate-in zoom-in-95 duration-200">
                        <div className="flex gap-1">
                          {commonReactions.map((reaction) => (
                            <button
                              key={reaction.type}
                              onClick={() => handleSendReaction(reaction.type)}
                              className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition active:scale-125 text-xl"
                            >
                              {reaction.emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right-side Action Buttons */}
              <div className="absolute bottom-36 right-3 z-30 flex flex-col gap-3">
                {/* Follow Button */}
                <button
                  onClick={() =>
                    handleFollowToggle(isFollowed ? "unfollow" : "follow")
                  }
                  disabled={toggleFollow.isPending}
                  className="relative flex flex-col items-center"
                >
                  <div className="relative">
                    <Image
                      src={event?.User?.avatar || "/noavatar.png"}
                      alt="Host"
                      width={44}
                      height={44}
                      className="rounded-full object-cover border-2 border-white"
                    />
                    {!isFollowed && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-sm font-bold">
                        +
                      </span>
                    )}
                  </div>
                </button>

                {/* Heart React */}
                <button
                  onClick={() => handleSendReaction("Thumbs_Up")}
                  className="flex flex-col items-center gap-0.5 p-2 rounded-full transition active:scale-90 touch-none"
                >
                  <Heart className="w-7 h-7 text-white drop-shadow-lg" />
                  <span className="text-white text-xs font-semibold drop-shadow-lg">
                    {thumbsUpCount}
                  </span>
                </button>

                {/* Comment */}
                <button className="flex flex-col items-center gap-0.5 p-2 rounded-full transition active:scale-90 touch-none">
                  <MessageCircleMore className="w-7 h-7 text-white drop-shadow-lg" />
                  <span className="text-white text-xs font-semibold drop-shadow-lg">
                    {mobileComments.length}
                  </span>
                </button>

                {/* Spray Button */}
                <button
                  onClick={() => setShowSprayOptions(!showSprayOptions)}
                  className="flex flex-col items-center gap-0.5 p-2 rounded-full transition active:scale-90 touch-none"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                    <Coins />
                  </div>
                  <span className="text-white text-xs font-semibold drop-shadow-lg">
                    Spray
                  </span>
                </button>

                {/* Share */}
                <button className="flex flex-col items-center gap-0.5 p-2 rounded-full transition active:scale-90 touch-none">
                  <svg
                    className="w-7 h-7 text-white drop-shadow-lg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.06c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.56 9.31 6.88 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.88 0 1.56-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                  </svg>
                </button>
              </div>

              {/* Mobile Spray Options Sheet */}
              {showSprayOptions && (
                <div className="absolute inset-0 z-50">
                  {/* Backdrop */}
                  <div
                    className="absolute inset-0 bg-black/60"
                    onClick={() => setShowSprayOptions(false)}
                  />
                  {/* Sheet */}
                  <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 rounded-t-3xl p-4 animate-in slide-in-from-bottom duration-300">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-white font-semibold text-lg">
                        Send a Spray
                      </h3>
                      <button
                        onClick={() => setShowSprayOptions(false)}
                        className="p-1 rounded-full bg-white/10"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>

                    {/* Cowries Balance */}
                    <div className="flex items-center gap-2 mb-4 bg-white/5 rounded-full px-4 py-2 w-fit">
                      <Coins />
                      <span className="text-white text-sm">
                        {wallet?.wallet?.cowrieBalance?.toLocaleString() || 0}{" "}
                        Cowries
                      </span>
                    </div>

                    {/* Spray Options Grid */}
                    <div className="grid grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pb-4">
                      {sprayOptions.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (
                              item.price <= (wallet?.wallet?.cowrieBalance || 0)
                            ) {
                              setIsSpray({
                                ...item,
                                symbol: wallet?.wallet?.symbol,
                                id,
                              });
                              setShowSprayOptions(false);
                            }
                          }}
                          disabled={
                            item.price > (wallet?.wallet?.cowrieBalance || 0)
                          }
                          className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-xl transition",
                            item.price > (wallet?.wallet?.cowrieBalance || 0)
                              ? "opacity-50"
                              : "hover:bg-white/10 active:scale-95",
                          )}
                        >
                          <Image
                            src={item.image || "/placeholder.svg"}
                            width={60}
                            height={60}
                            alt="Spray"
                            className="rounded-lg"
                          />
                          <div className="flex items-center gap-0.5">
                            <Coins />
                            <span className="text-white text-xs">
                              {item.price}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Layout */}
          <Dashboard className="hidden md:grid mx-auto pt-[70px] sm:pt-24 bg-white mt-[45px] grid-cols-1 gap-0 items-start md:grid-cols-3">
            <div className="flex md:col-span-2 flex-col gap-4 md:border-r-2">
              <div className="flex gap-4 border-b py-4 w-full justify-between items-center md:pr-6">
                <div className="flex gap-4">
                  <div className="relative flex items-center justify-center w-[50px] h-[50px]">
                    <Image
                      alt="Avatar"
                      src={event?.User?.avatar || "/noavatar.png"}
                      width={300}
                      height={300}
                      className="object-cover rounded-full border-[2px] border-red-700 w-[50px] h-[50px]"
                    />
                    {isTab && (
                      <span className="text-red-700 bg-red-50 px-2 absolute bottom-[-5px] text-xs font-medium">
                        Live
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-black font-[600]">
                      {event?.User?.username}
                    </p>
                    <div className="flex gap-3">
                      {reactionData.map((item: any, index: number) => (
                        <p
                          key={index}
                          className="flex text-sm items-center gap-1"
                        >
                          <item.icon className="w-4 h-4" />
                          {item.count}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {isFollowed ? (
                  <Button
                    className="mr-0"
                    disabled={toggleFollow.isPending}
                    onClick={() => handleFollowToggle("unfollow")}
                  >
                    Unfollow
                  </Button>
                ) : (
                  <Button
                    className="mr-0"
                    disabled={toggleFollow.isPending}
                    onClick={() => handleFollowToggle("follow")}
                  >
                    Follow
                  </Button>
                )}
              </div>
              <div className="md:pr-6">
                <div className="flex rounded-2xl overflow-hidden h-full bg-black flex-col">
                  <div className="relative h-[300px] sm:h-[400px] md:h-[470px]">
                    {isAnimation && (
                      <div className="flex z-50 mx-auto p-2 sm:p-4 rounded-xl overflow-hidden left-2 sm:left-4 top-10 justify-between absolute max-w-[400px] border border-gray-600 w-full bg-black/70 ro items-center gap-4">
                        <div className="flex gap-2 sm:gap-4 items-center">
                          <Image
                            src={user?.avatar || "/noavatar.png"}
                            alt="Avatar"
                            width={50}
                            height={50}
                            className="rounded-full object-cover"
                          />
                          <div className="space-y-1">
                            <h6 className="text-white max-w-[150px] truncate">
                              @{isAnimation?.response?.senderName}
                            </h6>
                            <p className="text-gray-300">
                              Sent {isAnimation?.response?.badge}
                            </p>
                            <p className="text-gray-300">
                              {
                                isAnimation?.response?.characterInfo
                                  ?.description
                              }{" "}
                              badge
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 animate-bounce">
                          <FaTrophy
                            className="bg-yellow-500 text-white p-2 rounded-full"
                            size={40}
                          />
                          <h2 className="bg-[linear-gradient(180deg,_#FBCE46_0%,_#93730D_100%)] bg-clip-text text-transparent font-extrabold">
                            X 1
                          </h2>
                        </div>
                      </div>
                    )}

                    <div
                      ref={videoRef}
                      className="relative h-[300px] sm:h-[400px] md:h-[470px] rounded-2xl overflow-hidden"
                    >
                      <div className="w-full h-full">
                        {isHost ? (
                          localCameraTrack && localMicrophoneTrack ? (
                            <LocalUser
                              audioTrack={localMicrophoneTrack}
                              videoTrack={localCameraTrack}
                              cameraOn={true}
                              micOn={true}
                              playAudio={false}
                              playVideo={true}
                              cover="https://via.placeholder.com/300x400/000000/FFFFFF/?text=Loading..."
                            >
                              <div
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </LocalUser>
                          ) : (
                            <div className="flex items-center justify-center h-full bg-black/80">
                              <p className="text-white">
                                Initializing camera...
                              </p>
                            </div>
                          )
                        ) : (
                          <>
                            {remoteUsers.length === 0 ? (
                              <div className="flex items-center justify-center h-full bg-black/80">
                                <p className="text-white">
                                  Waiting for host to go live...
                                </p>
                              </div>
                            ) : (
                              remoteUsers.map((remoteUser) => (
                                <div
                                  key={remoteUser.uid}
                                  style={{ width: "100%", height: "100%" }}
                                >
                                  <RemoteUser
                                    user={remoteUser}
                                    cover="https://via.placeholder.com/300x400/000000/FFFFFF/?text=Loading..."
                                  >
                                    <div
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  </RemoteUser>
                                </div>
                              ))
                            )}
                          </>
                        )}
                      </div>

                      {/* Loading state */}
                      {streamLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
                          <div className="text-white text-lg font-medium">
                            Connecting to stream...
                          </div>
                        </div>
                      )}

                      {/* Spray animation overlay */}
                      {isAnimation && (
                        <video
                          key={isAnimation.id || isAnimation.video}
                          src={isAnimation.video}
                          autoPlay
                          muted
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-40"
                          onEnded={() => setIsAnimation(null)}
                        />
                      )}
                      <button
                        onClick={requestFullscreen}
                        className="absolute bottom-3 right-3 z-50 bg-black/50 backdrop-blur-md text-white p-1 rounded-lg md:hidden"
                      >
                        ⛶
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="relative">
                      {/* Left Button */}
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => scrollLeft()}
                        className="absolute z-10 left-0 top-1/2 -translate-y-1/2 bg-black text-white p-2 rounded-full shadow-md"
                      >
                        <ChevronLeft size={20} />
                      </Button>

                      <div
                        ref={scrollRef}
                        className="flex gap-4 h-[240px] bg-black overflow-y-hidden overflow-auto scroll-smooth px-3 sm:px-8 py-4"
                      >
                        {sprayOptions.map((item, index: number) => (
                          <Reveal3 width="fit-content" key={index}>
                            <div
                              key={index}
                              onClick={() => setSprayOption(index)}
                              className={cn(
                                "w-[110px] md:w-[140px] cursor-pointer overflow-hidden rounded-lg flex flex-col items-center",
                              )}
                            >
                              <div
                                className={cn(
                                  "relative flex items-center justify-center flex-col",
                                  sprayOption === index
                                    ? "bg-[#1E1F22]"
                                    : "bg-transparent",
                                )}
                              >
                                <Image
                                  src={item?.image || "/placeholder.svg"}
                                  width={300}
                                  height={300}
                                  className="p-[6px] md:p-2 w-[110px] md:w-[140px] h-[125px] md:h-[155px]"
                                  alt="Spray"
                                />
                                {index === 0 && (
                                  <h6 className="absolute text-xs md:text-sm animate-bounce top-[35%] bg-red-200 border border-red-300 rounded-lg px-2 text-red-600">
                                    Custom Spray
                                  </h6>
                                )}{" "}
                                <div className="flex w-full gap-1   justify-center items-center">
                                  <Coins />
                                  <h6 className="text-white text-center my-1">
                                    {item?.price?.toLocaleString()}
                                  </h6>
                                </div>
                              </div>
                              {sprayOption === index && (
                                <>
                                  <button
                                    disabled={
                                      item.price > wallet?.wallet?.cowrieBalance
                                    }
                                    onClick={() =>
                                      setIsSpray({
                                        ...item,
                                        symbol: wallet?.wallet?.symbol,
                                        id,
                                      })
                                    }
                                    className="bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 w-full text-white py-1.5 text-sm font-semibold rounded-b-md"
                                  >
                                    Spray
                                  </button>
                                  {item.price >
                                    wallet?.wallet?.cowrieBalance && (
                                    <p className="text-xs text-red-600 py-1">
                                      Insuficient cowries
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                          </Reveal3>
                        ))}
                      </div>

                      {/* Right Button */}
                      <Button
                        variant="secondary"
                        className="absolute z-10 right-0 top-1/2 -translate-y-1/2 bg-black text-white p-2 rounded-full shadow-md"
                        size="icon"
                        onClick={() => scrollRight()}
                      >
                        <ChevronRight size={20} />
                      </Button>
                    </div>

                    <div className="border-t px-4 py-6 flex flex-col md:flex-row gap-4 md:justify-between border-gray-600">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-gray-300 text-xs md:text-[15px]">
                            Cowries Balance:
                          </p>
                          <h6 className="text-white text-xs md:text-[15px]">
                            {wallet?.wallet?.cowrieBalance?.toLocaleString()}
                          </h6>
                          <Button
                            variant="success"
                            className="w-fit ml-2"
                            onClick={() =>
                              router.push(`/dashboard/spray/${id}/fund-wallet`)
                            }
                          >
                            Fund wallet
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-300">Your current Rank:</p>
                        <h6 className="text-white">--</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {isTab && (
              <Tabs defaultValue="Live chat" className="w-full pt-5">
                <div className="overflow-auto scrollbar-hide z-10">
                  <TabsList className="gap-3 w-full  overflow-hidden">
                    {itemTab.map((item: any, index: number) => (
                      <TabsTrigger
                        className="flex items-center gap-2"
                        key={index}
                        value={item?.title}
                      >
                        {item?.title === "Live chat" ? (
                          <MessageCircleMore className="w-5 h-5" />
                        ) : (
                          <FaTrophy className="w-5 h-5" />
                        )}
                        {item?.title}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {itemTab.map((item: any, index: number) => (
                  <TabsContent value={item?.title} key={index}>
                    <TopLeaders
                      data={leaderboard}
                      rate={rate}
                      isAnimation={isAnimation}
                    />
                    {item.component}
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </Dashboard>
          <SprayCowrie
            scrollToTop={scrollToTop}
            data={isSpray}
            setData={setIsSpray}
            setIsAnimation={setIsAnimation}
          />
        </>
      )}
    </>
  );
}

const sprayOptions = [
  { image: Logo, price: 0, isCustom: true, video: "/video/lion.mp4" },
  { image: Oloye, price: 1, video: "/video/oloye.mp4" },
  { image: Digital, price: 3, video: "/video/lion.mp4" },
  { image: Masked, price: 5, video: "/video/lion.mp4" },
  { image: Queen, price: 10, video: "/video/odogwu.mp4" },
  { image: Mswali, price: 15, video: "/video/mswali.mp4" },
  { image: Alhaji, price: 20, video: "/video/alhaji.mp4" },
  { image: Sarkin, price: 30, video: "/video/sarkin.mp4" },
  { image: Inkosi, price: 40, video: "/video/inkosi.mp4" },
  { image: Oloye, price: 50, video: "/video/oloye.mp4" },
  { image: Digital, price: 60, video: "/video/lion.mp4" },
  { image: Masked, price: 70, video: "/video/lion.mp4" },
  { image: Queen, price: 90, video: "/video/odogwu.mp4" },
  { image: Lion, price: 100, video: "/video/Lion.mp4" },
];

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
