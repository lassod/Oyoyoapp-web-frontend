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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Cowries } from "@/components/assets/images/icon/Cowries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { formSpray } from "@/app/components/schema/Forms";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaMoneyBill } from "react-icons/fa";
import { Reveal3 } from "@/app/components/animations/Text";
import { Badge } from "@/components/ui/badge";

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
        <h3>Oyoyo Cowrie System</h3>
        <p>Digital currency for spraying and gifting</p>
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
          <h4>Spray Money</h4>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <p>
                Your current Rank: <b className='text-red-700 lg:text-[18px]'>#15</b>
              </p>

              <FormField
                control={form.control}
                name='currency'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select currency' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='USD'>USD ($)</SelectItem>
                        <SelectItem value='NGN'>NGN (₦)</SelectItem>
                        <SelectItem value='EUR'>EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='sprayAmount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount to Spray</FormLabel>
                    <Slider max={500} step={1} value={[field.value]} onValueChange={(val) => field.onChange(val[0])} />
                    <div className='flex items-center justify-between'>
                      <p className='text-sm'>$0</p>
                      <p className='text-sm'>${field.value}</p>
                    </div>

                    <Input {...field} placeholder='0' />
                  </FormItem>
                )}
              />

              <Button className='gap-2' type='submit'>
                <FaMoneyBill className='w-5 h-5' />
                Spray now
              </Button>
            </form>
          </Form>
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
