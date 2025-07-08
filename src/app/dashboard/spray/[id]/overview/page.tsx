"use client";
import { useGetUser } from "@/hooks/user";
import { Dashboard, DashboardHeader, DashboardHeaderText } from "@/components/ui/containers";
import { Button } from "@/components/ui/button";
import { useGetEvent, useGetUserAttendingEvents } from "@/hooks/events";
import { SkeletonCard2, SkeletonDemo } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reveal3 } from "@/app/components/animations/Text";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Users, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetCowrieRates, useGetSprayDashboard, useGetSprayHistory, useGetWalletBalance } from "@/hooks/spray";
import { formatDate2, formatDatetoTime } from "@/lib/auth-helper";
import { Empty } from "@/components/ui/table";
import { useState } from "react";

export default function SprayOverview({ params }: any) {
  const { id } = params;
  const { data: wallet } = useGetWalletBalance();
  const { data: rate } = useGetCowrieRates(wallet?.wallet?.symbol);
  const { data: sprays, status: sprayStatus } = useGetSprayHistory();
  const { data: statistics } = useGetSprayDashboard();
  const { data: attending, status } = useGetUserAttendingEvents();
  const router = useRouter();
  const { upcoming, live, past } = categorizeEvents(attending || []);
  const [events, setEvents] = useState<any>(upcoming || []);

  const eventMap: Record<string, any[]> = {
    Upcoming: upcoming,
    "Live now": live,
    Past: past,
  };

  console.log(live);
  const walletSummaries = [
    {
      label: "Wallet Balance",
      value: `${wallet?.wallet?.symbol || ""}${wallet?.wallet?.walletBalance?.toLocaleString() || "0"}`,
    },
    {
      label: "Total Sprayed",
      value: `${wallet?.wallet?.symbol || ""}${statistics?.totalSprayed?.toLocaleString() || "0"}`,
      note: "Across all events",
    },
    {
      label: "Upcoming Events",
      value: statistics?.upcomingEventsCount?.toLocaleString() || "0",
      note: "Next: --",
      // note: "Next: Wedding Ceremony (Apr 15)",
    },
  ];

  // if (status !== "success") return <SkeletonCard2 />;
  return (
    <Dashboard className='mx-auto mt-16 bg-white items-start'>
      <DashboardHeader>
        <DashboardHeaderText>Spray Dashboard</DashboardHeaderText>
        <Button className='mr-0 gap-2' onClick={() => router.push("fund-wallet")}>
          <Wallet className='w-5 h-5' /> Fund wallet
        </Button>
      </DashboardHeader>
      <div className='space-y-1 mb-5'>
        <h3>Spray Room</h3>
        <p>Access and track your event spray details</p>
      </div>
      <div className='grid grid-cols-1 w-full md:grid-cols-3 gap-4'>
        {walletSummaries.map((item, index) => (
          <div key={index} className='p-2 md:p-4 space-y-2 rounded-md border'>
            <p>{item.label}</p>
            <h3>{item.value.toLocaleString()}</h3>
            {item?.label === "Wallet Balance" && (
              <Badge onClick={() => router.push(`/dashboard/spray/${id}/fund-wallet`)} variant='text-success'>
                {wallet?.wallet?.walletBalance < rate ? "You may need to fund wallet" : "Want to fund wallet?"}
              </Badge>
            )}
            {item?.label !== "Wallet Balance" && <Badge variant='text-gray'>{item.note}</Badge>}
          </div>
        ))}
      </div>

      <div className='grid w-full mt-4 grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='md:col-span-2 sm:border rounded-md space-y-4 sm:p-4'>
          <h4>Your events</h4>
          <Tabs defaultValue='Upcoming'>
            <TabsList>
              {tabItems.map((item: string) => (
                <TabsTrigger onClick={() => setEvents(eventMap[item] || [])} value={item} key={item}>
                  {item}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className='border-b border-gray-200 mt-2'></div>
            {tabItems.map((item) => (
              <TabsContent value={item} key={item} className='pt-3'>
                <div className='space-y-4'>
                  {status !== "success" ? (
                    <SkeletonDemo number={3} />
                  ) : events?.length > 0 ? (
                    events.map((event: any, index: number) => (
                      <Reveal3 key={index} width='100%'>
                        <div className='border rounded-md p-4 space-y-2'>
                          <h6 className='font-semibold'>{event?.title}</h6>
                          <div className='text-sm text-gray-500 flex flex-col gap-2 md:flex-row md:justify-between flex-wrap'>
                            <span className='flex items-center gap-1'>
                              <Calendar className='w-4 h-4' /> {formatDate2(event.date)}
                            </span>
                            <span className='flex items-center gap-1'>
                              <MapPin className='w-4 h-4' />{" "}
                              {event?.address && event?.address !== "undefined" ? event?.address : "Virtual"}
                            </span>
                            <span className='flex items-center gap-1'>
                              <Users className='w-4 h-4' /> {event?.Event_Attendees?.length || 0} Attendees
                            </span>
                          </div>
                          <div className='flex justify-between md:pt-6 items-center'>
                            <h5 className={cn("flex  gap-2 items-center", item === "Upcoming" && "mx-auto")}>
                              Electronic Spraying:
                              <Badge variant={event?.isSprayingEnabled ? "success" : "destructive"}>
                                {event.isSprayingEnabled ? "Enabled" : "Disabled"}
                              </Badge>
                            </h5>
                            {item === "Upcoming" ? null : item === "Past" ? (
                              <Button
                                onClick={() => router.push("details")}
                                className='mr-0 bg-gray-100'
                                variant='outline'
                              >
                                View Details
                              </Button>
                            ) : (
                              <Button
                                onClick={() => router.push(`/dashboard/spray/${event?.id}`)}
                                className='bg-gray-100'
                                variant='outline'
                              >
                                Join Live
                              </Button>
                            )}
                          </div>
                        </div>
                      </Reveal3>
                    ))
                  ) : (
                    <Empty title='No data yet' />
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className='sm:border rounded-md space-y-1 sm:p-4'>
          <h4>Spraying History</h4>
          <p className='pb-3'>Your recent sprays</p>
          <div className='space-y-4'>
            {sprayStatus !== "success" ? (
              <SkeletonDemo number={3} />
            ) : sprays?.length > 0 ? (
              sprays.map((spray: any, idx: number) => (
                <Reveal3 width='100%' key={idx}>
                  <div className='border rounded-md p-3'>
                    <div className='flex items-center justify-between text-sm text-gray-500'>
                      <p className='text-black truncate'>{spray.eventTitle}</p>
                      <span className='text-black font-semibold'>
                        {wallet?.wallet?.symbol}
                        {(spray.cowrieAmount * rate).toLocaleString()}
                      </span>
                    </div>
                    <div className='flex mt-2 items-center justify-between text-sm text-gray-500'>
                      <p className='text-sm'>{formatDatetoTime(spray.createdAt)}</p>
                      <Badge variant={spray.badge === "VIP" ? "purple" : spray.badge === "Lion" ? "yellow" : "success"}>
                        {spray.badge}
                      </Badge>
                    </div>
                  </div>
                </Reveal3>
              ))
            ) : (
              <Empty title='No spray history' />
            )}
          </div>
        </div>
      </div>
    </Dashboard>
  );
}

const tabItems = ["Upcoming", "Live now", "Past"];

function categorizeEvents(events: any[]) {
  const now = new Date();

  const upcoming: any[] = [];
  const live: any[] = [];
  const past: any[] = [];

  for (const event of events) {
    const start = new Date(event.date);
    const end = new Date(event.endTime);

    if (now < start) {
      upcoming.push(event);
    } else if (now >= start && now <= end) {
      live.push(event);
    } else {
      past.push(event);
    }
  }

  return { upcoming, live, past };
}
