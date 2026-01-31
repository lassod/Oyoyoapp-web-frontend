"use client";
import { useGetUserFollowing, usePostFollow } from "@/hooks/follow";
import {
  ChevronRight,
  Eye,
  Heart,
  MessageCircleMore,
  X,
  Send,
  Sparkles,
  Zap,
  Crown,
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
import {
  StreamReaction,
  StreamReactionCounts,
  StreamReactionType,
  useGetStreamReactions,
  usePostStreamReaction,
  useReactionCounts,
} from "@/hooks/comment";
import {
  SPRAY_OPTIONS,
  COMMON_REACTIONS,
  FloatingReaction,
  LiveLeaderboard,
} from "./events/SprayFeature";

export function AudienceView() {
  const { id } = useParams();
  const [isFollowed, setIsFollowed] = useState(false);
  const [isAnimation, setIsAnimation] = useState<any>(null);
  const [isSpray, setIsSpray] = useState<any>(null);
  const { data: eventData, status } = useGetEvent(String(id));
  const { data: user } = useGetUser();
  const router = useRouter();
  const { data: wallet } = useGetWalletBalance();
  const { data: reactions } = useGetStreamReactions(String(id));
  const reactionCounts = useReactionCounts(reactions);
  const { mutation: toggleFollow } = usePostFollow();
  const { data: following } = useGetUserFollowing();
  const [event, setEvent] = useState<any>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: rate } = useGetCowrieRates(wallet?.wallet?.symbol);
  const { data: leaderboard } = useGetEventLeaderboard(String(id));
  const { data: streamData, isLoading: streamLoading } = useGetEventStream(
    id as string,
  );
  const [calling, setCalling] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [comments, setComments] = useState<StreamComment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [showReactions, setShowReactions] = useState(false);
  const [showSprayOptions, setShowSprayOptions] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<
    Array<{ id: string; type: StreamReactionType }>
  >([]);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const postReaction = usePostStreamReaction(String(id));
  const [localReactionBoost, setLocalReactionBoost] = useState<
    Partial<StreamReactionCounts>
  >({});

  const getReactionCount = (type: StreamReactionType) =>
    (reactionCounts[type] || 0) + (localReactionBoost[type] || 0);

  const isHost = user?.id === eventData?.UserId;
  const isConnected = useIsConnected();

  // Host-specific hooks (only enabled when isHost is true)
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(isHost);
  const { localCameraTrack } = useLocalCameraTrack(isHost);

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

  const handleLiveReaction = useCallback((reaction: StreamReaction) => {
    console.log("🎉 Processing reaction:", reaction);

    // Floating animation
    const reactionId = `${reaction.type}-${reaction.id}-${Date.now()}`;

    setFloatingReactions((prev) => [
      ...prev,
      { id: reactionId, type: reaction.type },
    ]);

    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== reactionId));
    }, 3000);

    // Increment local reaction count
    setLocalReactionBoost((prev) => ({
      ...prev,
      [reaction.type]: (prev[reaction.type] ?? 0) + 1,
    }));
  }, []);

  // Then use the hook
  useLiveReactions({
    eventId: Number(id),
    onReaction: handleLiveReaction,
  });

  // Handle sending reaction
  const handleSendReaction = (reactionType: StreamReactionType) => {
    if (!user) return;

    postReaction.mutate(
      { userId: user.id, type: reactionType },
      {
        onError: () => {
          // rollback if needed
          setLocalReactionBoost((prev) => ({
            ...prev,
            [reactionType]: Math.max((prev[reactionType] || 1) - 1, 0),
          }));
        },
      },
    );

    setShowReactions(false);
  };

  // Handle spray option selection - opens SprayCowrie modal
  const handleSpraySelection = (sprayOption: (typeof SPRAY_OPTIONS)[0]) => {
    if (sprayOption.price > (wallet?.wallet?.cowrieBalance || 0)) {
      return; // Insufficient funds
    }

    // Prepare spray data for the modal
    setIsSpray({
      ...sprayOption,
      symbol: wallet?.wallet?.symbol,
      id,
      eventId: id,
      badge: getSprayBadgeName(sprayOption.price),
    });

    // Close spray options
    setShowSprayOptions(false);
  };

  // Helper function to get spray badge name
  const getSprayBadgeName = (price: number): string => {
    const badgeMap: { [key: number]: string } = {
      0: "Custom Spray",
      1: "Oloye",
      3: "Digital Oracle",
      5: "Masked Legend",
      10: "Queen Naira",
      15: "Mswali wa Heshima",
      20: "Alhaji VIP",
      30: "Sarkin Gida",
      40: "Inkosi yenkosi",
      50: "Oloye Elite",
      60: "Digital Master",
      70: "Masked King",
      90: "Queen Supreme",
      100: "Lion Sprayer",
    };
    return badgeMap[price] || "Legend";
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

  const videoRef = useRef<HTMLDivElement>(null);

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

      {/* Stream Error / Token Expired State */}
      {streamError || tokenExpired ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/90 via-black to-black z-[150] backdrop-blur-md">
          <div className="flex flex-col items-center gap-4 p-6 sm:p-8 rounded-3xl bg-white/5 border-2 border-red-500/30 shadow-2xl max-w-md mx-4">
            {/* Error Icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative p-4 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border-2 border-red-500/30">
                <X className="w-12 h-12 sm:w-16 sm:h-16 text-red-400" />
              </div>
            </div>

            {/* Error Message */}
            <div className="text-center space-y-2">
              <h3 className="text-white text-xl sm:text-2xl font-bold tracking-wide">
                {tokenExpired ? "Stream Ended" : "Connection Lost"}
              </h3>
              <p className="text-white/70 text-sm sm:text-base max-w-sm">
                {streamError ||
                  "The live stream has ended. Thank you for watching!"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
              <Button
                onClick={handleLeaveStream}
                variant="outline"
                className="mx-auto"
              >
                <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                Go Back
              </Button>
              {!tokenExpired && (
                <Button
                  className="rounded-lg"
                  onClick={() => window.location.reload()}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Reconnect
                </Button>
              )}
            </div>

            {/* Additional Info */}
            {tokenExpired && (
              <div className="text-center mt-2">
                <p className="text-white/40 text-xs">
                  The host has ended this broadcast
                </p>
              </div>
            )}
          </div>
        </div>
      ) : !isHost && !isConnected ? (
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
          <Dashboard className="fixed inset-0 max-w-screen-2xl mx-auto bg-black z-[100] overflow-hidden">
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

            {/* Live Leaderboard - Top Left */}
            {leaderboard && leaderboard.length > 0 && (
              <LiveLeaderboard data={leaderboard} />
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
                    <div className="fixed md:absolute bottom-20 md:bottom-14 left-1/2 md:left-auto md:right-0 -translate-x-1/2 md:translate-x-0 bg-black/90 backdrop-blur-xl rounded-2xl p-3 border border-white/20 animate-in zoom-in-95 duration-200 shadow-2xl z-[200]">
                      <div className="flex gap-2">
                        {COMMON_REACTIONS.map((reaction) => (
                          <button
                            key={reaction.type}
                            onClick={() =>
                              handleSendReaction(
                                reaction.type as StreamReactionType,
                              )
                            }
                            className="flex flex-col items-center w-8 sm:w-14 h-10 sm:h-16 rounded-xl hover:bg-white/10 transition-all active:scale-110"
                          >
                            <span className="text-2xl">{reaction.emoji}</span>
                            <span className="text-xs text-white/80 font-semibold">
                              {getReactionCount(
                                reaction.type as StreamReactionType,
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right-side Action Buttons */}
            <div className="absolute bottom-36 right-3 z-[110] flex flex-col gap-3 sm:gap-4">
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
                    className="rounded-full w-8 sm:w-12 h-8 sm:h-12 object-cover sm:border-2 border-white shadow-lg group-hover:scale-105 transition-transform"
                  />
                  {!isFollowed && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full w-4 sm:w-6 h-4 sm:h-6 flex items-center justify-center text-sm font-bold shadow-lg">
                      +
                    </span>
                  )}
                </div>
              </button>

              {/* Heart React */}
              <button
                onClick={() => handleSendReaction("like")}
                className="flex flex-col items-center sm:gap-1 sm:p-2 rounded-full transition-all active:scale-90 touch-none group"
              >
                <Heart className="w-5 sm:w-8 h-5 sm:h-8 text-white drop-shadow-lg group-active:fill-red-500 group-active:text-red-500 transition-all" />
                <span className="text-white text-xs font-semibold drop-shadow-lg">
                  {getReactionCount("like")}
                </span>
              </button>

              {/* Comment */}
              <button className="flex flex-col items-center sm:gap-1 sm:p-2 rounded-full transition-all active:scale-90 touch-none">
                <MessageCircleMore className="w-5 sm:w-8 h-5 sm:h-8 text-white drop-shadow-lg" />
                <span className="text-white text-xs font-semibold drop-shadow-lg">
                  {comments.length}
                </span>
              </button>

              {/* Spray Button */}
              <button
                onClick={() => setShowSprayOptions(!showSprayOptions)}
                className="flex flex-col items-center sm:gap-1 sm:p-2 rounded-full transition-all active:scale-90 touch-none"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg">
                  <Coins />
                </div>
                <span className="text-white text-xs font-semibold drop-shadow-lg">
                  Spray
                </span>
              </button>
            </div>

            {/* Modern Spray Options Sheet */}
            {showSprayOptions && (
              <div className="absolute inset-0 z-[200]">
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
                  onClick={() => setShowSprayOptions(false)}
                />

                {/* Modern Sheet */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-zinc-900/95 via-black/95 to-black rounded-t-3xl animate-in slide-in-from-bottom duration-300 border-t-2 border-yellow-500/20 shadow-2xl max-h-[85vh] overflow-hidden">
                  {/* Header with gradient accent */}
                  <div className="sticky top-0 z-10 bg-gradient-to-b from-zinc-900 to-zinc-900/80 backdrop-blur-xl border-b border-white/5">
                    <div className="flex justify-between items-center p-5 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/20">
                          <Sparkles className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-xl">
                            Send a Spray
                          </h3>
                          <p className="text-white/50 text-xs font-medium">
                            Show your support to the host
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowSprayOptions(false)}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>

                    {/* Balance & Fund Button */}
                    <div className="px-5 pb-4 flex items-center justify-between gap-3">
                      <div className="flex-1 max-w-[230px] flex items-center gap-2.5 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 rounded-2xl px-4 py-3 border border-yellow-400/20 backdrop-blur-sm">
                        <div className="p-2 rounded-xl bg-yellow-500/20">
                          <Coins />
                        </div>
                        <div className="flex-1">
                          <p className="text-white/60 text-xs font-medium">
                            Your Balance
                          </p>
                          <div className="flex gap-2 items-center">
                            <p className="text-white text-lg font-bold">
                              {wallet?.wallet?.cowrieBalance?.toLocaleString() ||
                                0}{" "}
                            </p>
                            <span className="text-sm text-yellow-400">
                              Cowries
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="success"
                        className="bg-gradient-to-r w-auto from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0 shadow-lg shadow-green-500/20 px-6 h-full"
                        onClick={() =>
                          router.push(`/dashboard/spray/${id}/fund-wallet`)
                        }
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        Fund
                      </Button>
                    </div>
                  </div>

                  {/* Spray Options Grid with custom scrollbar */}
                  <div className="px-5 py-4 overflow-y-auto max-h-[calc(85vh-180px)]">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pb-4">
                      {SPRAY_OPTIONS.map((item, index) => {
                        const canAfford =
                          item.price <= (wallet?.wallet?.cowrieBalance || 0);
                        const isPremium = item.price >= 50;

                        return (
                          <button
                            key={index}
                            onClick={() => handleSpraySelection(item)}
                            disabled={!canAfford}
                            className={cn(
                              "relative flex flex-col items-center gap-2.5 p-3 rounded-2xl transition-all duration-200",
                              "border-2",
                              canAfford
                                ? isPremium
                                  ? "bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-yellow-500/10 border-yellow-400/30 hover:border-yellow-400/60 hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/20"
                                  : "bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border-white/10 hover:border-yellow-400/40 hover:scale-105 hover:bg-zinc-800/70"
                                : "bg-zinc-900/30 border-white/5 opacity-40 cursor-not-allowed",
                              "active:scale-95 backdrop-blur-sm",
                            )}
                          >
                            {/* Premium badge */}
                            {isPremium && canAfford && (
                              <div className="absolute -top-2 -right-2 p-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg">
                                <Crown className="w-3 h-3 text-white" />
                              </div>
                            )}

                            {/* Spray Image */}
                            <div className="relative w-full aspect-square">
                              <Image
                                src={item.image || "/placeholder.svg"}
                                fill
                                alt="Spray"
                                className={cn(
                                  "rounded-xl object-cover",
                                  canAfford && "drop-shadow-xl",
                                )}
                              />
                              {!canAfford && (
                                <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center backdrop-blur-[2px]">
                                  <div className="text-white/80 text-xs font-bold bg-black/50 px-2 py-1 rounded-full">
                                    Locked
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Price badge */}
                            <div
                              className={cn(
                                "flex items-center gap-1.5 rounded-full px-3 py-1.5 min-w-[70px] justify-center",
                                canAfford
                                  ? isPremium
                                    ? "bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border border-yellow-400/40"
                                    : "bg-black/60 border border-white/20"
                                  : "bg-black/40 border border-white/10",
                              )}
                            >
                              <Coins />
                              <span
                                className={cn(
                                  "text-sm font-bold",
                                  canAfford ? "text-white" : "text-white/40",
                                )}
                              >
                                {item.price}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer tip */}
                  <div className="sticky bottom-0 bg-gradient-to-t from-black via-black/95 to-transparent px-5 py-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-white/40 text-xs">
                      <div className="p-1.5 rounded-lg bg-white/5">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <p>
                        Premium sprays unlock exclusive animations for the host
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Dashboard>

          {/* Floating Reactions */}
          {floatingReactions.map((reaction) => (
            <FloatingReaction key={reaction.id} type={reaction.type} />
          ))}

          {/* SprayCowrie Modal - Opens when spray is selected */}
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

interface StreamComment {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  text: string;
  createdAt: string;
}
