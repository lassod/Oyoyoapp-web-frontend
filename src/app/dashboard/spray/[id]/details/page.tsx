"use client";
import { useEffect, useState } from "react";
import { useGetUser } from "@/hooks/user";
import { Dashboard, DashboardHeader, DashboardHeaderText } from "@/components/ui/containers";
import { Button } from "@/components/ui/button";
import { useGetEvent } from "@/hooks/events";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Cowries } from "@/components/assets/images/icon/Cowries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { formSpray } from "@/app/components/schema/Forms";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaMoneyBill, FaTrophy } from "react-icons/fa";
import { Reveal3 } from "@/app/components/animations/Text";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { TableContainer } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function SprayOverview({ params }: any) {
  const { id } = params;
  const { data: eventData, status } = useGetEvent(id);
  const { data: user } = useGetUser();
  const [event, setEvent] = useState<any>({});

  const form = useForm<z.infer<typeof formSpray>>({
    resolver: zodResolver(formSpray),
    defaultValues: {
      currency: "USD",
      sprayAmount: 0,
    },
  });

  const onSubmit = (values: z.infer<typeof formSpray>) => {};

  useEffect(() => {
    if (eventData) setEvent(eventData);
  }, [eventData]);

  const cowrieBalance = 75;

  if (status !== "success") return <SkeletonCard2 />;
  return (
    <Dashboard className='mx-auto mt-16 bg-white items-start'>
      <DashboardHeader>
        <DashboardHeaderText>Fund wallet</DashboardHeaderText>
      </DashboardHeader>
      <div className='space-y-1 mb-5'>
        <h3>Leaderboard</h3>
        <p>See who's spraying the most at this event</p>
      </div>
      <div className='grid grid-cols-1 border-t md:grid-cols-[376px,1fr] w-full gap-6'>
        <div className='space-y-6 py-6'>
          <div className='bg-red-700 p-4 lg:p-6 rounded-xl'>
            <div className='flex items-center justify-between bg-white/20 rounded-md border p-2 sm:px-4'>
              <span className='font-medium text-white'>Oyoyo Cowrie Wallet</span>
              <Cowries bg1='#EE4963' bg2='#BE1732' />
            </div>
            <div className='flex my-4 justify-between items-center mt-2'>
              <div>
                <h6 className='text-white font-bold'>{cowrieBalance}.00</h6>
                <p className='text-white text-sm font-[300]'>Available Cowries</p>
              </div>
              <div className='h-[30px] border border-white'></div>
              <div>
                <h6 className='text-white font-bold'>#{cowrieBalance * 1000}</h6>
                <p className='text-white text-sm font-[300]'>Wallet Balance</p>
              </div>
            </div>
            <div>
              <div className='flex mb-2 justify-between gap-6 items-center'>
                <p className='text-sm text-white font-[300]'>
                  Current Tier: <b>Tier 3</b>
                </p>
                <p className='text-sm text-white font-[300]'>Next Tier: 26 more</p>
              </div>
              <Progress indicatorClassName='bg-green-600' value={(cowrieBalance / 100) * 100} />
            </div>
          </div>

          <Tabs defaultValue='Add Funds'>
            <TabsList>
              {tabItems.map((item: any) => (
                <TabsTrigger value={item?.title} key={item?.title}>
                  {item?.title}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className='border-b border-gray-200 mt-2'></div>
            {tabItems.map((item) => (
              <TabsContent value={item.title} key={item.title} className='pt-3'>
                {item.component}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className='space-y-6 border-l sm:p-4 lg:p-6'>
          <div className='space-y-2'>
            <h4>Your Spraying Statistics</h4>
            <p>Track your contributions and ranking</p>
            <div className='grid grid-cols-1 sm:grid-cols-3 pt-5 gap-4'>
              {stats.map((stat, index) => (
                <div key={index} className='border space-y-1 p-2 md:p-4 rounded-md'>
                  <p className='text-sm text-gray-500'>{stat.label}</p>
                  <Reveal3 width='100%'>
                    <h3 className='text-lg font-bold'>{stat.value}</h3>
                  </Reveal3>
                </div>
              ))}
            </div>
          </div>

          <div className='space-y-2 rounded-md sm:border sm:p-4'>
            <h4>Top Sprayers</h4>
            <p>Showing top sprayers for: Birthday Celebration</p>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5'>
              {topSprayers.map((sprayer, i) => (
                <div key={i} className='border p-4 rounded-md flex flex-col items-center justify-center gap-1'>
                  <FaTrophy
                    className={cn(
                      "h-5 w-5",
                      sprayer?.badge === "Masked Legend"
                        ? "text-green-500"
                        : sprayer?.badge === "Odogwu"
                          ? "text-red-500"
                          : "text-amber-500"
                    )}
                  />
                  <p className='font-medium text-black'>{sprayer.name}</p>
                  <p className='text-sm'>
                    <b className='text-black'>{sprayer.cowries}</b> cowries
                  </p>
                  <Reveal3 width='100%'>
                    <Badge
                      variant={
                        sprayer?.badge === "Masked Legend"
                          ? "success"
                          : sprayer?.badge === "Odogwu"
                            ? "destructive"
                            : "yellow"
                      }
                    >
                      {sprayer.badge}
                    </Badge>
                  </Reveal3>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className='space-y-4'>
            <h4>Leaderboard</h4>

            <TableContainer
              searchClassName='mb-0 rounded-ee-none rounded-es-none'
              isSearch
              searchPlaceHolder='Search sprayers...'
              columns={LeaderboardCol}
              data={[]}
            />
          </div>
        </div>
      </div>
    </Dashboard>
  );
}

const LeaderboardCol: ColumnDef<any>[] = [
  {
    accessorKey: "rank",
    header: "Rank",
    cell: ({ row }) => <p>{row.getValue("rank")}</p>,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <p>{row.getValue("name")}</p>,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => <p>{row.getValue("amount")}</p>,
  },
  {
    accessorKey: "badge",
    header: "Badge",
    cell: ({ row }) => <p>{row.getValue("badge")}</p>,
  },
];

const stats = [
  { label: "Your Rank", value: "#15" },
  { label: "Total Sprayed", value: "₦35,000" },
  { label: "Sprays Made", value: "1" },
];

const AddFunds = () => {
  return (
    <div className='p-4 border rounded-md space-y-4'>
      <span className='font-semibold'>Buy Cowries</span>
      <div className='grid grid-cols-2 gap-2 md:gap-4'>
        {[5, 10, 20, 50].map((amt) => (
          <Button key={amt} variant='outline' size='lg' className='flex-col items-start gap-1'>
            {amt} <p className='text-xs text-gray-500'>${amt}.00</p>
          </Button>
        ))}
      </div>
      <div className='border-t pt-4'>
        <span>Buy Cowries</span>
        <div className='space-y-1 mt-3 mb-6'>
          <p className='text-sm text-black'>Custom Amount</p>
          <Input type='number' placeholder='10' />
          <p className='text-xs'>1 Cowrie + $1.00</p>
        </div>
        <Button>Fund Cowrie</Button>
        <Button variant='link-red' className='text-sm mt-1'>
          Convert from Wallet Balance
        </Button>
      </div>
    </div>
  );
};

const History = () => {
  return (
    <div className='p-4 border rounded-md space-y-3'>
      <span className='font-semibold'>Transaction History</span>
      <div>
        {transactions.map((tx, index) => (
          <div key={index} className={`py-3 ${index !== transactions.length - 1 ? "border-b" : ""}`}>
            <p>{tx.title}</p>
            <div className='flex items-center justify-between gap-4'>
              <p className='text-sm'>{tx.date}</p>
              <Badge
                className='font-semibold'
                variant={tx?.amount.startsWith("-") ? "text-destructive" : "text-success"}
              >
                {tx?.amount?.toLocaleString()}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const topSprayers = [
  {
    name: "Chinedu Okonkwo",
    cowries: 250,
    badge: "Masked Legend",
  },
  { name: "Amina Ibrahim", cowries: 175, badge: "Lion Sprayer" },
  { name: "David Adeleke", cowries: 120, badge: "Odogwu" },
];

const transactions = [
  {
    title: "Added Funds",
    date: "May 8, 2025, 10:45 AM",
    amount: "+25",
    type: "credit",
  },
  {
    title: "Sprayed at presh pa...",
    date: "May 8, 2025, 10:45 AM",
    amount: "-25",
    type: "debit",
  },
];

const tabItems = [
  {
    title: "Add Funds",
    component: <AddFunds />,
  },
  {
    title: "History",
    component: <History />,
  },
];
