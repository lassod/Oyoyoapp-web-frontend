"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, MapPinIcon, CalendarDays, Loader2 } from "lucide-react"; // Replace with your icons
import Image from "next/image";
import { usePostBookmark, useGetUserBookmarks } from "@/hooks/bookmark";
import { formatDate, shortenText } from "@/lib/auth-helper";
import { useGetUserAttendingEvents, usePostEventViews } from "@/hooks/events";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";

const EventCard = ({ item, setEvent, guest = false, isFetching, guestId = null }: any) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarks, setBookmarks] = useState<any[]>([]); // State to hold all bookmarks
  const { data: attending } = useGetUserAttendingEvents();
  const { data: userBookmarks } = useGetUserBookmarks();
  const { data: session } = useSession();
  const { mutate: toggleBookmark } = usePostBookmark();
  const { toast } = useToast();
  const { mutation } = usePostEventViews();
  const router = useRouter();

  useEffect(() => {
    if (userBookmarks) setBookmarks(userBookmarks);
  }, [userBookmarks]);

  useEffect(() => {}, [attending]);

  const handleEventClick = (data: any) => {
    setEvent(data);
    mutation.mutate({ eventId: data?.id, guestId: guestId ? guestId : null });
    if (guest) router.push("/guest/view");
    if (item?.UserId === session?.user?.id) router.push("/dashboard/events/edit-event");
    else {
      if (attending && attending?.length > 0) {
        const isAttending = attending?.filter((item: any) => item?.id === data?.id);
        if (isAttending?.length) router.push("/dashboard/events/completed");
        else router.push("/dashboard/events/view");
      } else router.push("/dashboard/events/view");
    }
  };

  useEffect(() => {
    if (bookmarks.length > 0) {
      const isBookmarkedByUser = bookmarks.some((bookmark: any) => bookmark.eventId === item.id);
      setIsBookmarked(isBookmarkedByUser);
    }
  }, [bookmarks, item]);

  const handleBookmarkToggle = () => {
    if (!session?.user?.id)
      return toast({
        variant: "destructive",
        title: "An error occured!.",
        description: "Please Login to Bookmark this event",
      });
    toggleBookmark(item.id, {
      onSuccess: () => {
        setIsBookmarked((prev) => !prev);
      },
    });
  };

  return (
    <div className='relative bg-gray-50 border border-transparent hover:border-black w-full p-0 rounded-lg overflow-hidden'>
      <div
        onClick={() => handleEventClick(item)} // Use the dynamic path
        className='bg-black cursor-pointer relative w-full h-[200px] overflow-hidden'
      >
        <div className='overflow-hidden relative w-full h-full'>
          <Image
            src={item?.media[0] || "/default-event-image.jpg"} // Add default image if none exists
            alt='Event'
            className='absolute inset-0 w-full max-h-[300px] object-cover'
            width={400}
            height={400}
          />
        </div>
        <p className='absolute flex gap-1 items-center text-[10px] opacity-80 top-4 right-4 bg-gray-200 text-black px-1 p-[2px] align-center rounded-lg'>
          {isFetching ? <Loader2 className='w-2 h-2 animate-spin' /> : item?._count?.views || 0} views
        </p>
      </div>
      <div className='relative grid grid-cols-4 justify-between px-3 py-5 bg-gray-50'>
        <div className='flex gap-[20px] col-span-3'>
          <Image
            src={item?.User?.avatar || "/noavatar.png"}
            alt='Avatar'
            className='h-[37px] w-[37px] rounded-full'
            width={37}
            height={37}
          />

          <div className='w-[190px] flex flex-col gap-2'>
            {/* <h5 className='text-[13px] font-[500]'>{highlightMatch(item?.title, searchQuery)}</h5> */}
            <h6 className='text-[13px] font-[500]'>{shortenText(item?.title, 40)}</h6>
            <span className='flex gap-2 text-[12px] font-[400]'>
              <CalendarDays className='h-[14px] w-[14px]' />
              {formatDate(item?.date)}
            </span>
            <span className='flex gap-2 text-[12px] font-[400]'>
              <MapPinIcon className='h-[14px] w-[14px]' />
              {item?.address === "undefined" || item?.address === "Online" ? "Virtual" : shortenText(item?.address, 20)}
            </span>
            <div className='avatar flex items-center gap-2'>
              <span className='flex'>
                {item?.Event_Attendees?.slice(0, 3).map((attendee: any, index: number) => (
                  <Image
                    key={index}
                    className='w-[20px] rounded-full h-[20px]'
                    src={attendee?.User?.avatar || "/noavatar.png"}
                    width={100}
                    height={100}
                    alt={`Avatar ${index}`}
                  />
                ))}
              </span>
              <p className='text-[11px]'>+{item?.Event_Attendees?.length || 0} is going</p>
            </div>
          </div>
        </div>
        <div className='flex justify-end'>
          <div onClick={handleBookmarkToggle} className='cursor-pointer'>
            {isBookmarked ? <Bookmark fill='red' className='text-red-500' /> : <Bookmark className='text-gray-500' />}
          </div>
        </div>
      </div>
    </div>
  );
};

export const EventCard2 = ({ item, value, setEvent, guest = false, setEventData, isFetching, searchQuery }: any) => {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarks, setBookmarks] = useState<any[]>([]); // State to hold all bookmarks
  const { data: attending } = useGetUserAttendingEvents();
  const { data: userBookmarks } = useGetUserBookmarks();
  const { mutate: toggleBookmark } = usePostBookmark();
  const { mutation } = usePostEventViews();

  useEffect(() => {
    if (userBookmarks) setBookmarks(userBookmarks);
  }, [userBookmarks]);

  // Check if the event is bookmarked by the current user
  useEffect(() => {
    if (bookmarks.length > 0) {
      const isBookmarkedByUser = bookmarks.some((bookmark: any) => bookmark.eventId === item.id);
      setIsBookmarked(isBookmarkedByUser);
    }
  }, [bookmarks, item]);

  const handleBookmarkToggle = () => {
    toggleBookmark(item.id, {
      onSuccess: () => setIsBookmarked((prev) => !prev),
    });
  };

  const handleEventClick = (data: any, value: string) => {
    mutation.mutate({ eventId: data?.id });
    if (guest) {
      setEventData(data);
      router.push("/guest/view");
    } else {
      setEvent(data);

      if (value === "my-events") router.push(`/dashboard/events/edit-event`);
      else if (attending && attending?.length > 0) {
        const isAttending = attending?.filter((item: any) => item?.id === data?.id);
        if (isAttending?.length) router.push("/dashboard/events/completed");
        else router.push("/dashboard/events/view");
      } else router.push("/dashboard/events/view");
    }
  };

  return (
    <div className='relative w-full border border-transparent hover:border-black p-0 rounded-lg overflow-hidden'>
      <div className='relative grid grid-cols-4 justify-between px-3 py-5 bg-gray-50'>
        <div className='flex gap-[20px] col-span-3'>
          <Image
            src={item?.User?.avatar || "/noavatar.png"}
            alt='Avatar'
            className='h-[37px] object-cover w-[37px] rounded-full'
            width={37}
            height={37}
          />

          <div className='w-[190px] flex flex-col gap-2'>
            <h5 className='text-[13px] max-w-[160px] truncate font-[500]'>
              {highlightMatch(item?.title, searchQuery)}
            </h5>
            <span className='flex gap-2 text-[12px] font-[400]'>
              <CalendarDays className='h-[14px] w-[14px]' />
              {formatDate(item?.date)}
            </span>
            <span className='flex gap-2 text-[12px] font-[400]'>
              <MapPinIcon className='h-[14px] w-[14px]' />
              {item?.address === "undefined" || item?.address === "Online" ? "Virtual" : shortenText(item?.address, 15)}
            </span>
            <div className='avatar flex items-center gap-2'>
              <span className='flex'>
                {item?.Event_Attendees?.slice(0, 3).map((attendee: any, index: number) => (
                  <Image
                    key={index}
                    className='w-[20px] rounded-full h-[20px]'
                    src={attendee?.User?.avatar || "/noavatar.png"}
                    width={100}
                    height={100}
                    alt={`Avatar ${index}`}
                  />
                ))}
              </span>
              <p className='text-[11px]'>+{item?.Event_Attendees?.length || 0} is going</p>
            </div>
          </div>
        </div>
        <div className='flex justify-end'>
          <div onClick={handleBookmarkToggle} className='cursor-pointer'>
            {isBookmarked ? <Bookmark fill='red' className='text-red-500' /> : <Bookmark className='text-gray-500' />}
          </div>
        </div>
      </div>
      <div
        onClick={() => handleEventClick(item, value)}
        className='bg-black cursor-pointer relative w-full h-[200px] overflow-hidden'
      >
        <Image
          src={item?.media[0] || "/default-event-image.jpg"} // Add default image if none exists
          alt='Event'
          className='absolute inset-0 w-full h-full object-cover'
          layout='fill'
        />
        <p className='absolute flex gap-1 items-center text-[10px] opacity-80 top-4 right-4 bg-gray-200 text-black px-1 p-[2px] align-center rounded-lg'>
          {isFetching ? <Loader2 className='w-2 h-2 animate-spin' /> : item?._count?.views || 0} views
        </p>
      </div>
    </div>
  );
};

export default EventCard;

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function highlightMatch(text: string, query: string) {
  if (!text) return null;
  if (!query) return <span className='font-medium text-sm'>{shortenText(text, 40)}</span>;

  const safeQuery = escapeRegExp(query);
  const regex = new RegExp(`(${safeQuery})`, "gi");

  return text.split(regex).map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={i} className='text-red-600 font-medium text-sm'>
        {part}
      </span>
    ) : (
      <span key={i} className='font-medium text-sm'>
        {part}
      </span>
    )
  );
}
