"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";
import { Settings, Search, Bell } from "lucide-react";
import { useGetUser } from "@/hooks/user";
import { StripeNotifications } from "./settings/Notifications";
import { useSession } from "next-auth/react";
import { NotificationDropdown } from "@/components/dashboard/general/NavDropdown";
import { useGetNotificationsAll } from "@/hooks/notification";

const Navbar = ({ setIsSearch, isSearch }: any) => {
  const { data: user } = useGetUser();
  const { data: session } = useSession();
  const [isNotification, setIsNotification] = useState(false);
  const { data: notificationsData } = useGetNotificationsAll();
  const [unread, setUnread] = useState(0);

  // useEffect(() => {
  //   if (notificationsData?.length > 0) {
  //     const unreadNotifications = notificationsData.filter((notification: any) => !notification.read);
  //     setUnread(unreadNotifications.length);
  //   }
  // }, [notificationsData]);

  console.log(notificationsData);
  return (
    <header className='flex bg-white fixed top-0 left-0 right-0 mx-auto gap-4 sm:gap-6 items-center justify-end px-4 sm:px-7 h-[62px] sm:h-[72px] max-w-screen-2xl z-20 border-b border-gray-200'>
      {headerData.map((header: any, index: number) => (
        <Link href={header.url} key={index}>
          {header.id === "avatar" ? (
            <Image
              src={user?.avatar || "/noavatar.png"}
              alt='Avatar'
              width={37}
              height={37}
              className='rounded-full w-[35px] h-[35px]'
            />
          ) : header.id === "notification" ? (
            <div onClick={() => setIsNotification(true)} className='relative'>
              {notificationsData && notificationsData?.length > 0 && (
                <div className='text-white rounded-full absolute top-[-12px] left-[-2px] w-4 flex items-center justify-center text-[11px] h-4 bg-red-600'>
                  {notificationsData?.length || 0}
                </div>
              )}
              {/* {unread > 0 && (
                <div className='text-white rounded-full absolute top-[-12px] left-[-2px] w-4 flex items-center justify-center text-[11px] h-4 bg-red-600'>
                  {unread}
                </div>
              )} */}
              <Bell className='text-gray-500 cursor-pointer hover:text-red-700' />
            </div>
          ) : header.id === "search" ? (
            !isSearch && (
              <div className='flex gap-3 sm:gap-5'>
                {session?.stripeConnectId && <StripeNotifications />}

                <header.icon
                  onClick={() => setIsSearch(true)}
                  className={`${header.class} w-5 h-5 md:h-6 md:w-6 text-gray-500 hover:text-red-700`}
                />
              </div>
            )
          ) : (
            <header.icon
              onClick={() => setIsSearch(false)}
              className={`${header.class} w-5 h-5 md:h-6 md:w-6 text-gray-500 hover:text-red-700`}
            />
          )}
        </Link>
      ))}
      <NotificationDropdown open={isNotification} setOpen={setIsNotification} />
    </header>
  );
};

export default Navbar;

const headerData = [
  {
    url: "#",
    icon: Search,
    id: "search",
  },
  {
    url: "/dashboard/settings/account",
    icon: Settings,
  },
  {
    url: "#",
    icon: Bell,
    id: "notification",
  },
  // {
  //   url: "/dashboard/support/chat",
  //   icon: MessageSquareMore,
  // },
  {
    url: "/dashboard/home",
    icon: Avatar,
    id: "avatar",
  },
];
