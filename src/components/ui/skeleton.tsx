import { cn } from "@/lib/utils";
import React from "react";
import { useSidebar } from "./sidebar/sidebar";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import Logo from "@/app/components/assets/images/Oyoyo.svg";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-gray-200", className)} {...props} />;
}

function SkeletonDemo({ number = 1 }: { number?: number }) {
  return (
    <div className='w-full'>
      {[...Array(number)].map((_, idx: number) => (
        <div key={idx} className='grid gap-5 max-w-full grid-cols-[50px,1fr] p-4'>
          <Skeleton className='h-16 w-16 rounded-full' />
          <div className='space-y-2'>
            <Skeleton className='h-7' />
            <Skeleton className='h-7' />
            <Skeleton className='h-7' />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonSidebar() {
  const { state } = useSidebar();

  return (
    <div className={`flex px-4 pb-20 pt-4 flex-col gap-4 relative ${state === "collapsed" ? "w-[70px]" : "w-[240px]"}`}>
      {[...Array(12)].map((_, idx: number) => (
        <Skeleton key={idx} className='h-8 w-full rounded' />
      ))}
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className='w-full mt-4'>
      {/* Table Header Skeleton */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 py-2'>
        <Skeleton className='h-8 w-full rounded' />
        <Skeleton className='h-8 w-full rounded' />
        <Skeleton className='h-8 w-full rounded' />
        <Skeleton className='h-8 w-full rounded' />
      </div>

      {/* Table Rows Skeleton */}
      <div className='space-y-4'>
        {[...Array(6)].map((_, idx) => (
          <div key={idx} className='grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 py-2'>
            <Skeleton className='h-8 w-full rounded' />
            <Skeleton className='h-8 w-full rounded' />
            <Skeleton className='h-8 w-full rounded' />
            <Skeleton className='h-8 w-full rounded' />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkeletonTable;

function SkeletonCard1() {
  return (
    <div className='grid grid-cols-1 w-full sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 flex-wrap gap-5 overflow-hidden mt-4'>
      {[...Array(10)].map((_, idx) => (
        <div key={idx} className='flex flex-col space-y-3'>
          <Skeleton className='h-[165px] w-full rounded-xl' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-[200px]' />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonCard2() {
  return (
    <div className='px-4 grid grid-cols-1 w-full sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 flex-wrap gap-5 overflow-hidden mt-24'>
      {[...Array(10)].map((_, idx) => (
        <div key={idx} className='flex flex-col space-y-3'>
          <Skeleton className='h-[165px] w-full rounded-xl' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-[200px]' />
          </div>
        </div>
      ))}
    </div>
  );
}

const LogoLoader = ({ type }: { type?: number }) => {
  return (
    <div
      className={cn(
        "flex fixed justify-center items-center top-0 right-0 left-0 bottom-0",
        type === 2 ? "bg-white" : "bg-[#f9fafb9a]"
      )}
    >
      <div className='flex flex-col gap-2 items-center'>
        <Image src={Logo} alt='Logo' className='max-w-[200px] animate-pulse' width={500} height={500} />
        <Loader2 className='text-red-700 w-5 h-5 animate-spin' />
      </div>
    </div>
  );
};

export { Skeleton, SkeletonCard1, SkeletonSidebar, SkeletonCard2, SkeletonDemo, LogoLoader };
