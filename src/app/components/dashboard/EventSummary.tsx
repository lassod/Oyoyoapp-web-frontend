"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  CalendarDays,
  Loader2,
  MapPinIcon,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useGetUserBookmarks, usePostBookmark } from "@/hooks/bookmark";
import { useGetUser } from "@/hooks/user";
import { useGetUserFollowing, usePostFollow } from "@/hooks/follow";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { formSchemaComment } from "@/app/components/schema/Forms";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteComment, usePostComment } from "@/hooks/comment";
import { SkeletonDemo } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { formatDate2, handleShare } from "@/lib/auth-helper";
import { useGetEventComments } from "@/hooks/guest";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { JoinSpray } from "@/components/dashboard/events/SprayFeature";
import { useGetSprayRoom } from "@/hooks/spray";

export const EventSummary = ({ event, category, guest, name }: any) => {
  const [isSpray, setIsSpray] = useState<any>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const { data: userBookmarks } = useGetUserBookmarks();
  const { data: user } = useGetUser();
  const { data: room } = useGetSprayRoom(event?.id);
  const { mutate: toggleBookmark } = usePostBookmark();
  const { mutation: toggleFollow } = usePostFollow();
  const { mutate: postComment, isPending: isLoading } = usePostComment();
  const { mutate: deleteComment, isPending: isDel } = useDeleteComment();
  const { data: eventComments, status } = useGetEventComments(event?.id);
  const { data: following } = useGetUserFollowing();
  const [comments, setComments] = useState<any>([]);
  const [showAllComments, setShowAllComments] = useState(false);
  const { toast } = useToast();

  console.log(room);
  console.log(event);
  useEffect(() => {
    const isBookmarkedByUser = userBookmarks?.some(
      (bookmark: any) => bookmark.eventId === event?.id
    );
    setIsBookmarked(isBookmarkedByUser);
  }, [userBookmarks, event]);

  const handleBookmarkToggle = () => {
    if (!user)
      return toast({
        variant: "destructive",
        title: "An error occured!.",
        description: "Please Login to Bookmark this event",
      });
    toggleBookmark(event?.id, {
      onSuccess: () => {
        setIsBookmarked((prev: any) => !prev);
      },
    });
  };

  useEffect(() => {
    if (eventComments) setComments(eventComments);
  }, [eventComments]);

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
    if (!user)
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
      comment: values.comment,
      Users: {
        avatar: user?.avatar,
        first_name: user?.first_name,
        last_name: user?.last_name,
      },
    };

    postComment(
      {
        userId: user?.id,
        eventId: event?.id,
        comment: values.comment,
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

  const onDeleteComment = (comment: any) => {
    deleteComment(
      {
        commentId: comment?.id,
      },
      {
        onSuccess: () =>
          setComments((prevComments: any) =>
            prevComments.filter((c: any) => c.id !== comment.id)
          ),
      }
    );
  };

  const displayedComments = showAllComments
    ? comments || []
    : (comments || []).slice(0, 5);

  return (
    <div className="bg-white p-4 rounded-lg md:mt-3 md:ml-3">
      <div className="max-w-full rounded-lg overflow-hidden">
        {event?.media?.length && (
          <ViewImage media={event.media} guest={guest} />
        )}
      </div>
      <div className="flex flex-col gap-[20px] mt-7 border-b border-gray-200 pb-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h6>{event?.title}</h6>
            <p className="text-green-700 bg-green-100 py-1 text-sm px-2 rounded-lg">
              {event?.event_ticketing} event
            </p>
          </div>
          <div onClick={handleBookmarkToggle} className="cursor-pointer">
            {isBookmarked ? (
              <Bookmark fill="red" className="text-red-500" />
            ) : (
              <Bookmark className="text-gray-500 hover:text-red-700" />
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          {category && (
            <div>
              <p>Product Category</p>
              <h6>{category?.name}</h6>
            </div>
          )}
          {/* {event?.completed && event?.isSprayingEnabled && (
            <Button onClick={() => setIsSpray(event)}>Spray Room </Button>
          )} */}
        </div>
        <div className="flex flex-col gap-4 lg:gap-10 flex-wrap lg:flex-row justify-stretch">
          {event?.Event_Plans &&
            event?.Event_Plans.map((item: any) => (
              <div key={item.name}>
                <p>{item.name}</p>
                <h6>
                  {item.symbol} {item.price.toLocaleString()}
                </h6>
              </div>
            ))}
        </div>

        <div>
          <p>Description</p>
          <p className="text-black">{formatDescription(event?.description)}</p>
        </div>
        <div className="flex flex-col gap-3.5">
          <span className="flex gap-3 items-center text-[14px] font-medium">
            <div className="bg-red-100 p-1.5 rounded-lg">
              <CalendarDays className="h-[20px] w-[20px] text-red-700" />
            </div>
            {formatDate2(event?.date, event?.is24hours)}
          </span>
          <span className="flex gap-3 items-center text-[14px] font-medium">
            <div className="bg-red-100 p-1.5 rounded-lg">
              <MapPinIcon className="h-[20px] w-[20px] text-red-700" />
            </div>
            {event?.address === "undefined" ? "Online" : event?.address}
          </span>
          <div className="avatar flex items-center gap-2">
            <span className="flex">
              {event?.Event_Attendees?.slice(0, 3).map(
                (attendee: any, index: number) => (
                  <Image
                    key={index}
                    className="w-[24px] rounded-full h-[24px]"
                    src={attendee?.User?.avatar || "/noavatar.png"}
                    width={100}
                    height={100}
                    alt={`Avatar ${index}`}
                  />
                )
              )}
            </span>
            <p className="text-[11px]">
              +{event?.Event_Attendees?.length || 0} is going
            </p>
          </div>
          <span className="flex flex-wrap gap-3 items-center text-[14px] font-medium">
            <Image
              className="w-[32px] rounded-full h-[32px]"
              src={event?.User?.avatar || "/noavatar.png"}
              width={100}
              height={100}
              alt="Avatar"
            />
            <div>
              <p className="text-black">
                {event?.User?.first_name} {event?.User?.last_name}
              </p>
              <p>Event host</p>
            </div>
            <div className="cursor-pointer">
              {isFollowed ? (
                <button
                  disabled={toggleFollow.isPending}
                  onClick={() => handleFollowToggle("unfollow")}
                  className="ml-8 disabled:opacity-50 text-red-700 bg-red-100 border border-red-100 hover:border-red-700 py-1 text-sm px-2 rounded-lg"
                >
                  Following
                </button>
              ) : (
                <button
                  disabled={toggleFollow.isPending}
                  onClick={() => handleFollowToggle("follow")}
                  className="ml-8 disabled:opacity-50 text-red-700 bg-red-100 border border-red-100 hover:border-red-700 py-1 text-sm px-2 rounded-lg"
                >
                  Follow
                </button>
              )}
            </div>
          </span>
          <Button
            onClick={() => handleShare(event)}
            variant={"secondary"}
            className="w-fit"
          >
            Share event
          </Button>
        </div>
      </div>

      {status !== "success" && name !== "invite" ? (
        <SkeletonDemo />
      ) : (
        <div className="flex flex-col gap-5 mt-5">
          <div className="flex items-center justify-between gap-4">
            <h4>Comments({comments?.length || 0})</h4>
            {comments?.length > 4 && (
              <p
                onClick={() => setShowAllComments((prev) => !prev)}
                className="text-red-700 cursor-pointer hover:underline"
              >
                {showAllComments ? "See Some" : "See All"}
              </p>
            )}
          </div>
          {comments?.length > 0 &&
            displayedComments?.map((comment: any) => (
              <div className="flex flex-col gap-4 pb-5 border-b border-gray-200">
                <div className="flex gap-3 items-center w-full">
                  <Image
                    src={comment?.Users?.avatar || "/noavatar.png"}
                    alt="zac"
                    width={100}
                    height={100}
                    className="h-[40px] w-[40px] rounded-full"
                  />
                  <p className="text-black font-medium">
                    {comment?.Users?.first_name} {comment?.Users?.last_name}
                  </p>
                </div>
                <p className="leading-normal">{comment?.comment}</p>
                <div className="flex items-end justify-end">
                  <span className="flex gap-4">
                    {/* <PenLine className='w-5 cursor-pointer hover:text-red-700 h-5 text-gray-600' /> */}
                    {user && user?.id === comment?.userId && (
                      <button disabled={isDel}>
                        <Trash2
                          onClick={() => onDeleteComment(comment)}
                          className="w-5 cursor-pointer hover:text-gray-700 h-5 text-red-700"
                        />
                      </button>
                    )}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col lg:flex-row gap-2 items-center mt-5"
        >
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem className="mt-4 w-full">
                <Textarea
                  placeholder="Enter comment"
                  className="h-20 w-full"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={isLoading}
            type="submit"
            className="mr-0 mt-4 lg:m-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Send message"
            )}
          </Button>
        </form>
      </Form>

      <JoinSpray data={isSpray} setData={setIsSpray} />
    </div>
  );
};

export const formatDescription = (text: any) => {
  if (!text) return "";
  return text.split("\n").map((line: any, index: number) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));
};

const ViewImage = ({ media, guest }: any) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = () => {
    if (slideIndex < media.length - 1)
      setSlideIndex((prevIndex) => prevIndex + 1);
  };

  const prevSlide = () => {
    console.log(slideIndex);
    if (slideIndex > 0) setSlideIndex((prevIndex) => prevIndex - 1);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 10000);

    return () => clearInterval(interval);
  }, [slideIndex]);

  return (
    <section
      className={`relative h-[350px] overflow-hidden ${
        guest ? "sm:h-[550px]" : "sm:h-[450px]"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        src={media[slideIndex]}
        alt="Image"
        className=" h-full w-full object-fill"
        width={1000}
        height={1000}
      />

      {isHovered && media?.length > 1 && (
        <div className="flex lg:px-2 absolute top-[50%] w-full justify-between right-0 left-0">
          <button
            className="text-white disabled:opacity-20 bg-black rounded-full hover:text-gray-300 disabled:text-gray-400"
            onClick={prevSlide}
            disabled={slideIndex === 0}
          >
            <ChevronLeft className="w-8 md:w-12 h-8 md:h-12" />
          </button>
          <button
            className="text-white disabled:opacity-20 bg-black rounded-full hover:text-gray-300 disabled:text-gray-400"
            onClick={nextSlide}
            disabled={slideIndex === media.length - 1}
          >
            <ChevronRight className="w-8 md:w-12 h-8 md:h-12" />
          </button>
        </div>
      )}
    </section>
  );
};
