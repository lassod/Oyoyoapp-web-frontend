"use client";
import { usePathname } from "next/navigation";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "./sidebar";
import Link from "next/link";
import { LogOut } from "lucide-react";
import Logout from "@/components/dashboard/general/Logout";
import { useState } from "react";

export function NavMain({ items, type }: any) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { setOpenMobile } = useSidebar();
  const [open, setOpen] = useState(false);

  const isNavActive = (pathname: string, itemUrl: string) => {
    if (itemUrl === "/dashboard") return pathname === "/dashboard/home";
    if (itemUrl === "/dashboard/home") return pathname === "/dashboard/home";
    if (itemUrl.startsWith("/dashboard/wallet")) return pathname.startsWith("/dashboard/wallet");
    if (itemUrl.startsWith("/dashboard/events")) return pathname.startsWith("/dashboard/events");
    if (itemUrl.startsWith("/dashboard/overview")) return pathname.startsWith("/dashboard/overview");
    if (itemUrl.startsWith("/dashboard/listing")) return pathname.startsWith("/dashboard/listing");
    if (itemUrl.startsWith("/dashboard/service")) return pathname.startsWith("/dashboard/listing");
    if (itemUrl.startsWith("/dashboard/check-in")) return pathname.startsWith("/dashboard/check-in");
    return pathname === itemUrl || pathname.startsWith(itemUrl + "/");
  };

  return (
    <SidebarMenu className={`${state !== "collapsed" ? "gap-3" : "gap-[5px]"}`}>
      {state !== "collapsed" && <p className='text-xs text-left'>{type}</p>}
      {items.map((item: any) => (
        <SidebarMenuItem key={item.title}>
          {item.title === "Logout" ? (
            <div>
              {state === "collapsed" ? (
                <LogOut onClick={() => setOpen(true)} className='w-6 h-6 pl-1 ml-1 mt-2 cursor-pointer text-red-700' />
              ) : (
                <div
                  onClick={() => setOpen(true)}
                  className='flex gap-2 cursor-pointer hover:font-medium px-2 items-center text-red-700'
                >
                  <LogOut className='w-5 h-5' />
                  Logout
                </div>
              )}
            </div>
          ) : (
            <SidebarMenuButton
              onClick={() => setOpenMobile(false)}
              asChild
              tooltip={item.title}
              isActive={isNavActive(pathname, item.url)}
            >
              <Link href={item?.url}>
                <item.icon />
                <span className='text-[16px]'>{item?.title}</span>
                {item?.orders > 0 && (
                  <p className='text-green-700 bg-green-100 w-6 text-center ml-4 rounded-md'>{item?.orders}</p>
                )}
              </Link>
            </SidebarMenuButton>
          )}
        </SidebarMenuItem>
      ))}
      <Logout open={open} setOpen={setOpen} />
    </SidebarMenu>
  );
}
