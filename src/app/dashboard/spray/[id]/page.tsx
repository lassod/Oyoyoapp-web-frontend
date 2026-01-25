"use client";
import { useGetUserFollowing, usePostFollow } from "@/hooks/follow";
import { useGetStreamEventReactions } from "@/hooks/guest";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  MessageCircleMore,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
  // LocalUser, // Plays the microphone audio track and the camera video track
  RemoteUser, // Plays the remote user audio and video tracks
  useIsConnected, // Returns whether the SDK is connected to Agora's server
  useJoin, // Automatically join and leave a channel on mount and unmount
  useLocalMicrophoneTrack, // Create a local microphone audio track
  useLocalCameraTrack, // Create a local camera video track
  usePublish, // Publish the local tracks
  useRemoteUsers,
  useClientEvent,
  useRTCClient,
  LocalUser, // Retrieve the list of remote users
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
    calling && !!streamData?.streamId, // Only join if calling is true AND streamId exists
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
    },
  );

  // Handle leaving/ending stream
  const handleLeaveStream = () => {
    setCalling(false);
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
  // dd

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
    // const q = query(spraysRef, orderBy("timestamp", "asc"));

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

  if (status !== "success") return <SkeletonCard2 />;
  return (
    <>
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
          <Dashboard className="mx-auto pt-[70px] sm:pt-24 bg-white mt-[45px] grid grid-cols-1 gap-0 items-start md:grid-cols-3">
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

                    <div className="relative h-[300px] sm:h-[400px] md:h-[470px] rounded-2xl overflow-hidden">
                      <div className="w-full h-full">
                        {isHost ? (
                          // Host view - show local camera
                          <LocalUser
                            audioTrack={localMicrophoneTrack}
                            videoTrack={localCameraTrack}
                            cameraOn={true}
                            micOn={true}
                            playAudio={false}
                            playVideo={true}
                            style={{ width: "100%", height: "100%" }}
                          />
                        ) : (
                          // Audience view - show remote users
                          <>
                            {remoteUsers.length === 0 ? (
                              <div className="flex items-center justify-center h-full bg-black/80">
                                <p className="text-white">
                                  Waiting for host to go live...
                                </p>
                              </div>
                            ) : (
                              remoteUsers.map((remoteUser) => (
                                <RemoteUser
                                  key={remoteUser.uid}
                                  user={remoteUser}
                                  style={{ width: "100%", height: "100%" }}
                                />
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
                    </div>

                    {/*<div className="h-full top-0 left-0 z-10  rounded-xl"></div>*/}
                  </div>
                  {!isHost && remoteUsers.length !== 0 && (
                    <div className="flex flex-col gap-4">
                      <div className="relative">
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
                                    src={item?.image}
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
                                        item.price >
                                        wallet?.wallet?.cowrieBalance
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
                                router.push(
                                  `/dashboard/spray/${id}/fund-wallet`,
                                )
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
                  )}
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
  // { image: Odogwu, price: 90, video: "/video/odogwu.mp4" },
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
