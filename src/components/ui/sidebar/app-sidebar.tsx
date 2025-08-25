"use client";
import * as React from "react";
import { NavMain } from "./nav-main";
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "./sidebar";
import { SkeletonSidebar } from "../skeleton";
import Image from "next/image";
import { sidebarData } from "@/components/assets/data/dashboard";
import Logo from "@/components/assets/images/dashboard/Logo.svg";
import Logo2 from "@/components/assets/images/dashboard/Logo.png";
import { useGetAllOrders } from "@/hooks/user";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const { data: allOrders, status } = useGetAllOrders();
  const [pendingOrders, setPendingOrders] = useState(0);
  const { state } = useSidebar();

  useEffect(() => {
    if (allOrders) {
      const orders = allOrders?.filter((item: any) => item.orderStatus === "PENDING");
      setPendingOrders(orders?.length || 0);
    }
  }, [allOrders]);

  const navMainItems = sidebarData.navMain
    .filter((item) => !(session?.user?.accountType === "PERSONAL" && item.class === "bussiness"))
    .map((item) => {
      if (item.title === "Orders" && status === "success") {
        return {
          ...item,
          orders: pendingOrders,
        };
      }
      return item;
    });

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        {state !== "collapsed" ? (
          <Image src={Logo} alt='Logo' />
        ) : (
          <Image src={Logo2} className='w-7 ml-[2px] object-cover h-7' alt='Logo' />
        )}
      </SidebarHeader>
      {status !== "success" ? (
        <SkeletonSidebar />
      ) : (
        <SidebarContent className='pt-0'>
          <NavMain items={navMainItems} />
          <div className='mt-5'>
            <NavMain type='Sales Channel' items={sidebarData.sales} />
          </div>
        </SidebarContent>
      )}
    </Sidebar>
  );
}
