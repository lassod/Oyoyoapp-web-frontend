"use client";
import React, {useEffect, useRef, useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {Settings, Search, MessageSquareMore, LogOut, Plus, ChevronDown} from "lucide-react";
import { useGetUser } from "@/hooks/user";
import { StripeNotifications } from "./settings/Notifications";
import { useSession } from "next-auth/react";
import { NotificationDropdown } from "@/components/dashboard/general/NavDropdown";
import Logout from "@/components/dashboard/general/Logout";

const Navbar = ({ setIsSearch, isSearch }: any) => {
  const { data: user } = useGetUser();
  const { data: session } = useSession();
  const [isNotification, setIsNotification] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);   // avatar + dropdown

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    const toggleDropdown = () => {
        setIsSearch(false);
        setIsDropdownOpen(prev => !prev);
    };



  return (
    <header className="flex  bg-white fixed top-0 left-0 right-0 mx-auto gap-4 sm:gap-6 items-center justify-end px-4 sm:px-7 h-[62px] sm:h-[72px] max-w-screen-2xl z-50 border-b border-gray-200">
      {!isSearch && (
        <div className="flex gap-3 sm:gap-5">
          {session?.stripeConnectId && <StripeNotifications />}
          <Search
            onClick={() => setIsSearch(true)}
            className="w-5 h-5 md:h-6 md:w-6 text-gray-500 hover:text-red-700 cursor-pointer"
          />
        </div>
      )}

      <NotificationDropdown open={isNotification} setOpen={setIsNotification} />

      <Link href="/dashboard/chat" onClick={() => setIsSearch(false)}>
        <MessageSquareMore className="w-5 h-5 md:h-6 md:w-6 text-gray-500 hover:text-red-700" />
      </Link>

      {session ? (
        <>

          <div ref={wrapperRef} className="relative">
            <div onClick={toggleDropdown} className="flex bg-gray-100 gap-2 items-center rounded-3xl p-1">
              <Image
                src={user?.avatar || "/noavatar.png"}
                alt="Avatar"
                width={37}
                height={37}
                className="rounded-full cursor-pointer w-[35px] h-[35px]"
              />
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{user?.first_name} {user?.last_name}</span>
                    <span className="text-xs text-gray-500">{user?.email}</span>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-500" />
            </div>
            {isDropdownOpen && (
              <div className="absolute min-w-[200px] md:min-w-[230px] flex flex-col gap-2 right-0 top-12 bg-white shadow-2xl rounded-xl p-4">

                  <Link href="/dashboard/events/new-event" onClick={() => setIsSearch(false)}>
                  <div

                  className='flex w-full gap-2 cursor-pointer group hover:font-medium px-3 py-2 items-center  hover:bg-gray-200 rounded transition-colors'
                >
                        <Plus className="w-5 h-5 md:h-6 md:w-6 text-gray-500 group-hover:text-red-700 " />
                                    Create event
                </div>
                  </Link>

                  <Link
                      href="/dashboard/settings/account"
                      onClick={() => setIsSearch(false)}
                  >
                      <div

                          className='flex w-full gap-2 group cursor-pointer hover:font-medium px-3 py-2 items-center  hover:bg-gray-200 rounded transition-colors'
                      >
                      <Settings className="w-5 h-5 md:h-6 md:w-6 text-gray-500 group-hover:text-red-700" />
                      Account Settings
                      </div>
                  </Link>
                  <div
                  onClick={() => {
                    setIsLogoutOpen(true);
                    setIsDropdownOpen(false);
                  }}
                  className='flex w-full gap-2 cursor-pointer hover:font-medium px-3 py-2 items-center text-red-700 hover:bg-red-50 rounded transition-colors'
                >
                  <LogOut className='w-5 h-5' />
                  Logout
                </div>
              </div>
            )}
          </div>

          <Logout open={isLogoutOpen} setOpen={setIsLogoutOpen} />
        </>
      ) : (
        <Link href="/auth/login" onClick={() => setIsSearch(false)}>
          <button className="px-4 py-2 text-sm font-medium text-white bg-red-700 hover:bg-red-800 rounded-md transition-colors">
            Sign In
          </button>
        </Link>
      )}

    </header>
  );
};

export default Navbar;
