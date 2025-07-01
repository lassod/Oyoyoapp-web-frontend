"use client";
import { useGetUserFollowing, usePostFollow } from "@/hooks/follow";
import { useGetStreamEventReactions } from "@/hooks/guest";
import { ChevronRight, Eye, Heart, MessageCircleMore, Users } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useGetUser } from "@/hooks/user";
import Hls from "hls.js";
import { Dashboard, DashboardHeader, DashboardHeaderText } from "@/components/ui/containers";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Cowries } from "@/components/assets/images/icon/Cowries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaTrophy } from "react-icons/fa6";
import { Leaderboard, Livechat, TopLeaders } from "@/components/dashboard/events/SprayFeature";
import { useGetEvent } from "@/hooks/events";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useGetEventSpray } from "@/hooks/spray";

export default function SprayDashboard({ params }: any) {
  const { id } = params;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFollowed, setIsFollowed] = useState(false);
  const { data: eventData, status } = useGetEvent(id);
  const { data: user } = useGetUser();
  const router = useRouter();
  const { mutation: toggleFollow } = usePostFollow();
  const { data: following } = useGetUserFollowing();
  const { data: reactions } = useGetStreamEventReactions(id);
  const { data: leaderboard } = useGetEventSpray("spraying/leaderboard", id);
  const [thumbsUpCount, setThumbsUpCount] = useState(0);
  const [sprayOption, setSprayOption] = useState(0);
  const [event, setEvent] = useState<any>({});
  const [thumbsDownCount, setThumbsDownCount] = useState(0);

  console.log(leaderboard);

  useEffect(() => {
    if (eventData) setEvent(eventData);
  }, [eventData]);

  useEffect(() => {
    if (reactions) {
      const upCount = reactions.filter((reaction: any) => reaction.type === "Thumbs_Up").length;
      const downCount = reactions.filter((reaction: any) => reaction.type === "Thumbs_Down").length;

      setThumbsUpCount(upCount);
      setThumbsDownCount(downCount);
    }
  }, [reactions]);

  useEffect(() => {
    if (following) {
      const follow = following?.find((item: any) => item.followingId === event?.User?.id);
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

  // const testHlsLink = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

  const setupHlsStream = () => {
    // if (!testHlsLink || !videoRef.current) return;
    if (!event?.externalLink || !videoRef.current) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      // hls.loadSource(testHlsLink);
      hls.loadSource(event?.externalLink);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play();
      });
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      // For Safari (Native HLS Support)
      videoRef.current.src = event.testHlsLink;
      // videoRef.current.src = event.externalLink;
      videoRef.current.addEventListener("loadedmetadata", () => {
        videoRef.current?.play();
      });
    }
  };

  useEffect(() => {
    // if (testHlsLink) {
    if (event?.externalLink) {
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

  const sprayOptions = [
    { title: "Odogwu", price: "$100+" },
    { title: "Oloye", price: "$50+" },
    { title: "Sarkin-Gida", price: "$30+" },
    { title: "Alhaji", price: "$20+" },
    { title: "Lion", price: "$150+" },
    { title: "Queen naira", price: "$50+" },
  ];

  const itemTab = [
    { title: "Live chat", component: <Livechat user={user} eventId={event?.id} /> },
    { title: "Leaderboard", component: <Leaderboard eventId={event?.id} /> },
  ];

  if (status !== "success") return <SkeletonCard2 />;
  return (
    <>
      <DashboardHeader>
        <DashboardHeaderText>Live Stream</DashboardHeaderText>
        <Button
          onClick={() => router.push(`/dashboard/spray/${id}/overview`)}
          variant='link-red'
          size='no-padding'
          className='gap-2'
        >
          View spray dashboard
          <ChevronRight className='w-5 h-5' />
        </Button>
      </DashboardHeader>

      <Dashboard className='mx-auto bg-white mt-[45px] grid grid-cols-1 gap-0 items-start md:grid-cols-[1fr,30%]'>
        <div className='flex flex-col gap-4 sm:border-r-2'>
          <div className='flex gap-4 border-b py-4 w-full justify-center items-center sm:pr-6'>
            <div className='flex gap-4'>
              <div className='relative flex items-center justify-center w-[50px] h-[50px]'>
                <Image
                  alt='Avatar'
                  src={event?.User?.avatar || "/noavatar.png"}
                  width={300}
                  height={300}
                  className='object-cover rounded-full border-[2px] border-red-700 w-[50px] h-[50px]'
                />
                <span className='text-red-700 bg-red-50 px-2 absolute bottom-[-5px] text-xs font-medium'>Live</span>
              </div>
              <div>
                <p className='text-black font-[600]'>{event?.User?.username}</p>
                <div className='flex gap-3'>
                  {reactionData.map((item: any, index: number) => (
                    <p key={index} className='flex text-sm items-center gap-1'>
                      <item.icon className='w-4 h-4' />
                      {item.count}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {isFollowed ? (
              <Button className='mr-0' disabled={toggleFollow.isPending} onClick={() => handleFollowToggle("unfollow")}>
                Following
              </Button>
            ) : (
              <Button className='mr-0' disabled={toggleFollow.isPending} onClick={() => handleFollowToggle("follow")}>
                Follow
              </Button>
            )}
          </div>
          <div className='sm:pr-6'>
            <div className='flex rounded-2xl overflow-hidden bg-black flex-col'>
              <div className='relative min-h-[300px] md:min-h-[500px]'>
                <video ref={videoRef} className='w-full h-full' controls></video>
                {/* <div className='h-[50px] p-4 flex gap-2 items-center justify-between bg-black'>
                <button onClick={isStreaming ? stopStreaming : startStreaming}>
                  {isStreaming ? (
                    <Pause className='text-white hover:text-red-700 w-5 h-5 cursor-pointer' />
                  ) : (
                    <Play className='text-white hover:text-red-700 w-5 h-5 cursor-pointer' />
                  )}
                </button>
                <button onClick={toggleFullscreen}>
                  <Maximize className='text-white hover:text-red-700 w-5 h-5 cursor-pointer' />
                </button>
              </div> */}
              </div>
              <div className='px-4 flex flex-col gap-4'>
                <Carousel>
                  <div className='absolute z-[1] top-[50%] w-full flex items-center'>
                    <CarouselPrevious className='left-[-8px] sm:left-[-18px]' />
                    <CarouselNext className=' right-[-8px] sm:right-[-18px]' />
                  </div>
                  <CarouselContent className='flex mt-4 relative gap-4 pb-4'>
                    <div className='flex gap-4 overflow-x-auto'>
                      {sprayOptions.map((item, index: number) => (
                        <CarouselItem key={index} className='max-w-[160px] pb-4'>
                          <div
                            onClick={() => setSprayOption(index)}
                            className={cn(
                              "flex flex-col p-2 hover:bg-[#1E1F22] items-center cursor-pointer justify-center rounded-md w-full",
                              sprayOption === index ? "bg-[#1E1F22]" : "bg-transparent"
                            )}
                          >
                            <div className='bg-[#b49c5d] w-full rounded-lg p-4 flex flex-col gap-4 items-center justify-center'>
                              <span className='text-black font-medium'>{item.title}</span>
                              <Cowries />
                            </div>
                            <h6 className='text-white my-1'>{item.price}</h6>
                          </div>

                          {sprayOption === index && (
                            <button className='bg-red-600 hover:opacity-90 w-full text-white py-1.5 text-sm font-semibold rounded-b-md'>
                              Spray
                            </button>
                          )}
                        </CarouselItem>
                      ))}
                    </div>
                  </CarouselContent>
                </Carousel>

                <div className='border-t px-4 py-6 flex justify-between border-gray-600'>
                  <div className='flex items-center gap-2'>
                    <p className='text-gray-300'>Wallet Balance:</p>
                    <h6 className='text-white'> {} 75.00</h6>
                    <Button className='ml-2 text-red-600 bg-transparent border border-red-600 '>Fund wallet</Button>
                  </div>
                  <div className='flex items-center gap-2'>
                    <p className='text-gray-300'>Your current Rank:</p>
                    <h6 className='text-white'>#15</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue='Live chat' className='w-full'>
          <TabsList className='grid grid-cols-2 items-center border-b justify-center rounded-md bg-gray-100'>
            {itemTab.map((item: any, index: number) => (
              <TabsTrigger variant={2} className='flex items-center gap-2' key={index} value={item?.title}>
                {item?.title === "Live chat" ? (
                  <MessageCircleMore className='w-5 h-5' />
                ) : (
                  <FaTrophy className='w-5 h-5' />
                )}
                {item?.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {itemTab.map((item: any, index: number) => (
            <TabsContent value={item?.title} key={index}>
              <TopLeaders />
              {item.component}
            </TabsContent>
          ))}
        </Tabs>
      </Dashboard>
    </>
  );
}
