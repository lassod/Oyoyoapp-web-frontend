"use client";
import { useGetUserFollowing, usePostFollow } from "@/hooks/follow";
import {
  ChevronRight,
  Eye,
  Heart,
  MessageCircleMore,
  Users,
  X,
  Send,
  Flame,
  Laugh,
  PartyPopper,
  ThumbsUp,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { FaTrophy } from "react-icons/fa6";
import {
  useGetEvent,
  useGetEventLeaderboard,
  useGetEventStream,
} from "@/hooks/events";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import { useParams, useRouter } from "next/navigation";
import { useGetCowrieRates, useGetWalletBalance } from "@/hooks/spray";
import { SprayCowrie } from "@/components/dashboard/events/spray/Wallet";
import { formatLargeVolume, scrollToTop } from "@/lib/auth-helper";
import { Coins } from "@/components/assets/images/icon/Coins";
import axios from "axios";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  addDoc,
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
import { db } from "@/lib/firebase-config";
import { useLiveReactions } from "@/lib/socket";

// Reaction type mapping
const REACTION_ICONS: Record<string, React.ReactNode> = {
  like: <Heart className="w-6 h-6" />,
  love: <Heart className="w-6 h-6 fill-current" />,
  fire: <Flame className="w-6 h-6" />,
  laugh: <Laugh className="w-6 h-6" />,
  clap: <span className="text-2xl">👏</span>,
  celebrate: <PartyPopper className="w-6 h-6" />,
  thumbsup: <ThumbsUp className="w-6 h-6" />,
};

// Floating reaction animation component
const FloatingReaction = ({ type, id }: { type: string; id: string }) => {
  const randomX = Math.random() * 80 - 40; // -40 to 40
  const randomDelay = Math.random() * 0.5;

  return (
    <div
      key={id}
      className="absolute bottom-20 right-4 pointer-events-none animate-float-up"
      style={{
        animationDelay: `${randomDelay}s`,
        transform: `translateX(${randomX}px)`,
      }}
    >
      <div className="text-white drop-shadow-lg opacity-90">
        {REACTION_ICONS[type] || REACTION_ICONS.like}
      </div>
    </div>
  );
};

interface StreamComment {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  text: string;
  createdAt: string;
}

export function AudienceView() {
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

  // Socket.IO and Comments State
  const [comments, setComments] = useState<StreamComment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [showReactions, setShowReactions] = useState(false);
  const [showSprayOptions, setShowSprayOptions] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<
    Array<{ id: string; type: string }>
  >([]);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

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

  // Firebase Setup for Comments
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
        const firebaseComments: StreamComment[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          firebaseComments.push({
            id: doc.id,
            userId: data.userId || "",
            username: data.username || "User",
            avatar: data.avatar || "/noavatar.png",
            text: data.message || data.text || "",
            createdAt:
              data.timestamp?.toDate?.()?.toISOString() ||
              new Date().toISOString(),
          });
        });
        setComments(firebaseComments);
      },
      (error) => {
        console.error("Comments listener error:", error);
      },
    );

    return () => unsubscribe();
  }, [id]);

  // Handle sending comment via Firebase
  const handleSendComment = async () => {
    if (!commentInput.trim() || !user) return;

    try {
      const collectionName = "spray_rooms_dev";
      const messagesRef = collection(
        db,
        collectionName,
        id.toString(),
        "messages",
      );

      await addDoc(messagesRef, {
        userId: user.id,
        username: user.username,
        avatar: user.avatar || "/noavatar.png",
        message: commentInput,
        text: commentInput, // For compatibility
        timestamp: new Date(),
      });

      setCommentInput("");
    } catch (error) {
      console.error("Error sending comment:", error);
    }
  };

  console.log("object");

  const handleLiveReaction = useCallback(
    (reaction: any) => {
      console.log("🎉 Processing reaction:", reaction);

      const reactionId = `${reaction.type}-${reaction.id}-${Date.now()}`;

      setFloatingReactions((prev) => [
        ...prev,
        { id: reactionId, type: reaction.type },
      ]);

      setTimeout(() => {
        setFloatingReactions((prev) => prev.filter((r) => r.id !== reactionId));
      }, 3000);

      if (reaction.type === "like" || reaction.type === "thumbsup") {
        setThumbsUpCount((prev) => prev + 1);
      }
    },
    [], // Empty dependencies - uses functional setState updates
  );

  // Then use the hook
  useLiveReactions({
    eventId: Number(id),
    onReaction: handleLiveReaction,
  });

  // Handle sending reaction
  const handleSendReaction = async (reactionType: string) => {
    if (!user) return;

    try {
      handleLiveReaction(reactionType);

      setShowReactions(false);
    } catch (error) {
      console.error("Error sending reaction:", error);
    }
  };

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

  // Listen for spray animations
  useEffect(() => {
    if (!id) return;

    const isProd = process.env.NODE_ENV === "production";
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

  const videoRef = useRef<HTMLDivElement>(null);

  const requestFullscreen = () => {
    const el = videoRef.current;
    if (!el) return;

    if (el.requestFullscreen) el.requestFullscreen();
    else if ((el as any).webkitRequestFullscreen)
      (el as any).webkitRequestFullscreen();
  };

  // Common reactions
  const commonReactions = [
    { emoji: "❤️", type: "like", label: "Like" },
    { emoji: "🔥", type: "fire", label: "Fire" },
    { emoji: "👏", type: "clap", label: "Clap" },
    { emoji: "😂", type: "laugh", label: "Laugh" },
    { emoji: "😍", type: "love", label: "Love" },
    { emoji: "🎉", type: "celebrate", label: "Celebrate" },
  ];

  if (status !== "success") return <SkeletonCard2 />;

  // Check if we're live on mobile (hide header when live)
  const isMobileLive = isHost || isConnected;

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
          {/* TikTok-style Fullscreen Layout */}
          <Dashboard className="fixed inset-0 max-w-screen-2xl mx-auto bg-black z-[999] overflow-hidden">
            {/* Full Video Container */}
            <div ref={videoRef} className="absolute inset-0 bg-black z-10">
              {isHost ? (
                localCameraTrack && localMicrophoneTrack ? (
                  <div className="w-full h-full relative">
                    <LocalUser
                      audioTrack={localMicrophoneTrack}
                      videoTrack={localCameraTrack}
                      cameraOn
                      micOn
                      playAudio={false}
                      playVideo
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </LocalUser>
                  </div>
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
                        className="w-full h-full relative"
                      >
                        <RemoteUser
                          user={remoteUser}
                          style={{
                            width: "100%",
                            height: "100%",
                            position: "absolute",
                            top: 0,
                            left: 0,
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    ))
                  )}
                </>
              )}
            </div>

            {/* Loading state */}
            {streamLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-[100]">
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
                className="absolute inset-0 w-full h-full object-cover pointer-events-none z-[90]"
                onEnded={() => setIsAnimation(null)}
              />
            )}

            {/* Floating Reactions */}
            {floatingReactions.map((reaction) => (
              <FloatingReaction
                key={reaction.id}
                type={reaction.type}
                id={reaction.id}
              />
            ))}

            {/* Close/Back button */}
            <button
              onClick={handleLeaveStream}
              className="absolute top-4 left-4 z-[110] p-2.5 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Top-left User Info */}
            <div className="absolute top-4 left-16 z-[110] flex gap-2 items-center">
              <div className="relative flex items-center justify-center">
                <Image
                  alt="Avatar"
                  src={event?.User?.avatar || "/noavatar.png"}
                  width={44}
                  height={44}
                  className="object-cover rounded-full border-2 border-white w-11 h-11"
                />
                {isTab && (
                  <span className="text-white bg-red-500 px-1.5 absolute -bottom-1 text-[10px] font-bold rounded-full shadow-lg">
                    LIVE
                  </span>
                )}
              </div>
              <div className="bg-black/50 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-2 border border-white/10">
                <span className="text-white font-semibold text-sm truncate max-w-[100px]">
                  {event?.User?.username}
                </span>
              </div>
            </div>

            {/* Top-right Viewer Count */}
            <div className="absolute top-4 right-4 z-[110] flex items-center gap-2">
              <div className="bg-black/50 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1.5 border border-white/10">
                <Eye className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-semibold">
                  {formatLargeVolume(remoteUsers?.length || 0)}
                </span>
              </div>
            </div>

            {/* Spray notification overlay */}
            {isAnimation && (
              <div className="flex z-[120] mx-auto p-2.5 rounded-2xl overflow-hidden left-4 top-20 justify-between absolute max-w-[300px] border border-yellow-400/30 w-fit bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md items-center gap-3 shadow-lg">
                <div className="flex gap-2 items-center">
                  <Image
                    src={user?.avatar || "/noavatar.png"}
                    alt="Avatar"
                    width={32}
                    height={32}
                    className="rounded-full object-cover border-2 border-yellow-400"
                  />
                  <div className="flex items-center gap-1.5">
                    <h6 className="text-white max-w-[100px] truncate text-sm font-semibold">
                      @{isAnimation?.response?.senderName}
                    </h6>
                    <span className="text-white/80 text-xs">sent</span>
                    <span className="text-yellow-300 text-sm font-bold">
                      {isAnimation?.response?.badge}
                    </span>
                  </div>
                </div>
                <FaTrophy className="text-yellow-400 w-5 h-5 animate-bounce" />
              </div>
            )}

            {/* TikTok-style Live Comments - Desktop (left side) */}
            <div className="hidden md:block absolute bottom-20 left-4 right-1/2 z-[110] max-w-md">
              <div
                ref={commentsContainerRef}
                className="flex flex-col-reverse gap-2 max-h-[400px] overflow-hidden"
              >
                {comments.slice(0, 12).map((comment, index) => (
                  <div
                    key={comment.id || index}
                    className={cn(
                      "flex items-start gap-2.5 animate-in slide-in-from-left duration-300",
                      index > 8 && "opacity-60",
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <Image
                      src={comment.avatar || "/noavatar.png"}
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="rounded-full object-cover flex-shrink-0 border border-white/20"
                    />
                    <div className="bg-black/60 backdrop-blur-md rounded-2xl px-4 py-2 max-w-[85%] border border-white/10">
                      <span className="text-yellow-400 text-sm font-semibold">
                        {comment.username}:{" "}
                      </span>
                      <span className="text-white text-sm">{comment.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Live Comments - Above Input */}
            <div className="md:hidden absolute bottom-20 left-0 right-16 z-[110] px-3">
              <div className="flex flex-col-reverse gap-1.5 max-h-[200px] overflow-hidden">
                {comments.slice(0, 8).map((comment, index) => (
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
                    <div className="bg-black/50 backdrop-blur-sm rounded-2xl px-3 py-1.5 max-w-[85%]">
                      <span className="text-yellow-400 text-xs font-medium">
                        {comment.username}:{" "}
                      </span>
                      <span className="text-white text-xs">{comment.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Input Area */}
            <div className="absolute bottom-0 left-0 right-0 md:right-1/2 md:max-w-md z-[110] p-4 pb-6 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
              <div className="flex items-center gap-2">
                {/* Comment Input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleSendComment();
                    }}
                    placeholder="Add a comment..."
                    className="w-full bg-white/10 backdrop-blur-md text-white placeholder-white/60 rounded-full px-4 py-2.5 text-sm border border-white/20 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                  />
                </div>

                {/* Send Button */}
                <button
                  className="p-2.5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 transition-all active:scale-90 disabled:opacity-50"
                  onClick={handleSendComment}
                  disabled={!commentInput.trim()}
                >
                  <Send className="w-5 h-5 text-white" />
                </button>

                {/* Reactions Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowReactions(!showReactions)}
                    className="p-2.5 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all active:scale-90 border border-white/20"
                  >
                    <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
                  </button>

                  {/* Reactions Popup */}
                  {showReactions && (
                    <div className="absolute bottom-14 right-0 bg-black/90 backdrop-blur-xl rounded-2xl p-3 border border-white/20 animate-in zoom-in-95 duration-200 shadow-2xl">
                      <div className="flex gap-2">
                        {commonReactions.map((reaction) => (
                          <button
                            key={reaction.type}
                            onClick={() => handleSendReaction(reaction.type)}
                            className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full transition-all active:scale-125 text-2xl"
                            title={reaction.label}
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
            <div className="absolute bottom-36 right-3 z-[110] flex flex-col gap-4">
              {/* Follow Button */}
              <button
                onClick={() =>
                  handleFollowToggle(isFollowed ? "unfollow" : "follow")
                }
                disabled={toggleFollow.isPending}
                className="relative flex flex-col items-center group"
              >
                <div className="relative">
                  <Image
                    src={event?.User?.avatar || "/noavatar.png"}
                    alt="Host"
                    width={48}
                    height={48}
                    className="rounded-full object-cover border-2 border-white shadow-lg group-hover:scale-105 transition-transform"
                  />
                  {!isFollowed && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-lg">
                      +
                    </span>
                  )}
                </div>
              </button>

              {/* Heart React */}
              <button
                onClick={() => handleSendReaction("like")}
                className="flex flex-col items-center gap-1 p-2 rounded-full transition-all active:scale-90 touch-none group"
              >
                <Heart className="w-8 h-8 text-white drop-shadow-lg group-active:fill-red-500 group-active:text-red-500 transition-all" />
                <span className="text-white text-xs font-semibold drop-shadow-lg">
                  {thumbsUpCount}
                </span>
              </button>

              {/* Comment */}
              <button className="flex flex-col items-center gap-1 p-2 rounded-full transition-all active:scale-90 touch-none">
                <MessageCircleMore className="w-8 h-8 text-white drop-shadow-lg" />
                <span className="text-white text-xs font-semibold drop-shadow-lg">
                  {comments.length}
                </span>
              </button>

              {/* Spray Button */}
              <button
                onClick={() => setShowSprayOptions(!showSprayOptions)}
                className="flex flex-col items-center gap-1 p-2 rounded-full transition-all active:scale-90 touch-none"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg">
                  <Coins />
                </div>
                <span className="text-white text-xs font-semibold drop-shadow-lg">
                  Spray
                </span>
              </button>

              {/* Share */}
              <button className="flex flex-col items-center gap-1 p-2 rounded-full transition-all active:scale-90 touch-none">
                <svg
                  className="w-8 h-8 text-white drop-shadow-lg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.06c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.56 9.31 6.88 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.88 0 1.56-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                </svg>
              </button>
            </div>

            {/* Spray Options Sheet */}
            {showSprayOptions && (
              <div className="absolute inset-0 z-[200]">
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setShowSprayOptions(false)}
                />
                {/* Sheet */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-zinc-900 to-black rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 border-t border-white/10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-bold text-xl">
                      Send a Spray
                    </h3>
                    <button
                      onClick={() => setShowSprayOptions(false)}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Cowries Balance */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full px-4 py-2 border border-yellow-400/30">
                      <Coins />
                      <span className="text-white text-sm font-semibold">
                        {wallet?.wallet?.cowrieBalance?.toLocaleString() || 0}{" "}
                        Cowries
                      </span>
                    </div>

                    <Button
                      variant="success"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      onClick={() =>
                        router.push(`/dashboard/spray/${id}/fund-wallet`)
                      }
                    >
                      Fund wallet
                    </Button>
                  </div>

                  {/* Spray Options Grid */}
                  <div className="grid grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pb-4 custom-scrollbar">
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
                          "flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                          item.price > (wallet?.wallet?.cowrieBalance || 0)
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-white/10 active:scale-95 hover:border-yellow-400/50 border border-transparent",
                        )}
                      >
                        <Image
                          src={item.image || "/placeholder.svg"}
                          width={64}
                          height={64}
                          alt="Spray"
                          className="rounded-lg"
                        />
                        <div className="flex items-center gap-1 bg-black/40 rounded-full px-2 py-1">
                          <Coins />
                          <span className="text-white text-xs font-semibold">
                            {item.price}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Dashboard>

          <SprayCowrie
            scrollToTop={scrollToTop}
            data={isSpray}
            setData={setIsSpray}
            setIsAnimation={setIsAnimation}
          />

          {/* Global Styles */}
          <style jsx global>{`
            @keyframes float-up {
              0% {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
              100% {
                opacity: 0;
                transform: translateY(-300px) scale(1.5);
              }
            }

            .animate-float-up {
              animation: float-up 3s ease-out forwards;
            }

            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }

            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 10px;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.2);
              border-radius: 10px;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.3);
            }
          `}</style>
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
