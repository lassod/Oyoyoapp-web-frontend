"use client";
import { Dashboard, DashboardHeader, DashboardHeaderText } from "@/components/ui/containers";
import { Button } from "@/components/ui/button";
import { SkeletonCard2, SkeletonDemo } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reveal3 } from "@/app/components/animations/Text";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Calendar, Eye, MapPin, RefreshCcw, Share2, Users, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/charts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetUserSpray } from "@/hooks/spray";
import { useEffect, useState } from "react";
import { Empty } from "@/components/ui/table";
import { formatDatetoTime } from "@/lib/auth-helper";

export default function SprayOverview({ params }: any) {
  const { id } = params;
  const { data: sprayData, status } = useGetUserSpray("spray-dashboard");
  const { data: sprayStats } = useGetUserSpray("spray-statistics");
  const router = useRouter();
  const [events, setEvents] = useState<any>([]);
  const [tab, setTab] = useState("Upcoming");

  useEffect(() => {
    if (sprayData?.upcomingEvents?.list?.length > 0 && tab === "Upcoming") setEvents(sprayData?.upcomingEvents?.list);
  }, [sprayData, tab]);

  const walletSummaries = [
    {
      label: "Total Events",
      value: sprayData?.events?.total,
      note: `+${sprayData?.events?.lastMonth || 0} from last month`,
    },
    {
      label: "Total Sprayed",
      value: `${sprayStats?.wallet?.symbol} ${sprayStats?.totalSprayed?.toLocaleString() || 0}`,
      // value: sprayData?.totalSprayed?.cowries?.formatted,
      note: "Across all events",
    },
    {
      label: "Upcoming Events",
      value: sprayData?.upcomingEvents?.count,
      note: `Next: ${sprayData?.upcomingEvents?.list?.[0]?.title || "--"} (${sprayData?.upcomingEvents?.list?.[0]?.formattedDate})`,
    },
  ];

  if (status !== "success") return <SkeletonCard2 />;
  return (
    <Dashboard className='mx-auto mt-16 bg-white items-start'>
      <DashboardHeader>
        <DashboardHeaderText>Spray Dashboard</DashboardHeaderText>
        <div className='flex gap-2 items-center'>
          <Share2 className='w-5 h-5' />
          <Button className='mr-0 gap-2' variant='secondary' onClick={() => router.push("fund-wallet")}>
            <Eye className='w-5 h-5' /> Demo
          </Button>
          <Button className='mr-0 gap-2' variant='secondary' onClick={() => router.push("fund-wallet")}>
            <RefreshCcw className='w-5 h-5' /> Convert Cowrie
          </Button>
          <Button className='mr-0 gap-2' onClick={() => router.push("fund-wallet")}>
            <Wallet className='w-5 h-5' /> Request Payout
          </Button>
        </div>
      </DashboardHeader>
      <div className='space-y-1 mb-5'>
        <h3>Event Spray Dashboard</h3>
        <p>Access and track your event spray details</p>
      </div>
      <div className='grid grid-cols-1 w-full md:grid-cols-3 gap-4'>
        {walletSummaries.map((item, index) => (
          <div key={index} className='p-2 md:p-4 space-y-2 rounded-md border'>
            <p>{item.label}</p>
            <h3>{item.value.toLocaleString() || "--"}</h3>
            <Badge variant={item?.label === "Total Events" ? "text-success" : "text-gray"}>{item.note}</Badge>
          </div>
        ))}
      </div>

      <div className='grid w-full mt-4 grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='md:col-span-2 sm:border rounded-md space-y-4 sm:p-4'>
          <h4>Your events</h4>
          <Tabs defaultValue={tab} onValueChange={setTab}>
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
                  {status !== "success" ? (
                    <SkeletonDemo number={3} />
                  ) : events?.length > 0 ? (
                    events?.map((event: any, index: number) => (
                      <Reveal3 key={index} width='100%'>
                        <div className='border rounded-md p-4 space-y-2'>
                          <h6>{event?.title}</h6>
                          <div className='text-sm text-gray-500 flex justify-between flex-wrap gap-2'>
                            <span className='flex items-center gap-1'>
                              <Calendar className='w-4 h-4' /> {formatDatetoTime(event.date)}
                            </span>
                            <span className='flex items-center gap-1'>
                              <MapPin className='w-4 h-4' />
                              Eko Hotel & Suites, Lagos
                              {/* <MapPin className='w-4 h-4' /> {event.location} */}
                            </span>
                            <span className='flex items-center gap-1'>
                              <Users className='w-4 h-4' /> {event?.attendees || 0} Attendees
                              {/* <Users className='w-4 h-4' /> {event.attendees} Attendees */}
                            </span>
                          </div>
                          <div className='flex justify-between pt-6 items-center'>
                            <h5 className={cn("flex  gap-2 items-center", item === "Upcoming" && "mx-auto")}>
                              Electronic Spraying:
                              {item !== "Past" ? (
                                <Switch />
                              ) : (
                                <Badge variant={event?.status === "Enabled" ? "success" : "destructive"}>
                                  {event?.status || "Disabled"}
                                </Badge>
                              )}
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
                    ))
                  ) : (
                    <Empty title='No events yet' />
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className='sm:border rounded-md space-y-3 sm:p-4'>
          <h4>Spraying Statistics</h4>
          <Select>
            <SelectTrigger className='max-w-[150px]'>
              <SelectValue placeholder='Last 7 days' />
            </SelectTrigger>
            <SelectContent>
              {["Last 7 days", "Last 14 days", "Last 30 days", "Last 90 days"].map((option: any, index: number) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className='space-y-4 pt-5'>
            <ChartContainer config={chartConfig} className='min-h-[400px] w-full'>
              <BarChart accessibilityLayer data={chartData}>
                <XAxis
                  dataKey='day'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  className='text-sm text-gray-600'
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  className='text-sm text-gray-600'
                  tickFormatter={(value) => {
                    if (value >= 1000000) {
                      return `${value / 1000000}M`;
                    }
                    if (value >= 1000) {
                      return `${value / 1000}k`;
                    }
                    return value.toString();
                  }}
                  domain={[0, 100]}
                  ticks={[0, 10, 50, 100]}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [`${value}M`, name === "completed" ? "Completed" : "Remaining"]}
                      labelFormatter={(label) => `${label}`}
                    />
                  }
                />
                <Bar dataKey='completed' stackId='a' fill='var(--color-completed)' radius={[0, 0, 4, 4]} />
                <Bar dataKey='remaining' stackId='a' fill='var(--color-remaining)' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
            <div className='mt-4 text-center'>
              <p className='text-sm font-medium text-gray-700'>Days</p>
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  );
}

const tabItems = ["Upcoming", "Live now", "Past"];

const chartData = [
  {
    day: "Mon",
    completed: 12,
    remaining: 58,
  },
  {
    day: "Tue",
    completed: 22,
    remaining: 68,
  },
  {
    day: "Wed",
    completed: 8,
    remaining: 42,
  },
  {
    day: "Thur",
    completed: 15,
    remaining: 55,
  },
  {
    day: "Fri",
    completed: 7,
    remaining: 43,
  },
  {
    day: "Sat",
    completed: 20,
    remaining: 65,
  },
  {
    day: "Sun",
    completed: 13,
    remaining: 57,
  },
];

const chartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(180, 83%, 37%)",
  },
  remaining: {
    label: "Remaining",
    color: "hsl(210, 20%, 90%)",
  },
};
