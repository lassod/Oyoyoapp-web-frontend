"use client";
import { Dashboard, DashboardHeader, DashboardHeaderText } from "@/components/ui/containers";
import { Cowries } from "@/components/assets/images/icon/Cowries";
import { Reveal3 } from "@/app/components/animations/Text";
import { ManageWallet } from "@/components/dashboard/events/spray/Wallet";
import { useEffect, useState } from "react";
import { scrollToTop } from "@/lib/auth-helper";

export default function SprayOverview({ params }: any) {
  return (
    <Dashboard className='mx-auto mt-16 bg-white items-start'>
      <DashboardHeader>
        <DashboardHeaderText>Fund wallet</DashboardHeaderText>
      </DashboardHeader>
      <div className='space-y-1 mb-5'>
        <h3>Oyoyo Cowrie System</h3>
        <p>Digital currency for spraying and gifting</p>
      </div>
      <div className='grid grid-cols-1 border-t md:grid-cols-[376px,1fr] w-full gap-6'>
        <ManageWallet scrollToTop={scrollToTop} />

        <div className='space-y-6 sm:border-l sm:p-4 lg:p-6'>
          <div className='space-y-4'>
            <h4>Badge Thresholds</h4>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              {badgeThresholds.map((badge, index) => (
                <Reveal3 key={index} width='100%'>
                  <div className='border bg-gray-50 rounded-xl p-2 sm:p-3 space-y-2 shadow-sm'>
                    <div className='flex justify-between gap-4'>
                      <h6 className='font-semibold'>{badge.title}</h6>
                      <Cowries />
                    </div>
                    <div className='flex justify-between gap-4'>
                      <p>Cowries</p>
                      <h6 className='font-semibold'>{badge.cowries}</h6>
                    </div>
                    <div className='flex justify-between gap-4'>
                      <p>USD</p>
                      <h6 className='font-semibold'>{badge.usd}</h6>
                    </div>
                  </div>
                </Reveal3>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  );
}

const badgeThresholds = [
  { title: "Masked Legend", cowries: "90 - 200", usd: "$90 - $200" },
  { title: "Lion Sprayer", cowries: "150+", usd: "$150+" },
  { title: "Odogwu", cowries: "100+", usd: "$100+" },
  { title: "Digital Oracle", cowries: "70 - 120", usd: "$70 - $120" },
  { title: "Queen naira", cowries: "50 - 100", usd: "$50 - $100" },
  { title: "Oloye", cowries: "50 - 90", usd: "$50 - $99" },
  { title: "Inkosi Yenkosi", cowries: "40 - 60", usd: "$40 - $60" },
  { title: "Sarkin Gida", cowries: "30 - 49", usd: "$30 - $49" },
  { title: "Alhaji VIP", cowries: "20 - 29", usd: "$20 - $29" },
  { title: "Mswaliwa Heshima", cowries: "15 - 29", usd: "$15 - $29" },
];
