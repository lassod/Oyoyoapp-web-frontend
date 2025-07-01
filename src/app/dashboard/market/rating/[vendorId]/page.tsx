"use client";
import { useGetVendorRating, useGetVendorById } from "@/hooks/vendors";
import React, { useEffect, useState } from "react";
import { Dashboard, DashboardHeader, DashboardHeaderText } from "@/components/ui/containers";
import { FaTrophy } from "react-icons/fa6";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSession } from "next-auth/react";

const Rating = ({ params }: any) => {
  const { vendorId } = params;
  const { data: session } = useSession();
  const { data: ratings, status } = useGetVendorRating(parseInt(vendorId));
  const { data: vendor, status: vendorStatus } = useGetVendorById(parseInt(vendorId));

  // Add a loading state for determining if the user is a vendor
  const [isVendor, setIsVendor] = useState(false);
  const [vendorChecked, setVendorChecked] = useState(false); // New loading state for vendor check

  useEffect(() => {
    if (vendor?.vendor?.UserId && session?.user?.id) {
      setIsVendor(vendor.vendor.UserId === session.user.id);
      setVendorChecked(true); // Mark vendor check as complete
    }
  }, [vendor, session]);

  const progressData = {
    bronze: { min: 1, max: 5, nextTier: 6 },
    silver: { min: 6, max: 15, nextTier: 16 },
    gold: { min: 16, max: 30, nextTier: 30 },
  };

  // Determine the progress value
  let progressValue = 0;
  let labelLeft = "Bronze 1"; // Default to Bronze
  let labelRight = "Silver 6"; // Default next tier is Silver
  let rankingStatus = "Bronze"; // Default ranking is Bronze

  if (ratings?.vendorRating?.successfulGigs > 0) {
    if (ratings.vendorRating.successfulGigs < progressData.silver.min) {
      // Bronze tier
      progressValue = (ratings?.vendorRating?.successfulGigs / progressData.bronze.max) * 100;
      labelLeft = "Bronze 1";
      labelRight = "Silver 6";
      rankingStatus = "Bronze";
    } else if (ratings.vendorRating.successfulGigs < progressData.gold.min) {
      // Silver tier
      progressValue =
        ((ratings?.vendorRating?.successfulGigs - progressData.silver.min) /
          (progressData.silver.max - progressData.silver.min)) *
        100;
      labelLeft = "Silver 6";
      labelRight = "Gold 16";
      rankingStatus = "Silver";
    } else if (ratings.vendorRating.successfulGigs >= progressData.gold.min) {
      // Gold or Diamond tier
      progressValue =
        ratings?.vendorRating?.successfulGigs >= progressData.gold.nextTier
          ? 100
          : (ratings?.vendorRating?.successfulGigs / progressData.gold.nextTier) * 100;
      labelLeft = "Gold 16";
      labelRight = ratings?.vendorRating?.successfulGigs >= progressData.gold.nextTier ? "Diamond 30+" : "";
      rankingStatus = ratings?.vendorRating?.successfulGigs >= progressData.gold.nextTier ? "Diamond" : "Gold";
    }
  }

  if (status !== "success" || vendorStatus !== "success") return <SkeletonCard2 />;

  return (
    <Dashboard className='relative mx-auto mt-16'>
      <DashboardHeader>
        <DashboardHeaderText>Tier details</DashboardHeaderText>
      </DashboardHeader>

      <div className='flex flex-col gap-7 max-w-[577px]'>
        <span className='flex flex-col gap-3'>
          <h6 className='flex items-center gap-2'>
            <FaTrophy
              fill={`${
                rankingStatus === "Diamond"
                  ? "#76A1EE"
                  : rankingStatus === "Gold"
                    ? "#FFC400"
                    : rankingStatus === "Silver"
                      ? "#C1C5B8"
                      : "#CD7F32"
              }`}
              className='w-10 h-10'
            />
            {rankingStatus} Tier
          </h6>
          <div className='flex items-center gap-[6px]'>
            <span className='flex items-center cursor-pointer hover:bg-black bg-red-700 px-4 py-1 rounded-full'>
              <p className='text-[14px] text-white font-[400] pr-2 border-r border-white'>
                {ratings?.vendorRating?.totalGigs || 0} Jobs
              </p>
              <p className='text-[14px] text-white font-[400] pl-2'>
                {ratings?.vendorRating?.completionPercentage || 0} Completion
              </p>
            </span>
            <span className='flex items-center'>
              <Star fill='#F48E2F' className='h-5 w-5 text-[#F48E2F] ml-2' />
              <p className='text-[#F48E2F] font-[500] pl-1'>{ratings?.vendorRating?.rating || 0}</p>
            </span>
          </div>
          <span className='flex flex-col gap-2'>
            <Progress value={progressValue} />

            <div className='flex justify-between text-sm text-black'>
              {labelLeft && <span>{labelLeft}</span>}
              {labelRight && <span>{labelRight}</span>}
            </div>
          </span>
        </span>

        {/* Only render Benefits and Level Requirements if vendorChecked is true */}
        {vendorChecked && isVendor && (
          <>
            <span className='flex flex-col gap-3 bg-red-700 p-4 rounded-lg'>
              <h6 className='text-white leading-none'>Benefits</h6>
              <ul className='flex flex-col gap-2 list-disc text-white pl-4 '>
                {benefits.map((item) => (
                  <li key={item}>
                    <p className='text-white'>{item}</p>
                  </li>
                ))}
              </ul>
            </span>

            <span className='flex flex-col gap-3 rounded-lg'>
              <h6 className='leading-none'>Level Requirements</h6>
              <ul className='flex flex-col gap-2 list-disc pl-[26px]'>
                {levelRequirements.map((item) => (
                  <li key={item}>
                    <p className='text-black'>{item}</p>
                  </li>
                ))}
              </ul>
            </span>
          </>
        )}

        <span className='flex flex-col gap-3'>
          <h6>Tier Rankings</h6>
          <ul className='flex flex-col gap-2'>
            {tier.map((item) => (
              <li
                key={item.text}
                className='flex gap-3 p-2 rounded-lg'
                style={{ border: `1px solid ${item.color}` }} // Apply border color dynamically here
              >
                <FaTrophy fill={item.color} className='h-5 w-5' />
                <p className='text-black'>{item.text}</p>
              </li>
            ))}
          </ul>
        </span>
      </div>
    </Dashboard>
  );
};

export default Rating;

const levelRequirements = [
  "Bronze: 1-5 jobs completed and average rating of 3.5 or higher.",
  "Silver: 6-15 jobs completed and average rating of 3.5 or higher.",
  "Gold: 16-30 jobs completed and average rating of 4.0 or higher.",
  "Diamond: 31+ jobs completed and average rating of 4.0 or higher.",
];

const benefits = [
  "Vendors get badges next to their profiles to showcase their tier. This will amplify credibility and sales 4x more than normal vendors.",
  "Diamond tier gets your brand featured on Oyoyo Event Instagram page for promotion",
];

const tier = [
  {
    color: "#CD7F32",
    text: "Bronze Tier",
  },
  {
    color: "#C1C5B8",
    text: "Silver Tier",
  },
  {
    color: "#FFC400",
    text: "Gold Tier",
  },
  {
    color: "#76A1EE",
    text: "Diamond Tier",
  },
];
