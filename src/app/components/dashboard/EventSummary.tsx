"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  CalendarDays,
  Heart,
  Loader2,
  MapPinIcon,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useGetUserBookmarks, usePostBookmark } from "@/hooks/bookmark";
import { useGetUser } from "@/hooks/user";
import { useGetUserFollowing, usePostFollow } from "@/hooks/follow";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { formSchemaComment } from "@/app/components/schema/Forms";
import { Textarea } from "@/components/ui/textarea";
import {
  useDeleteComment,
  useDeleteReaction,
  useGetReactions,
  usePostComment,
  usePostReaction,
} from "@/hooks/comment";
import { SkeletonDemo } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { formatDate2, handleShare } from "@/lib/auth-helper";
import { useGetEventComments } from "@/hooks/guest";
import { JoinSpray } from "@/components/dashboard/events/SprayFeature";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

/* ------------------------------------------------------------------ */
/* Event Summary                                                       */
/* ------------------------------------------------------------------ */

export const EventSummary = ({ event, category, guest, name }: any) => {
  const [isSpray, setIsSpray] = useState<any>(null);

  // data hooks
  const { data: session } = useSession();
  const { data: user } = useGetUser();
  const { data: userBookmarks } = useGetUserBookmarks();
  const { data: following } = useGetUserFollowing();
  const { data: reactions } = useGetReactions(event?.id);
  const { data: eventComments, status } = useGetEventComments(event?.id);

  // mutations
  const { mutate: toggleBookmark, isPending: isBookmarking } =
    usePostBookmark();
  const { mutation: toggleFollow } = usePostFollow();
  const { mutate: postComment, isPending: isPostingComment } = usePostComment();
  const { mutate: deleteComment, isPending: isDeletingComment } =
    useDeleteComment();
  const postReaction = usePostReaction();
  const deleteReaction = useDeleteReaction();

  // local state
  const [comments, setComments] = useState<any[]>([]);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);

  // reaction local cache (for snappy UX)
  const [sparklingHeartCount, setSparklingHeartCount] = useState(0);
  const [reactionId, setReactionId] = useState<number | null>(null);

  const { toast } = useToast();

  /* ---------------------- Memoized derived values ------------------- */

  // Bookmark presence
  const isBookmarkedByUser = useMemo(() => {
    if (!userBookmarks || !event?.id) return false;
    return userBookmarks.some((b: any) => b?.eventId === event.id);
  }, [userBookmarks, event?.id]);

  // Follow presence
  const isUserFollowingHost = useMemo(() => {
    if (!following || !event?.User?.id) return false;
    return !!following.find((f: any) => f?.followingId === event.User.id);
  }, [following, event?.User?.id]);

  // Reactions breakdown
  const { myReactionId, sparklingCount } = useMemo(() => {
    let myId: number | null = null;
    let count = 0;
    if (Array.isArray(reactions) && reactions.length) {
      for (const r of reactions) {
        if (r?.reaction === "Sparkling_Heart") count++;
        if (
          r?.userId === session?.user?.id &&
          r?.reaction === "Sparkling_Heart"
        ) {
          myId = r?.id ?? null;
        }
      }
    }
    return { myReactionId: myId, sparklingCount: count };
  }, [reactions, session?.user?.id]);

  // Comments to display
  const displayedComments = useMemo(() => {
    const list = comments ?? [];
    return showAllComments ? list : list.slice(0, 5);
  }, [comments, showAllComments]);

  /* ---------------------------- Effects ----------------------------- */

  // Initialize comments when fetched
  useEffect(() => {
    if (Array.isArray(eventComments)) setComments(eventComments);
  }, [eventComments]);

  // Sync bookmark/follow with server data
  useEffect(() => {
    setIsBookmarked(isBookmarkedByUser);
  }, [isBookmarkedByUser]);

  useEffect(() => {
    setIsFollowed(isUserFollowingHost);
  }, [isUserFollowingHost]);

  // Sync reactions
  useEffect(() => {
    setSparklingHeartCount(sparklingCount);
    setReactionId(myReactionId);
  }, [sparklingCount, myReactionId]);

  /* -------------------------- Helpers ------------------------------- */

  const requireAuth = useCallback(
    (action: string) => {
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: `Please log in to ${action}.`,
        });
        return false;
      }
      return true;
    },
    [toast, user]
  );

  /* -------------------------- Handlers ------------------------------ */

  // ✅ Success-only state update for Bookmark
  const handleBookmarkToggle = useCallback(() => {
    if (!requireAuth("bookmark this event")) return;

    toggleBookmark(event?.id, {
      onSuccess: () => {
        setIsBookmarked((prev) => !prev);
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Could not update bookmark",
          description: "Please try again.",
        });
      },
    });
  }, [event?.id, requireAuth, toggleBookmark, toast]);

  // ✅ Success-only state update for Follow
  const handleFollowToggle = useCallback(
    (action: "follow" | "unfollow") => {
      if (!requireAuth(`${action} this host`)) return;

      toggleFollow.mutate(
        { userId: event?.User?.id, action },
        {
          onSuccess: () => {
            setIsFollowed((prev) => !prev);
          },
          onError: () => {
            toast({
              variant: "destructive",
              title: "Could not update follow",
              description: "Please try again.",
            });
          },
        }
      );
    },
    [event?.User?.id, requireAuth, toggleFollow, toast]
  );

  const form = useForm<z.infer<typeof formSchemaComment>>({
    resolver: zodResolver(formSchemaComment),
    defaultValues: { comment: "" },
  });

  // ✅ Success-only state update for Add Comment
  // ✅ Success-only state update for Add Comment (enrich with local user info)
  const onSubmit = useCallback(
    (values: z.infer<typeof formSchemaComment>) => {
      if (!requireAuth("comment on this event")) return;

      postComment(
        { userId: user?.id, eventId: event?.id, comment: values.comment },
        {
          onSuccess: (res: any) => {
            // API returns only the raw comment row
            const base = res?.data?.data ?? res?.data ?? res ?? null;

            // Build the shape your UI expects (Users nested object)
            const newComment = {
              ...(base ?? {
                id: `tmp-${Date.now()}`,
                userId: user?.id,
                eventId: event?.id,
                comment: values.comment,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }),
              Users: {
                avatar: user?.avatar || "/noavatar.png",
                first_name: user?.first_name ?? "",
                last_name: user?.last_name ?? "",
              },
            };

            setComments((prev) => [newComment, ...(prev ?? [])]);
            form.reset({ comment: "" });
          },
          onError: () => {
            toast({
              variant: "destructive",
              title: "Could not post comment",
              description: "Please try again.",
            });
          },
        }
      );
    },
    [
      event?.id,
      form,
      postComment,
      requireAuth,
      toast,
      user?.id,
      user?.avatar,
      user?.first_name,
      user?.last_name,
    ]
  );

  // ✅ Success-only state update for Delete Comment
  const onDeleteComment = useCallback(
    (comment: any) => {
      const targetId = comment?.id;
      if (!targetId) return;

      deleteComment(
        { commentId: targetId },
        {
          onSuccess: () => {
            setComments((prev) => prev.filter((c) => c.id !== targetId));
          },
          onError: () => {
            toast({
              variant: "destructive",
              title: "Could not delete comment",
              description: "Please try again.",
            });
          },
        }
      );
    },
    [deleteComment, toast]
  );

  // (Already success-only) Reactions
  const handleReaction = useCallback(() => {
    if (!session?.user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to react to this event.",
      });
      return;
    }

    if (reactionId) {
      deleteReaction.mutate(reactionId, {
        onSuccess: () => {
          setReactionId(null);
          setSparklingHeartCount((c) => Math.max(0, c - 1));
        },
        onError: () =>
          toast({
            variant: "destructive",
            title: "Could not remove reaction",
            description: "Please try again.",
          }),
      });
    } else {
      postReaction.mutate(
        {
          reaction: "Sparkling_Heart",
          userId: session.user.id,
          eventId: event.id,
        },
        {
          onSuccess: (res: any) => {
            const newId =
              res?.data?.data?.id ?? res?.data?.id ?? res?.id ?? null;
            if (newId) setReactionId(newId);
            setSparklingHeartCount((c) => c + 1);
          },
          onError: () =>
            toast({
              variant: "destructive",
              title: "Could not add reaction",
              description: "Please try again.",
            }),
        }
      );
    }
  }, [
    deleteReaction,
    event?.id,
    postReaction,
    reactionId,
    session?.user?.id,
    toast,
  ]);

  return (
    <div className="bg-white p-4 rounded-lg md:mt-3 md:ml-3">
      <div className="max-w-full rounded-lg overflow-hidden">
        {!!event?.media?.length && (
          <ViewImage media={event.media} guest={guest} />
        )}
      </div>

      <div className="flex flex-col gap-[20px] mt-7 border-b border-gray-200 pb-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h6>{event?.title}</h6>
            {!!event?.event_ticketing && (
              <p className="text-green-700 bg-green-100 py-1 text-sm px-2 rounded-lg">
                {event?.event_ticketing} event
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={postReaction?.isPending || deleteReaction.isPending}
              onClick={handleReaction}
              className="flex gap-1 disabled:opacity-60 h-full items-center justify-center cursor-pointer"
            >
              {postReaction?.isPending || deleteReaction.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin relative" />
              ) : (
                <Heart
                  className={cn(
                    "text-gray-500 cursor-pointer hover:fill-red-700 hover:text-red-500",
                    !!reactionId &&
                      "text-red-500 fill-red-500 hover:text-gray-500 hover:fill-none"
                  )}
                />
              )}
              <span className="text-sm">{sparklingHeartCount}</span>
            </button>

            <button
              type="button"
              disabled={isBookmarking}
              onClick={handleBookmarkToggle}
              className="cursor-pointer disabled:opacity-60"
            >
              <Bookmark
                className={cn(
                  "text-gray-500 cursor-pointer hover:fill-red-700 hover:text-red-500",
                  isBookmarked &&
                    "text-red-500 fill-red-500 hover:text-gray-500 hover:fill-none"
                )}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          {category && (
            <div>
              <p>Product Category</p>
              <h6>{category?.name}</h6>
            </div>
          )}
          {event?.completed && event?.isSprayingEnabled && (
            <Button onClick={() => setIsSpray(event)}>Join Live</Button>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:gap-10 flex-wrap lg:flex-row justify-stretch">
          {Array.isArray(event?.Event_Plans) &&
            event.Event_Plans.map((item: any) => (
              <div key={item?.id ?? item?.name}>
                <p>{item?.name}</p>
                <h6>
                  {item?.symbol} {(item?.price ?? 0).toLocaleString()}
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
            {event?.address === "undefined" || !event?.address
              ? "Online"
              : event?.address}
          </span>

          <div className="avatar flex items-center gap-2">
            <span className="flex">
              {event?.Event_Attendees?.slice(0, 3).map(
                (attendee: any, index: number) => (
                  <Image
                    key={attendee?.id ?? index}
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

          {displayedComments.map((comment: any, idx: number) => (
            <div
              key={comment?.id ?? `c-${idx}`}
              className="flex flex-col gap-4 pb-5 border-b border-gray-200"
            >
              <div className="flex gap-3 items-center w-full">
                <Image
                  src={comment?.Users?.avatar || "/noavatar.png"}
                  alt="commenter"
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
                  {user && user?.id === comment?.userId && (
                    <button
                      disabled={isDeletingComment}
                      onClick={() => onDeleteComment(comment)}
                    >
                      <Trash2 className="w-5 cursor-pointer hover:text-gray-700 h-5 text-red-700" />
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
            disabled={isPostingComment}
            type="submit"
            className="mr-0 mt-4 lg:m-0"
          >
            {isPostingComment ? (
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

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */

export const formatDescription = (text: any) => {
  if (!text) return "";
  return String(text)
    .split("\n")
    .map((line: any, index: number) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
};

/* ------------------------------------------------------------------ */
/* Image Viewer                                                        */
/* ------------------------------------------------------------------ */

const ViewImage = ({ media, guest }: { media: string[]; guest?: boolean }) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const total = media?.length ?? 0;

  const nextSlide = useCallback(() => {
    if (!total) return;
    setSlideIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (!total) return;
    setSlideIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-advance every 10s (set once, independent of slideIndex)
  useEffect(() => {
    if (!total || total < 2) return;
    const interval = setInterval(nextSlide, 10000);
    return () => clearInterval(interval);
  }, [nextSlide, total]);

  if (!Array.isArray(media) || !media.length) return null;

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
        alt="Event media"
        className="h-full w-full object-fill"
        width={1000}
        height={1000}
        priority
      />

      {isHovered && total > 1 && (
        <div className="flex lg:px-2 absolute top-[50%] w-full justify-between right-0 left-0">
          <button
            className="text-white disabled:opacity-20 bg-black rounded-full hover:text-gray-300 disabled:text-gray-400"
            onClick={prevSlide}
            disabled={total <= 1}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 md:w-12 h-8 md:h-12" />
          </button>
          <button
            className="text-white disabled:opacity-20 bg-black rounded-full hover:text-gray-300 disabled:text-gray-400"
            onClick={nextSlide}
            disabled={total <= 1}
            aria-label="Next image"
          >
            <ChevronRight className="w-8 md:w-12 h-8 md:h-12" />
          </button>
        </div>
      )}
    </section>
  );
};
