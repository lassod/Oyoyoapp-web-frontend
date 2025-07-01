"use client";
import Download from "@/app/components/oyoyoLandingPage/download/Download";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import { SkeletonCard2, SkeletonDemo } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import Empty from "@/components/assets/images/dashboard/empty.svg";
import { useGetEventAnalytics } from "@/hooks/events";
import { useGetUserFollowing, usePostFollow } from "@/hooks/follow";
import { useGetGuestEvent, useGetStreamEventComments, useGetStreamEventReactions } from "@/hooks/guest";
import { Loader2, Send, Share } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { formSchemaComment } from "@/app/components/schema/Forms";
import { usePostStreamComment, usePostStreamReaction } from "@/hooks/comment";
import { useGetUser } from "@/hooks/user";
import { Input } from "@/components/ui/input";
import { handleShare } from "@/lib/auth-helper";
import Hls from "hls.js";

export default function LiveStream({ params }: any) {
  const { eventId } = params;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFollowed, setIsFollowed] = useState(false);
  const { data: user } = useGetUser();
  const { mutation: toggleFollow } = usePostFollow();
  const { data: following } = useGetUserFollowing();
  const { data: session } = useSession();
  const { toast } = useToast();
  const { data: event, status } = useGetGuestEvent(eventId, {});
  const { data: analytics } = useGetEventAnalytics(eventId);
  const [comments, setComments] = useState<any>([]);
  const { data: eventComments, status: commentStatus } = useGetStreamEventComments(event?.id);
  const { data: reactions, refetch } = useGetStreamEventReactions(event?.id);
  const [showAllComments, setShowAllComments] = useState(false);
  const { mutate: postComment, isPending: isLoading } = usePostStreamComment();
  const { mutate: postReaction, isPending: isReaction } = usePostStreamReaction();
  const [isRefetch, setIsRefetch] = useState(false);
  const [thumbsUpCount, setThumbsUpCount] = useState(0);
  const [thumbsDownCount, setThumbsDownCount] = useState(0);

  useEffect(() => {
    if (eventComments) setComments(eventComments);
  }, [eventComments]);

  useEffect(() => {
    if (isRefetch) {
      refetch();
      setIsRefetch(false);
    }
  }, [isRefetch]);

  useEffect(() => {
    if (reactions) {
      const upCount = reactions.filter((reaction: any) => reaction.type === "Thumbs_Up").length;
      const downCount = reactions.filter((reaction: any) => reaction.type === "Thumbs_Down").length;

      setThumbsUpCount(upCount);
      setThumbsDownCount(downCount);
    }
  }, [reactions]);

  console.log(event);
  console.log(reactions);
  console.log(reactions?.length);
  console.log(thumbsUpCount);
  console.log(thumbsDownCount);

  useEffect(() => {
    if (following) {
      const follow = following?.find((item: any) => item.followingId === event?.User?.id);
      if (follow) setIsFollowed(true);
      else setIsFollowed(false);
    }
  }, [following, event]);

  const handleFollowToggle = (action: string) => {
    if (!session?.user?.id)
      return toast({
        variant: "destructive",
        title: "An error occured!.",
        description: "Please Login to Follow this host",
      });
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

  const form = useForm<z.infer<typeof formSchemaComment>>({
    resolver: zodResolver(formSchemaComment),
  });

  const onSubmit = (values: z.infer<typeof formSchemaComment>) => {
    if (!user)
      return toast({
        variant: "destructive",
        title: "An error occured!.",
        description: "Please Login to comment on this event",
      });

    const comment = {
      content: values.comment,
      user: {
        avatar: user?.avatar,
        username: user?.username,
      },
    };

    postComment(
      {
        userId: user?.id,
        eventId: event?.id,
        content: values.comment,
      },
      {
        onSuccess: () => {
          setComments([comment, ...comments]);
          form.reset({
            comment: "",
          });
        },
      }
    );
  };

  const onSubmit2 = (values: z.infer<typeof formSchemaComment>) => {
    if (!user)
      return toast({
        variant: "destructive",
        title: "An error occured!.",
        description: "Please Login to comment on this event",
      });

    postReaction(
      {
        userId: user?.id,
        eventId: event?.id,
        type: values.comment,
      },
      {
        onSuccess: () => {
          setIsRefetch(true);
        },
      }
    );
  };

  console.log(event);
  console.log(event?.User);

  const displayedComments = showAllComments ? comments || [] : (comments || []).slice(0, 7);

  if (status !== "success") return <SkeletonCard2 />;
  return (
    <>
      <Header guest={true} />
      <div className='relative mx-auto mt-[120px] sm:mt-24 bg-gray-100'>
        <div className='grid grid-cols-1 px-4 items-start md:grid-cols-[1fr,30%] gap-6 relative mt-4 max-w-screen-xl sm:p-4 mx-auto'>
          <div className='flex border bg-white flex-col'>
            <div className='bg-black relative min-h-[300px] md:min-h-[500px]'>
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
            <div className='px-4 pb-10 pt-5 flex flex-col gap-4'>
              <h6>{event?.title}</h6>
              <div className='flex flex-col md:flex-row gap-6 justify-between w-full'>
                <div className='flex gap-3'>
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
                  <div className='flex flex-col gap-1'>
                    <p className='text-black font-[600]'>{event?.User?.username}</p>
                    <div className='flex gap-2'>
                      <p>{event?.User?._count?.followers || 0} followers</p>
                      <div className='cursor-pointer'>
                        {isFollowed ? (
                          <button
                            disabled={toggleFollow.isPending}
                            onClick={() => handleFollowToggle("unfollow")}
                            className='disabled:opacity-50 text-red-700 bg-red-100 border border-red-100 hover:border-red-700 py-1 text-sm px-2 rounded-lg'
                          >
                            Following
                          </button>
                        ) : (
                          <button
                            disabled={toggleFollow.isPending}
                            onClick={() => handleFollowToggle("follow")}
                            className='disabled:opacity-50 text-red-700 bg-red-100 border border-red-100 hover:border-red-700 py-1 text-sm px-2 rounded-lg'
                          >
                            Follow
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <form className='grid grid-cols-[1fr,1fr,45px,1fr] max-w-[300px] md:max-w-[400px] relative h-10 overflow-hidden items-center justify-center bg-gray-100 rounded-xl'>
                  <button
                    type='button'
                    disabled={isReaction}
                    onClick={() => onSubmit2({ comment: "Thumbs_Up" })}
                    className='flex gap-[1px] disabled:opacity-60 px-3 h-full items-center justify-center cursor-pointer hover:bg-gray-200'
                  >
                    {isReaction ? <Loader2 className='w-4 h-4 animate-spin text-white relative' /> : "👍"}
                    <span className='text-sm'>{thumbsUpCount}</span>
                  </button>

                  <button
                    type='button'
                    disabled={isReaction}
                    onClick={() => onSubmit2({ comment: "Thumbs_Down" })}
                    className='flex gap-[1px] disabled:opacity-60 px-3 h-full items-center justify-center cursor-pointer hover:bg-gray-200'
                  >
                    {isReaction ? <Loader2 className='w-4 h-4 animate-spin text-white relative' /> : "👎"}
                    <span className='text-sm'>{thumbsDownCount}</span>
                  </button>
                  <select
                    onChange={(e) => {
                      onSubmit2({ comment: e.target.value });
                    }}
                    defaultValue='🔥'
                    className='flex gap-[1px] bg-transparent w-[45px] disabled:opacity-60 h-full items-center justify-center cursor-pointer hover:bg-gray-200'
                  >
                    <option value='' disabled>
                      🔥
                    </option>
                    {Emoji.map((item) => (
                      <option key={item.name} value={item.name} className='text-lg'>
                        {item.emoji}
                      </option>
                    ))}
                  </select>

                  <div
                    onClick={() => handleShare(event, "stream")}
                    className='flex gap-1 justify-center px-5 h-full items-center cursor-pointer hover:bg-gray-200'
                  >
                    <Share className='w-4 h-4' />
                    <span className='hidden md:block text-sm'>Share</span>
                  </div>
                </form>
              </div>
              <div className='flex flex-col'>
                <p>{analytics?.views || 0} views</p>
                <p>{event?.description}</p>
              </div>
            </div>
          </div>
          <div className='flex flex-col border overflow-hidden bg-white rounded-xl'>
            <h6 className='bg-gray-200 p-4'>Live chat</h6>

            {commentStatus !== "success" ? (
              <SkeletonDemo />
            ) : (
              <div className='flex flex-col gap-5 p-4'>
                <div className='flex items-center justify-end'>
                  {comments?.length > 6 && (
                    <p
                      onClick={() => setShowAllComments((prev) => !prev)}
                      className='text-red-700 cursor-pointer hover:underline'
                    >
                      {showAllComments ? "See Some" : "See All"}
                    </p>
                  )}
                </div>
                {comments?.length > 0 ? (
                  displayedComments?.map((comment: any) => (
                    <div className='flex gap-2'>
                      <Image
                        src={comment?.user?.avatar || "/noavatar.png"}
                        alt='zac'
                        width={100}
                        height={100}
                        className='h-[40px] w-[40px] rounded-full'
                      />
                      <div className='flex flex-col gap-[2px] pb-4 border-b w-full'>
                        <p className='text-black font-medium'>{comment?.user?.username}</p>
                        <p className='leading-normal'>{comment?.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='flex flex-col gap-2 justify-center items-center my-5'>
                    <Image src={Empty} alt='Empty' className='w-20 h-20' />
                    <p className='text-gray-500'>No comments</p>
                  </div>
                )}
              </div>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='flex relative justify-center gap-2 items-center border-t px-4 py-10'
              >
                <FormField
                  control={form.control}
                  name='comment'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <Input placeholder='Enter comment' className='bg-gray-100 w-full' {...field} />
                      <FormMessage className='absolute top-[10px]' />
                    </FormItem>
                  )}
                />
                <button
                  disabled={isLoading}
                  type='submit'
                  className='bg-red-700 rounded-full flex items-center justify-centers p-[7px] hover:bg-red-600 h-8 w-8'
                >
                  {isLoading ? (
                    <Loader2 className='w-4 h-4 animate-spin text-white relative' />
                  ) : (
                    <Send className='text-white relative' />
                  )}
                </button>
              </form>
            </Form>
          </div>
        </div>
      </div>
      <Download className='md:top-0' />
      <Footer className='top-[50px] md:top-[100px]' />
    </>
  );
}

const Emoji = [
  { name: "Fire", emoji: "🔥" },
  { name: "Sparkling_Heart", emoji: "💖" },
  { name: "Heart_Eyes", emoji: "😍" },
  { name: "Party_Popper", emoji: "🎉" },
];
