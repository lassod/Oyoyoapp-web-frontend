"use client";
import { useGetUser } from "@/hooks/user";
import { Dashboard, DashboardHeader, DashboardHeaderText } from "@/components/ui/containers";
import { Button } from "@/components/ui/button";
import { useGetEvent } from "@/hooks/events";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reveal3 } from "@/app/components/animations/Text";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Users, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SprayOverview({ params }: any) {
  const { id } = params;
  const { data: eventData, status } = useGetEvent(id);
  const { data: user } = useGetUser();
  const router = useRouter();

  if (status !== "success") return <SkeletonCard2 />;
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
            <h3>
              {item.prefix}
              {item.value.toLocaleString()}
            </h3>
            <Badge variant={item?.label === "Wallet Balance" ? "text-success" : "text-gray"}>{item.note}</Badge>
          </div>
        ))}
      </div>

      <div className='grid w-full mt-4 grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='md:col-span-2 sm:border rounded-md space-y-4 sm:p-4'>
          <h4>Your events</h4>
          <Tabs defaultValue='Upcoming'>
            <TabsList>
              {tabItems.map((item: string) => (
                <TabsTrigger value={item} key={item}>
                  {item}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className='border-b border-gray-200 mt-2'></div>
            {tabItems.map((item) => (
              <TabsContent value={item} key={item} className='pt-3'>
                <div className='space-y-4'>
                  {events.map((event, index) => (
                    <Reveal3 key={index} width='100%'>
                      <div className='border rounded-md p-4 space-y-2'>
                        <h6>{event.title}</h6>
                        <div className='text-sm text-gray-500 flex justify-between flex-wrap gap-2'>
                          <span className='flex items-center gap-1'>
                            <Calendar className='w-4 h-4' /> {event.date}
                          </span>
                          <span className='flex items-center gap-1'>
                            <MapPin className='w-4 h-4' /> {event.location}
                          </span>
                          <span className='flex items-center gap-1'>
                            <Users className='w-4 h-4' /> {event.attendees} Attendees
                          </span>
                        </div>
                        <div className='flex justify-between pt-6 items-center'>
                          <h5 className={cn("flex  gap-2 items-center", item === "Upcoming" && "mx-auto")}>
                            Electronic Spraying:
                            <Badge variant={event?.status === "Enabled" ? "success" : "destructive"}>
                              {event.status}
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
                            <Button className='mr-0 bg-gray-100' variant='outline'>
                              Join Live
                            </Button>
                          )}
                        </div>
                      </div>
                    </Reveal3>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className='sm:border rounded-md space-y-1 sm:p-4'>
          <h4>Spraying History</h4>
          <p className='pb-3'>Your recent sprays</p>
          <div className='space-y-4'>
            {sprays.map((spray, idx) => (
              <Reveal3 width='100%' key={idx}>
                <div className='border rounded-md p-3'>
                  <div className='flex items-center justify-between text-sm text-gray-500'>
                    <p className='text-black truncate'>{spray.title}</p>
                    <span className='text-black font-semibold'>₦{spray.amount.toLocaleString()}</span>
                  </div>
                  <div className='flex mt-2 items-center justify-between text-sm text-gray-500'>
                    <p className='text-sm'>{spray.date}</p>
                    <Badge variant={spray.tag === "VIP" ? "purple" : spray.tag === "Lion" ? "yellow" : "success"}>
                      {spray.tag}
                    </Badge>
                  </div>
                </div>
              </Reveal3>
            ))}
          </div>
        </div>
      </div>
    </Dashboard>
  );
}

const tabItems = ["Upcoming", "Live now", "Past"];

const events = [
  {
    title: "Wedding Ceremony - Adebayo & Funke",
    date: "18/01/2025 - 12:00 PM",
    location: "Eko Hotel & Suites, Lagos",
    attendees: 250,
    status: "Enabled",
  },
];

const sprays = [
  {
    title: "Traditional Wedding - Emeka...",
    amount: 49000,
    date: "Jan 18, 2025",
    tag: "VIP",
  },
  {
    title: "Corporate Anniversary",
    amount: 49000,
    date: "Jan 18, 2025",
    tag: "Lion",
  },
  {
    title: "Birthday Celebration - Lami...",
    amount: 49000,
    date: "Jan 18, 2025",
    tag: "Odogwu",
  },
  {
    title: "Traditional Wedding - Emeka...",
    amount: 49000,
    date: "Jan 18, 2025",
    tag: "VIP",
  },
];

const walletSummaries = [
  {
    label: "Wallet Balance",
    value: 75100,
    prefix: "₦",
    note: "You may need to fund wallet",
  },
  {
    label: "Total Sprayed",
    value: 270000,
    prefix: "₦",
    note: "Across all events",
  },
  {
    label: "Upcoming Events",
    value: 3,
    prefix: "",
    note: "Next: Wedding Ceremony (Apr 15)",
  },
];
