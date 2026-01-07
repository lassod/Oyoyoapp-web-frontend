"use client";
import React, { useState } from "react";
import Search from "../components/dashboard/Search";
import Navbar from "../components/dashboard/Navbar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarTrigger2,
  useSidebar,
} from "@/components/ui/sidebar/sidebar";
import { AppSidebar } from "@/components/ui/sidebar/app-sidebar";
import "@fontsource/inter";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider className="grid max-w-screen-2xl min-h-screen mx-auto">
      <AppSidebar />
      <SidebarInsetWrapper>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {children}
        </LocalizationProvider>
      </SidebarInsetWrapper>
    </SidebarProvider>
  );
}

function SidebarInsetWrapper({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();

  return (
    <SidebarInset
      className={`relative bg-[#f7f7f8] overflow-hidden ${
        state !== "collapsed" ? "lg:ml-[240px]" : "lg:ml-[70px]"
      }`}
    >
      <SidebarTrigger className="fixed z-[70] pl-4 lg:hidden" />
      <SidebarTrigger2 />
      <Navbar />
      <main>{children}</main>
    </SidebarInset>
  );
}
