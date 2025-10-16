"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Settings, Search, MessageSquareMore } from "lucide-react";
import { useGetUser } from "@/hooks/user";
import { StripeNotifications } from "./settings/Notifications";
import { useSession } from "next-auth/react";
import { NotificationDropdown } from "@/components/dashboard/general/NavDropdown";

const Navbar = ({ setIsSearch, isSearch }: any) => {
  const { data: user } = useGetUser();
  const { data: session } = useSession();
  const [isNotification, setIsNotification] = useState(false);

  return (
    <header className="flex bg-white fixed top-0 left-0 right-0 mx-auto gap-4 sm:gap-6 items-center justify-end px-4 sm:px-7 h-[62px] sm:h-[72px] max-w-screen-2xl z-20 border-b border-gray-200">
      {!isSearch && (
        <div className="flex gap-3 sm:gap-5">
          {session?.stripeConnectId && <StripeNotifications />}
          <Search
            onClick={() => setIsSearch(true)}
            className="w-5 h-5 md:h-6 md:w-6 text-gray-500 hover:text-red-700 cursor-pointer"
          />
        </div>
      )}

      <Link
        href="/dashboard/settings/account"
        onClick={() => setIsSearch(false)}
      >
        <Settings className="w-5 h-5 md:h-6 md:w-6 text-gray-500 hover:text-red-700" />
      </Link>

      <NotificationDropdown open={isNotification} setOpen={setIsNotification} />

      <Link href="/dashboard/chat" onClick={() => setIsSearch(false)}>
        <MessageSquareMore className="w-5 h-5 md:h-6 md:w-6 text-gray-500 hover:text-red-700" />
      </Link>

      <Link href="/dashboard/home" onClick={() => setIsSearch(false)}>
        <Image
          src={user?.avatar || "/noavatar.png"}
          alt="Avatar"
          width={37}
          height={37}
          className="rounded-full w-[35px] h-[35px]"
        />
      </Link>
    </header>
  );
};

export default Navbar;
