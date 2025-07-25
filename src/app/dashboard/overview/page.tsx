"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dashboard } from "@/components/ui/containers";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { OverviewPage } from "@/app/components/business/overviewData/OverviewData";
import { useGetUserDashSetup } from "@/hooks/user";
import { FaCheckCircle } from "react-icons/fa";
import { useGetVendorShop } from "@/hooks/shop";
import { useGetVendorByUserId } from "@/hooks/guest";
import { useGetOnboardingStatus } from "@/hooks/wallet";

const DashboardPage = () => {
  const navigation = useRouter();
  const { data: session, status } = useSession();
  const { data: user, status: userStatus } = useGetUserDashSetup(
    session?.user?.id
  );
  const { data: vendor } = useGetVendorByUserId(session?.user?.id);
  const { data: shop } = useGetVendorShop(vendor?.id);
  const [isSetup, setIsSetup] = useState(false);
  const [isOnboard, setIsOnboard] = useState(false);
  const { data: onboardStatus } = useGetOnboardingStatus();

  useEffect(() => {
    if (onboardStatus)
      if (!onboardStatus?.onboardingStatus) setIsOnboard(true);
      else if (onboardStatus.kycRecord?.status !== "APPROVED")
        setIsOnboard(true);
  }, [onboardStatus]);

  useEffect(() => {
    if (user && shop)
      if (
        user.listService &&
        shop.id &&
        user.paymentMethod &&
        !isOnboard &&
        user.launchStore
      )
        setIsSetup(true);
  }, [user, shop]);

  const dashboardSetup = [
    {
      id: "1",
      trigger: "Set up your online store",
      title: "Add your store details",
      text: "Set your store name, currency and country",
      url: "/dashboard/service",
      button: "Set up store",
      completed: shop?.id,
    },
    {
      id: "2",
      trigger: "List a service",
      title: "Add your service",
      text: "Write a description, add photos and set pricing for the products you plan to sell",
      url: "/dashboard/service/listing/add",
      completed: user?.listService,
      button: "Add service",
    },
    {
      id: "3",
      trigger: "Set up payment method",
      title: "Add your payment details",
      text: "Add bank information and set up payment method",
      url: "/dashboard/service/payment",
      completed: user?.paymentMethod,
      button: "Set up payment method",
    },
    {
      id: "4",
      trigger: "Set up verification details",
      title: "Request for verification",
      text: "Provide personal information and request for verification",
      url: "/dashboard/service/verification",
      completed: !isOnboard,
      button: "Set up verification details",
    },
    {
      id: "5",
      trigger: "Launch your service",
      title: "Launch service",
      text: "Accept our terms of service & conditions",
      url: "/dashboard/service/launch",
      completed: user?.launchStore,
      button: "Launch service",
    },
  ];

  if (userStatus !== "success") return <SkeletonCard2 />;
  if (status === "loading") return <SkeletonCard2 />;
  if (session?.user?.accountType === "PERSONAL") {
    navigation.back(); // Redirect user back but don't render void
    return null; // Return null to render nothing while navigating
  }
  return (
    <>
      {/* {isSetup ? (
        <OverviewPage />
      ) : ( */}
      <Dashboard className="bg-white">
        <div className="max-w-[910px] xl:max-w-[1050px] w-full mx-auto flex flex-col gap-[10px] pb-20">
          <h5>Dashboard Setup</h5>
          <p>Set up your dashboard to start selling on oyoyo.</p>

          <Accordion type="single" collapsible>
            {dashboardSetup.map((item) => (
              <AccordionItem
                className="border rounded-lg border-gray-200 mb-3 p-4 [&[data-state=open]]:bg-gray-50 [&[data-state=open]>div>span]:bg-white"
                value={item.id}
                key={item.id}
              >
                <AccordionTrigger className="py-0">
                  <div className="flex gap-2 items-center">
                    {item.trigger}
                    {item.completed && (
                      <FaCheckCircle className="w-4 h-5 text-green-500" />
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4">
                  <span className="flex flex-col gap-1 box mt-3 sm:p-4 rounded-lg text-red-700">
                    <h6 className="text-black font-semibold text-lg">
                      {item.title}
                    </h6>
                    <p>{item.text}</p>
                    <Link className="mt-4" href={item.url}>
                      <Button className="m-0 w-auto">{item.button}</Button>
                    </Link>
                  </span>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Dashboard>
      {/* )} */}
    </>
  );
};

export default DashboardPage;
