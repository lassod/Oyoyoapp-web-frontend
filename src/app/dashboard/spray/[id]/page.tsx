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
import Hls from "hls.js";
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
import Odogwu from "@/components/assets/images/dashboard/spray/Queen Naira.png";
import Sarkin from "@/components/assets/images/dashboard/spray/Sarkin Gida.png";
import Logo from "@/components/assets/images/dashboard/Logo.png";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaTrophy } from "react-icons/fa6";
import {
  Leaderboard,
  Livechat,
  TopLeaders,
} from "@/components/dashboard/events/SprayFeature";
import { useGetEvent } from "@/hooks/events";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import {
  useGetCowrieRates,
  useGetSprayLeaderboard,
  useGetWalletBalance,
} from "@/hooks/spray";
import { Reveal3 } from "@/app/components/animations/Text";
import { SprayCowrie } from "@/components/dashboard/events/spray/Wallet";
import { scrollToTop } from "@/lib/auth-helper";

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

export default function SprayDashboard({ params }: any) {
  const { id } = params;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFollowed, setIsFollowed] = useState(false);
  const [isAnimation, setIsAnimation] = useState<any>(null);
  const [isSpray, setIsSpray] = useState<any>(null);
  const { data: eventData, status } = useGetEvent(id);
  const { data: user } = useGetUser();
  const router = useRouter();
  const { data: wallet } = useGetWalletBalance();
  const { mutation: toggleFollow } = usePostFollow();
  const { data: following } = useGetUserFollowing();
  const { data: reactions } = useGetStreamEventReactions(id);
  const [thumbsUpCount, setThumbsUpCount] = useState(0);
  const [sprayOption, setSprayOption] = useState(0);
  const [event, setEvent] = useState<any>({});
  const [thumbsDownCount, setThumbsDownCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: rate } = useGetCowrieRates(wallet?.wallet?.symbol);

  const scrollLeft = () => {
    if (scrollRef.current)
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (scrollRef.current)
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
  };

  console.log(wallet);
  console.log(rate);

  useEffect(() => {
    if (eventData) setEvent(eventData);
  }, [eventData]);

  useEffect(() => {
    if (reactions) {
      const upCount = reactions.filter(
        (reaction: any) => reaction.type === "Thumbs_Up"
      ).length;
      const downCount = reactions.filter(
        (reaction: any) => reaction.type === "Thumbs_Down"
      ).length;

      setThumbsUpCount(upCount);
      setThumbsDownCount(downCount);
    }
  }, [reactions]);

  useEffect(() => {
    if (following) {
      const follow = following?.find(
        (item: any) => item.followingId === event?.User?.id
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
      }
    );
  };

  const testHlsLink = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

  const setupHlsStream = () => {
    if (!testHlsLink || !videoRef.current) return;
    // if (!event?.externalLink || !videoRef.current) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(testHlsLink);
      // hls.loadSource(event?.externalLink);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play();
      });
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      // For Safari (Native HLS Support)
      // videoRef.current.src = event.testHlsLink;
      videoRef.current.src = event.externalLink;
      videoRef.current.addEventListener("loadedmetadata", () => {
        videoRef.current?.play();
      });
    }
  };

  useEffect(() => {
    if (testHlsLink) {
      console.log("first");
      // if (event?.externalLink) {
      setupHlsStream();
    }
  }, [event]);

  const reactionData = [
    {
      icon: Users,
      count: "20k",
    },
    {
      icon: Eye,
      count: thumbsDownCount,
    },
    {
      icon: Heart,
      count: thumbsUpCount,
    },
  ];

  const itemTab = [
    {
      title: "Live chat",
      component: <Livechat user={user} eventId={event?.id} />,
    },
    { title: "Leaderboard", component: <Leaderboard eventId={event?.id} /> },
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
          className="gap-2"
        >
          View spray dashboard
          <ChevronRight className="w-5 h-5" />
        </Button>
      </DashboardHeader>

      <Dashboard className="mx-auto bg-white mt-[45px] grid grid-cols-1 gap-0 items-start md:grid-cols-3">
        <div className="flex md:col-span-2 flex-col gap-4 sm:border-r-2">
          <div className="flex gap-4 border-b py-4 w-full justify-between items-center sm:pr-6">
            <div className="flex gap-4">
              <div className="relative flex items-center justify-center w-[50px] h-[50px]">
                <Image
                  alt="Avatar"
                  src={event?.User?.avatar || "/noavatar.png"}
                  width={300}
                  height={300}
                  className="object-cover rounded-full border-[2px] border-red-700 w-[50px] h-[50px]"
                />
                <span className="text-red-700 bg-red-50 px-2 absolute bottom-[-5px] text-xs font-medium">
                  Live
                </span>
              </div>
              <div>
                <p className="text-black font-[600]">{event?.User?.username}</p>
                <div className="flex gap-3">
                  {reactionData.map((item: any, index: number) => (
                    <p key={index} className="flex text-sm items-center gap-1">
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
                Following
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
          <div className="sm:pr-6">
            <div className="flex rounded-2xl overflow-hidden h-full bg-black flex-col">
              <div className="relative h-[300px] sm:h-[400px] md:h-[470px]">
                {isAnimation && (
                  <div className="flex z-20 mx-auto p-2 sm:p-4 rounded-xl overflow-hidden left-2 sm:left-4 top-10 justify-between absolute max-w-[400px] border border-gray-600 w-full bg-black/70 ro items-center gap-4">
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
                          {isAnimation?.response?.characterInfo?.description}{" "}
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
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  controls
                ></video>
                {isAnimation && (
                  <video
                    key={isAnimation?.video}
                    src={isAnimation?.video}
                    autoPlay
                    muted
                    playsInline
                    className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
                    onEnded={() => setIsAnimation(null)}
                  />
                )}
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

                  {/* Scrollable Spray Options */}

                  {/* <div className='overflow-hidden relative'> */}
                  <div
                    ref={scrollRef}
                    className="flex gap-4 h-[240px] overflow-y-hidden overflow-auto scroll-smooth px-3 sm:px-8 py-4"
                  >
                    {sprayOptions.map((item, index: number) => (
                      <Reveal3 width="fit-content">
                        <div
                          key={index}
                          onClick={() => setSprayOption(index)}
                          className={cn(
                            "w-[110px] md:w-[140px] cursor-pointer overflow-hidden rounded-lg flex flex-col items-center"
                          )}
                        >
                          <div
                            className={cn(
                              "relative flex items-center justify-center flex-col",
                              sprayOption === index
                                ? "bg-[#1E1F22]"
                                : "bg-transparent"
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
                            <h6 className="text-white text-center my-1">
                              {wallet?.wallet?.symbol}
                              {(item?.price * rate)?.toLocaleString()}
                            </h6>
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
                              {item.price > wallet?.wallet?.cowrieBalance && (
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
                  {/* </div> */}

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
                      <p className="text-xs md:text-[15px] text-gray-300">
                        Wallet Balance:
                      </p>
                      <h6 className="text-white text-xs md:text-[15px]">
                        {wallet?.wallet?.symbol}
                        {wallet?.wallet?.walletBalance?.toLocaleString()}
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
                    <div className="flex items-center gap-2">
                      <p className="text-gray-300 text-xs md:text-[15px]">
                        Cowries Balance:
                      </p>
                      <h6 className="text-white text-xs md:text-[15px]">
                        {wallet?.wallet?.cowrieBalance?.toLocaleString()}
                      </h6>
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

        <Tabs defaultValue="Live chat" className="w-full">
          <TabsList className="grid grid-cols-2 items-center border-b justify-center rounded-md bg-gray-100">
            {itemTab.map((item: any, index: number) => (
              <TabsTrigger
                variant={2}
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

          {itemTab.map((item: any, index: number) => (
            <TabsContent value={item?.title} key={index}>
              <TopLeaders isAnimation={isAnimation} />
              {item.component}
            </TabsContent>
          ))}
        </Tabs>
      </Dashboard>
      <SprayCowrie
        scrollToTop={scrollToTop}
        data={isSpray}
        setData={setIsSpray}
        setIsAnimation={setIsAnimation}
      />
    </>
  );
}
