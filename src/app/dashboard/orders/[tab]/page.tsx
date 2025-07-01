"use client";
import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CardWallet } from "@/components/ui/card";
import { OrdersCol } from "@/app/components/schema/Columns";
import { useGetAllOrders, useGetAllVendorOrders } from "@/hooks/orders";
import empty from "../../../components/assets/images/empty.svg";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Image from "next/image";
import { Dashboard } from "@/components/ui/containers";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { FaFilter } from "react-icons/fa";
import { FaChevronUp, FaChevronDown } from "react-icons/fa6";
import { useGetVendor, useGetVendorStats } from "@/hooks/vendors";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { useGetUser } from "@/hooks/user";

const Orders = ({ params }: any) => {
  const { tab } = params;
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 }); // Set default page size to 10
  const [data, setData] = useState<any>([]);
  const { data: allOrders } = useGetAllOrders();
  const { data: session } = useSession();
  const { data: user } = useGetUser();
  const { data: vendor } = useGetVendor();
  const { data: vendorOrders } = useGetAllVendorOrders(vendor?.id);
  const { data: vendorStats } = useGetVendorStats(vendor?.id);
  const router = useRouter();

  useEffect(() => {
    if (allOrders) {
      if (tab === "all-orders") setData(vendorOrders);
      else setData(allOrders);
    }
  }, [tab, allOrders, vendorOrders]);

  const getColumnsForActiveTab = () => {
    return tab === "all-orders" ? OrdersCol : OrdersCol.filter(({ accessorKey }: any) => accessorKey !== "customer");
  };

  const table = useReactTable({
    data: data,
    columns: getColumnsForActiveTab(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  return (
    <Dashboard className='bg-white pb-24'>
      {tab !== "event-order" && (
        <div className='flex flex-col'>
          <h5>Orders</h5>
          <div className='grid gap-4 grid-flow-row-dense sm:grid-cols-2 md:grid-cols-4 border-b border-gray-200 pt-5 pb-8 m-0'>
            <CardWallet title='Active Orders' header={vendorStats?.activeOrders || 0} />
            <CardWallet title='Active Packages' header={vendorStats?.activePackages || 0} />
            <CardWallet
              title='Pending Funds'
              header={`${user?.Wallet?.symbol || "₦"} ${vendorStats?.pendingFunds?.toLocaleString() || 0}`}
            />
            <CardWallet title='Avg Rating' header={vendorStats?.avgRating || 0} />
            <CardWallet
              title='Total Sold'
              header={`${user?.Wallet?.symbol || "₦"} ${vendorStats?.totalSales?.toLocaleString() || 0}`}
            />
          </div>
        </div>
      )}
      <div>
        <h3 className='font-medium'>Order history</h3>

        <div>
          <Tabs defaultValue={tab} className='w-full mt-4'>
            {tab !== "event-order" && (
              <TabsList className='flex max-w-[565px] gap-3 justify-start  rounded-md bg-white p-1 text-gray-500'>
                {session?.user?.accountType === "PERSONAL" ? (
                  <>
                    {orderData
                      .filter((item: any) => item.type !== "business")
                      .map((item) => (
                        <TabsTrigger onClick={() => router.push(item.value)} value={item.value} key={item.value}>
                          {item.title}
                        </TabsTrigger>
                      ))}
                  </>
                ) : (
                  <>
                    {orderData.map((item) => (
                      <TabsTrigger onClick={() => router.push(item.value)} value={item.value} key={item.value}>
                        {item.title}
                      </TabsTrigger>
                    ))}
                  </>
                )}
              </TabsList>
            )}
            <div className='border-b border-gray-200 mt-2'></div>

            <div className='relative'>
              <div className='max-w-full'>
                {orderData.map((item) => (
                  <TabsContent value={item.value} key={item.title}>
                    <div className='max-w-full mt-5 lg:mt-0'>
                      <div className='flex gap-[10px] mt-[10px]'>
                        {/* <div className='flex items-center border font-[500] border-gray-300 rounded-lg gap-1.5 justify-center px-2 py-1 text-sm'>
              <Calendar fill='#0F132499' className='text-white' />
              Last 7 days
            </div> */}
                        <DropdownFilterMenu table={table} />
                      </div>
                      <div className='flex items-center py-4'>
                        <Input
                          placeholder='Search Customer'
                          value={(table?.getColumn("user")?.getFilterValue() as string) || ""}
                          onChange={(event) => table.getColumn("user")?.setFilterValue(event.target.value)}
                          className='max-w-sm'
                        />
                      </div>
                      <div className='relative'>
                        <Table>
                          <TableHeader>
                            {table?.getHeaderGroups().map((headerGroup) => (
                              <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                  return (
                                    <TableHead key={header.id}>
                                      {header.isPlaceholder ? null : (
                                        <div
                                          {...{
                                            className: header.column.getCanSort() ? "cursor-pointer select-none" : "",
                                            onClick: header.column.getToggleSortingHandler(),
                                          }}
                                        >
                                          {flexRender(header.column.columnDef.header, header.getContext())}
                                          {{
                                            // asc: <ArrowUp />,
                                            // desc: <ArrowDown />,
                                          }[header.column.getIsSorted() as string] ?? null}
                                        </div>
                                      )}
                                    </TableHead>
                                  );
                                })}
                              </TableRow>
                            ))}
                          </TableHeader>
                          <TableBody>
                            {table?.getRowModel().rows?.length ? (
                              table?.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                  {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={table.getAllColumns().length}>
                                  <div className='flex flex-col items-center justify-center w-full h-[200px] gap-4'>
                                    <Image
                                      src={empty}
                                      alt='empty'
                                      width={100}
                                      height={100}
                                      className='w-[100px] h-auto'
                                    />
                                    <p className='text-[#666666] text-center'>No data yet</p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </TableBody>
                          <div className='absolute w-full bottom-0 flex items-center justify-end space-x-2 py-4'>
                            <Pagination>
                              <PaginationContent>
                                <PaginationItem>
                                  <PaginationPrevious
                                    onClick={() => table.previousPage()}
                                    isActive={table.getCanPreviousPage()}
                                  />
                                </PaginationItem>

                                <PaginationItem>
                                  <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
                                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                                  </div>
                                </PaginationItem>
                                <PaginationItem>
                                  <PaginationNext
                                    onClick={() => table.getCanNextPage() && table.nextPage()}
                                    isActive={table.getCanNextPage()}
                                  />
                                </PaginationItem>
                              </PaginationContent>
                            </Pagination>
                          </div>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </Dashboard>
  );
};

export default Orders;

const DropdownFilterMenu = ({ table }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
      <DropdownMenuTrigger asChild>
        <div className='flex gap-3 border hover:border-red-700 hover:text-red-700 items-center py-[5px] px-4 rounded-lg cursor-pointer'>
          <FaFilter className='w-4 h-4 cursor-pointer' />
          Filter
          {isOpen ? <FaChevronUp className='w-3 h-3' /> : <FaChevronDown className='w-3 h-3' />}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='px-4 py-6 space-y-4'>
        {table.getAllColumns().map((column: any) =>
          column.getCanFilter() &&
          !["id", "createdAt", "type", "settlementAmount", "user", "actions"].includes(column.id) ? (
            <div key={column.id} className='flex flex-col gap-1'>
              <label>{column.columnDef.header}:</label>
              {column.columnDef.meta?.filterVariant === "select" && (
                <Select onValueChange={(value) => column.setFilterValue(value === "all" ? undefined : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${column.columnDef.header}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All</SelectItem>
                    <SelectItem value='CONFIRMED'>CONFIRMED</SelectItem>
                    <SelectItem value='COMPLETED'>COMPLETED</SelectItem>
                    <SelectItem value='DELIVERED'>DELIVERED</SelectItem>
                    <SelectItem value='PENDING'>PENDING</SelectItem>
                    <SelectItem value='CANCELED'>CANCELED</SelectItem>
                    <SelectItem value='DISPUTED'>DISPUTED</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          ) : null
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const orderData = [
  {
    value: "placed-orders",
    title: "My placed orders",
  },
  {
    value: "all-orders",
    title: "Orders",
    type: "business",
  },
  // {
  //   value: "event-order",
  //   title: "Orders",
  //   type: "business",
  // },
];
