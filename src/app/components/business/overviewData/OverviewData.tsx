"use client";
import React, { useState } from "react";
import { CardWallet2 } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { LatestOrdersCol, TopPackageCol } from "../../schema/Columns";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/charts";
import { ArrowDownLeft, ArrowUp, DollarSign, ReceiptJapaneseYen, Undo2, Users, Wallet } from "lucide-react";
import { useGetUser } from "@/hooks/user";
import { useGetAllOrders, useGetVendorOrderStats } from "@/hooks/orders";
import Empty from "../../assets/images/empty.svg";
import Image from "next/image";
import { Dashboard } from "@/components/ui/containers";
import SkeletonTable from "@/components/ui/skeleton";
import { useGetVendorByUserId } from "@/hooks/guest";
import { useGetVendorServices } from "@/hooks/vendors";

export const OverviewPage = () => {
  const { data: user } = useGetUser();
  // const { data: walletStats } = useGetUserWalletStats();
  const { data: vendor } = useGetVendorByUserId(user?.id);
  const { data: orderStatistics } = useGetVendorOrderStats(vendor?.id);

  const cardData = [
    {
      title: "Total Sales",
      icon: DollarSign,
      icon2: ArrowDownLeft,
      header: orderStatistics?.totalSales || 0,
      price: "0",
      percent: "0",
    },
    {
      title: "Wallet Balance",
      icon: Wallet,
      icon2: ArrowDownLeft,
      header: user?.Wallet?.walletBalance || 0,
      symbol: user?.Wallet?.symbol,
      price: "0",
      percent: "0",
    },
    {
      title: "Average Rating",
      icon: Users,
      icon2: ArrowDownLeft,
      header: orderStatistics?.avgRating,
      price: "0",
      percent: "0",
    },
    {
      title: "Total orders",
      icon: ReceiptJapaneseYen,
      icon2: ArrowDownLeft,
      header: orderStatistics?.activeOrders,
      price: "0",
      percent: "0",
    },
    {
      title: "Refunds",
      icon: Undo2,
      icon2: ArrowDownLeft,
      header: 0,
      price: "0",
      percent: "0",
    },
  ];

  return (
    <Dashboard>
      <h2 className='text-black font-semibold text-[22px]'>Welcome, {user?.username}</h2>
      <p className='mb-2'>Here&apos;s what&apos;s happening with your store today.</p>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
        {cardData.map((item) => (
          <CardWallet2
            key={item.title}
            title={item.title}
            icon={item.icon}
            icon2={item.icon2}
            header={item.header}
            price={item.price}
            symbol={item.symbol}
            percent={item.percent}
          />
        ))}
      </div>
      <div className='overview'>
        <div className='box box1'>
          <h2>Real-Time Sale</h2>
          <div className='flex flex-col gap-2'>
            <div className='mobileChartWrapper flex items-end justify-between'>
              <div className='mobileChart flex gap-8'>
                <div className='flex flex-col'>
                  <p className='text-[12px]'>Refunded</p>
                  <div className='flex items-center gap-2'>
                    <h2 className='font-semibold text-black'>--</h2>
                    {/* <div className='flex gap-1 items-center'>
                      <div className='bg-green-400 rounded-full p-[1px] w-[14.63] h-[14.63]'>
                        <ArrowUpRight className='text-white w-[14.63px] h-[14.63px]' />
                      </div>
                      <span className='text-[13px]'>0.20%</span>
                    </div> */}
                  </div>
                </div>
                <div className='flex flex-col'>
                  <p className='text-[12px]'>Avg. Sales per year</p>
                  <div className='flex items-center gap-2'>
                    <h2 className='font-semibold text-black'>--</h2>
                    {/* <div className='flex gap-1 items-center'>
                      <div className='bg-red-600 rounded-full p-[1px] w-[14.63] h-[14.63]'>
                        <ArrowDownLeft className='text-white w-[14.63px] h-[14.63px]' />
                      </div>
                      <span className='text-[13px]'>0.20%</span>
                    </div> */}
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-[6px]'>
                  <div className='rounded-full w-[7px] h-[7px] bg-[#b30909]'></div>
                  <span className='text-[12px] font-semibold'>Revenue</span>
                </div>
                <div className='flex items-center gap-[6px]'>
                  <div className='rounded-full w-[7px] h-[7px] bg-[#fce5e4]'></div>
                  <span className='text-[12px] font-semibold'>Orders</span>
                </div>
              </div>
            </div>

            {/* <RealTimeChart /> */}
            <div className='flex items-center justify-center h-full'>
              <Image src={Empty} alt='Empty' className='h-[150px] w-[130px]' />
            </div>
          </div>
        </div>
        <div className='box box2'>
          <h2>Total orders</h2>
          <div className='flex flex-col'>
            <div className='flex items-center gap-2'>
              <h2 className='font-semibold text-black'>{orderStatistics?.activeOrders || "--"}</h2>
              {orderStatistics?.activeOrders && (
                <div className='flex gap-1 items-center rounded-lg py-[2px] px-[5px] bg-green-100 text-green-700'>
                  <ArrowUp className='text-green-700 w-[14.63px] h-[14.63px]' />
                  <span className='text-[13px]'>0.20%</span>
                </div>
              )}
            </div>
          </div>
          <TotalOrdersChart />
          <div className='flex items-center gap-[6px] justify-center'>
            <div className='rounded-full w-[7px] h-[7px] bg-[#b30909]'></div>
            <span className='text-[12px] font-semibold'>Orders</span>
          </div>
        </div>
        <div className='box box3'>
          <h2>Recent activity</h2>
          {/* <div className='flex flex-col gap-5'>
            {recentActivityData.map((item) => (
              <div className='flex items-center gap-3' key={item.name}>
                <Avatar className='align-center'>
                  <Avatar>
                    <AvatarImage src={item.image} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Avatar>
                <div>
                  <p className='font-semibold text-black'>{item.name}</p>
                  <p className='flex items-center gap-1 h-4'>
                    Sent you a <span className='text-red-700 '>Message</span>
                  </p>
                </div>
              </div>
            ))}
          </div> */}
          <div className='flex items-center justify-center h-full'>
            <Image src={Empty} alt='Empty' className='h-[150px] w-[130px]' />
          </div>
        </div>
        <div className='box box4'>
          <h2>Top package</h2>
          <TopPackage vendorId={vendor?.id} />
        </div>
        <div className='box box5'>
          <h2>Latest orders</h2>
          <LatestOrders />
        </div>
      </div>
    </Dashboard>
  );
};

export const recentActivityData = [
  {
    image: "https://github.com/shadcn.png",
    name: "Demi Wikinson",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Allah Lane",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Lana Stein",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Demi Wikinson",
  },
];

const LatestOrders = () => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 8 }); // Set default page size to 5
  const { data: allOrders, status } = useGetAllOrders();

  const table = useReactTable({
    data: allOrders,
    columns: LatestOrdersCol,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination, // Add pagination to the table state
    },
    onPaginationChange: setPagination, // Update pagination state on change
  });

  if (status !== "success") return <SkeletonTable />;
  return (
    <div className='relative'>
      <div className='max-w-full'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className='text-left px-5 py-0'>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className='py-2 text-left px-5'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <tr>
                <td colSpan={table.getAllColumns().length}>
                  <div className='flex flex-col items-center justify-center w-full h-[200px] gap-4'>
                    <Image src={Empty} alt='empty' width={100} height={100} className='w-[100px] h-auto' />
                    <p className='text-[#666666] text-center'>No data yet</p>
                  </div>
                </td>
              </tr>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const TopPackage = ({ vendorId }: any) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const { data: service, status } = useGetVendorServices(vendorId);

  const table = useReactTable({
    data: service?.[0]?.Service_Plans || [],
    columns: TopPackageCol,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (status !== "success") return <SkeletonTable />;
  return (
    <div className='relative'>
      <div className='max-w-full'>
        <div>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className='text-left px-5 py-0'>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className='py-5 text-left px-5'>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <tr>
                  <td colSpan={table.getAllColumns().length}>
                    <div className='flex flex-col items-center justify-center w-full h-[200px] gap-4'>
                      <Image src={Empty} alt='empty' width={100} height={100} className='w-[100px] h-auto' />
                      <p className='text-[#666666] text-center'>No data yet</p>
                    </div>
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

const RealTimeChart = () => {
  return (
    <ChartContainer config={chartConfig} className='h-[172px] mt-5 w-full'>
      <BarChart accessibilityLayer data={chartData} className=' w-full'>
        <CartesianGrid vertical={false} />
        <YAxis width={25} fontSize={11} axisLine={false} tickLine={false} />
        <XAxis
          dataKey='month'
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey='desktop' fill='#b30909' radius={4} />
        <Bar dataKey='mobile' fill='#fce5e4' radius={4} />
      </BarChart>
    </ChartContainer>
  );
};

const TotalOrdersChart = () => {
  return (
    <ChartContainer config={chartConfig} className='h-[150px]'>
      <AreaChart accessibilityLayer data={chartData2}>
        <CartesianGrid strokeDasharray='5 5' horizontal={false} />
        <XAxis
          dataKey='month'
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator='dot' hideLabel />} />
        <Area dataKey='desktop' type='linear' fill='#fce5e4' fillOpacity={0.3} stroke='#b30909' />
      </AreaChart>
    </ChartContainer>
  );
};

const topPackageData = [
  {
    packageName: "Standard",
    change: "0.2%",
    price: "4,900",
    sold: "123",
    sales: "140,900",
  },
  {
    packageName: "Basic",
    change: "0.2%",
    price: "4,900",
    sold: "123",
    sales: "140,900",
  },
  {
    packageName: "premium",
    change: "0.2%",
    price: "4,900",
    sold: "123",
    sales: "140,900",
  },
];

const chartData = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
  { month: "Jul", desktop: 30, mobile: 244 },
  { month: "Aug", desktop: 100, mobile: 200 },
  { month: "Sep", desktop: 300, mobile: 102 },
  { month: "Nov", desktop: 100, mobile: 50 },
  { month: "Dec", desktop: 214, mobile: 140 },
];

const chartData2 = [
  { month: "01", desktop: 186, mobile: 80 },
  { month: "02", desktop: 237, mobile: 120 },
  { month: "03", desktop: 73, mobile: 190 },
  { month: "04", desktop: 209, mobile: 130 },
  { month: "05", desktop: 214, mobile: 140 },
  { month: "06", desktop: 30, mobile: 244 },
  { month: "07", desktop: 100, mobile: 200 },
];

const chartConfig = {
  desktop: {
    label: "Revenue",
    color: "#2563eb",
  },
  mobile: {
    label: "Orders",
    color: "#60a5fa",
  },
} satisfies ChartConfig;
