"use client";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";

import { Input } from "@/components/ui/input";
import { CardWallet } from "@/components/ui/card";
import { TableContainer } from "@/components/ui/table";
import { Dashboard } from "@/components/ui/containers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useSession } from "next-auth/react";
import { useGetUser } from "@/hooks/user";
import { useGetVendor, useGetVendorStats } from "@/hooks/vendors";
import { useGetAllOrders, useGetAllVendorOrders } from "@/hooks/orders";
import { formatDate } from "@/lib/auth-helper";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomSelect } from "@/components/ui/select";
import { useGetOnboardingStatus } from "@/hooks/wallet";
import { CustomModal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

/* ------------------------------- Tabs config ------------------------------- */
const orderData = [
  { value: "placed-orders", title: "My placed orders" },
  { value: "all-orders", title: "Orders", type: "business" },
];

/* --------------------------------- Helpers --------------------------------- */

// Normalize backend statuses into simple buckets
type StatusBucket = "Delivered" | "Completed" | "Pending" | "Failed";
const SUCCESS_STATUSES = ["CONFIRMED", "COMPLETED", "DELIVERED", "PAYMENT_COMPLETED"];
const PENDING_STATUSES = ["PENDING"];
const FAILED_STATUSES = ["CANCELED", "DISPUTED", "FAILED", "ERROR"];

function mapOrderStatusToBucket(status?: string): StatusBucket | undefined {
  if (!status) return undefined;
  const s = status.toUpperCase();
  if (s === "DELIVERED") return "Delivered";
  if (s === "COMPLETED" || s === "PAYMENT_COMPLETED" || s === "CONFIRMED") return "Completed";
  if (PENDING_STATUSES.includes(s)) return "Pending";
  if (FAILED_STATUSES.includes(s)) return "Failed";
  // fallback: treat unknowns as Pending to avoid hiding rows unintentionally
  return "Pending";
}

function mapOrderTypeToLabel(orderType?: string): "Ticket" | "Service" {
  return orderType === "Event_Plans" ? "Ticket" : "Service";
}

/* --------------------------------- Page ----------------------------------- */
const Orders = ({ params }: any) => {
  const { tab } = params;
  const router = useRouter();
  const [isOnboard, setIsOnboard] = useState(false);
  const { data: onboardStatus } = useGetOnboardingStatus();
  const [filters, setFilters] = useState<{ status: string; type: string }>({
    status: "All Statuses",
    type: "All Types",
  });

  const { data: session } = useSession();
  const { data: user } = useGetUser();
  const { data: vendor } = useGetVendor();
  const { data: vendorStats } = useGetVendorStats(vendor?.id);

  const { data: allOrders } = useGetAllOrders();
  const { data: vendorOrders } = useGetAllVendorOrders(vendor?.id);

  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!allOrders) return;
    // if tab === all-orders, show vendorOrders, else show allOrders
    if (tab === "all-orders") setData(vendorOrders ?? []);
    else setData(allOrders ?? []);
  }, [tab, allOrders, vendorOrders]);

  // ✅ Apply search + status filter + ticket type filter
  const filtered = useMemo(() => {
    const wantAllStatus = filters.status === "All Statuses";
    const wantAllTypes = filters.type === "All Types";

    return (data ?? []).filter((row: any) => {
      // status filter
      const bucket = mapOrderStatusToBucket(row?.orderStatus);
      const matchesStatus = wantAllStatus || bucket === filters.status;

      // type filter (Ticket / Service)
      const typeLabel = mapOrderTypeToLabel(row?.orderType);
      const matchesType = wantAllTypes || typeLabel === filters.type;

      return matchesStatus && matchesType;
    });
  }, [data, filters]);

  // status + type filter UIs shown by TableContainer
  const filterData = [
    {
      component: (
        <CustomSelect
          options={["All Statuses", "Delivered", "Completed", "Pending", "Failed"]}
          value={filters.status}
          onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
        />
      ),
    },
    {
      component: (
        <CustomSelect
          options={["All Types", "Ticket", "Service"]}
          value={filters.type}
          onChange={(v) => setFilters((f) => ({ ...f, type: v }))}
        />
      ),
    },
  ];

  const columnsForTab = useMemo<ColumnDef<any>[]>(() => {
    if (tab === "all-orders") return OrdersCol;
    return OrdersCol; // same pattern for both tabs
  }, [tab]);

  useEffect(() => {
    if (onboardStatus)
      if (!onboardStatus?.onboardingStatus) setIsOnboard(true);
      else if (onboardStatus.kycRecord?.status !== "APPROVED") setIsOnboard(true);
  }, [onboardStatus]);

  return (
    <Dashboard className='bg-white pb-24'>
      {tab !== "event-order" && (
        <div className='flex flex-col'>
          <h3>Orders</h3>
          <div className='grid gap-4 grid-flow-row-dense sm:grid-cols-2 md:grid-cols-4 border-b border-gray-200 pt-5 pb-8 m-0'>
            <CardWallet title='Active Orders' header={vendorStats?.activeOrders || 0} />
            <CardWallet title='Active Packages' header={vendorStats?.activePackages || 0} />
            <CardWallet
              title='Pending Funds'
              header={`${user?.Wallet?.symbol || "₦"} ${vendorStats?.pendingFunds?.toLocaleString?.() || 0}`}
            />
            <CardWallet title='Avg Rating' header={vendorStats?.avgRating || 0} />
            <CardWallet
              title='Total Sold'
              header={`${user?.Wallet?.symbol || "₦"} ${vendorStats?.totalSales?.toLocaleString?.() || 0}`}
            />
          </div>
        </div>
      )}

      <div>
        <h3 className='font-medium'>Order history</h3>

        <Tabs defaultValue={tab} className='w-full mt-4'>
          {tab !== "event-order" && (
            <TabsList className='flex max-w-[565px] gap-3 justify-start rounded-md bg-white p-1 text-gray-500'>
              {session?.user?.accountType === "PERSONAL"
                ? orderData
                    .filter((i) => i.type !== "business")
                    .map((item) => (
                      <TabsTrigger onClick={() => router.push(item.value)} value={item.value} key={item.value}>
                        {item.title}
                      </TabsTrigger>
                    ))
                : orderData.map((item) => (
                    <TabsTrigger onClick={() => router.push(item.value)} value={item.value} key={item.value}>
                      {item.title}
                    </TabsTrigger>
                  ))}
            </TabsList>
          )}
          <div className='border-b border-gray-200 mt-2' />

          {orderData.map((item) => (
            <TabsContent value={item.value} key={item.value}>
              <div className='mt-5'>
                <TableContainer
                  searchKey='customer'
                  isFetching={false}
                  columns={columnsForTab}
                  data={filtered}
                  filterData={filterData}
                  emptyTitle='No data yet'
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <CustomModal
        title='Verify Kyc'
        description={`You KYC status is ${
          onboardStatus?.kycRecord?.status || "Not started"
        }, you can't create an event`}
        open={isOnboard}
        setOpen={setIsOnboard}
        className='max-w-[500px]'
      >
        <div className='flex items-end justify-end'>
          <Button
            type='button'
            className='gap-2'
            onClick={() => {
              router.push("/dashboard/kyc");
            }}
          >
            View KYC status
          </Button>
        </div>
      </CustomModal>
    </Dashboard>
  );
};

export default Orders;

/* ----------------------------- Columns (same UI pattern as Ticket table) ----------------------------- */

const OrdersCol: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className='border border-gray-300'
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className='border border-gray-300'
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className='font-medium '>{row.getValue("id")}</div>,
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const user = row?.original?.user;
      return (
        <div className='font-medium '>
          {user?.first_name} {user?.last_name}
        </div>
      );
    },
    filterFn: (row, _columnId, filterValue) => {
      const firstName = row.original.user?.first_name?.toLowerCase() || "";
      const lastName = row.original.user?.last_name?.toLowerCase() || "";
      const fullName = `${firstName} ${lastName}`;

      return fullName.includes(filterValue.toLowerCase());
    },
  },
  // {
  //   accessorKey: "user",
  //   header: "Customer",
  //   cell: ({ row }) => {
  //     const user = row?.original?.user;
  //     return (
  //       <div className='font-medium '>
  //         {user?.first_name} {user?.last_name}
  //       </div>
  //     );
  //   },
  //   filterFn: (row, _columnId, filterValue) => {
  //     const firstName = row.original.user?.first_name?.toLowerCase() || "";
  //     const lastName = row.original.user?.last_name?.toLowerCase() || "";
  //     const fullName = `${firstName} ${lastName}`;

  //     return fullName.includes(filterValue.toLowerCase());
  //   },
  // },

  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const createdAt: string = row.getValue("createdAt");
      return <div>{`${formatDate(createdAt)}`}</div>;
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      return <div>{row?.original?.orderType === "Event_Plans" ? "Ticket" : "Service"}</div>;
    },
  },
  {
    accessorKey: "settlementAmount",
    header: "Amount",
    cell: ({ row }) => {
      return (
        <div>
          {`${row?.original?.settlementCurrencySymbol || row?.original?.transactionRef?.[0]?.settlementCurrencySymbol}${
            row.original.settlementAmount.toLocaleString() || 0
          }`}
        </div>
      );
    },
  },
  {
    accessorKey: "orderStatus",
    header: "Payment Status",
    meta: {
      filterVariant: "select",
    },
    cell: ({ row }) => (
      <div>
        {["CONFIRMED", "COMPLETED", "DELIVERED"].includes(row.getValue("orderStatus")) ? (
          <div className='py-1 max-w-[100px] px-2 bg-green-100 text-center text-green-700 rounded-md font-medium'>
            {row.getValue("orderStatus")}
          </div>
        ) : ["PAYMENT_COMPLETED"].includes(row.getValue("orderStatus")) ? (
          <div className='py-1 max-w-[180px] px-2 bg-green-100 text-center text-green-700 rounded-md font-medium'>
            {row.getValue("orderStatus")}
          </div>
        ) : ["PENDING", "CANCELED", "DISPUTED"].includes(row.getValue("orderStatus")) ? (
          <div className='py-1 px-2 text-red-700 rounded-md bg-red-100 max-w-[90px] text-center font-medium'>
            {row.getValue("orderStatus")}
          </div>
        ) : (
          <div className='py-1 px-2  text-yellow-700 max-w-[120px] rounded-md bg-yellow-100 text-center font-medium'>
            {row.getValue("orderStatus")}
          </div>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const navigation = useRouter();
      return (
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <MoreVertical className='cursor-pointer hover:text-red-700 h-4 w-4 text-black' />
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigation.push(`placed-orders/${row.original.id}`)}>
                View Order
              </DropdownMenuItem>
              {/* <DropdownMenuItem>
                <DeleteOrder id={row?.original?.id} />
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
