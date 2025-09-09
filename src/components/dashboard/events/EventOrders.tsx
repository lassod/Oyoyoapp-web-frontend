"use client";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import { TableContainer } from "@/components/ui/table";
import { useGetVendor } from "@/hooks/vendors";
import { formatDate } from "@/lib/auth-helper";
import { CustomSelect } from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetOnboardingStatus } from "@/hooks/wallet";
import { useRouter } from "next/navigation";
import { CustomModal } from "@/components/ui/modal";

/* ----------------------------- helpers ----------------------------- */
type StatusBucket = "Paid" | "Pending" | "Failed" | "Refunded";

/** Try to resolve a customer's display name from various shapes */
function getCustomerName(row: any): string {
  const u = row?.User;
  const oi = row?.orderItem;
  const full = [u?.first_name, u?.last_name].filter(Boolean).join(" ") || oi?.fullName || u?.name || "";
  return (full || "").trim();
}

/** Normalize raw status to buckets used by the UI */
function getStatusBucket(row: any): StatusBucket | undefined {
  const raw = (row?.paymentStatus || row?.status || row?.orderItem?.status || row?.transactionStatus || "")
    .toString()
    .toUpperCase();

  if (row?.isPaid === true) return "Paid";
  if (["PAID", "COMPLETED", "CONFIRMED", "SUCCESS", "SETTLED"].includes(raw)) return "Paid";
  if (["PENDING", "UNPAID", "AWAITING_PAYMENT"].includes(raw)) return "Pending";
  if (["REFUNDED"].includes(raw)) return "Refunded";
  if (["FAILED", "CANCELED", "CANCELLED", "DISPUTED", "ERROR"].includes(raw)) return "Failed";

  // default: treat unknowns as Pending so they aren't hidden
  return "Pending";
}

/** Extract ticket type / plan name from common fields */
function getTicketType(row: any): string {
  return (
    row?.ticketType ||
    row?.ticket?.name ||
    row?.orderItem?.ticketType ||
    row?.orderItem?.planName ||
    row?.planName ||
    row?.category ||
    "Unknown"
  ).toString();
}

/* ----------------------------- component ----------------------------- */
const EventOrders = ({ data }: any) => {
  const rows = Array.isArray(data) ? data : [];
  const { data: vendor } = useGetVendor();
  const router = useRouter();
  const [isOnboard, setIsOnboard] = useState(false);
  const { data: onboardStatus } = useGetOnboardingStatus();

  // local UI state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All Statuses" | StatusBucket>("All Statuses");
  const [ticketType, setTicketType] = useState<string>("All Ticket Types");

  useEffect(() => {
    if (onboardStatus)
      if (!onboardStatus?.onboardingStatus) setIsOnboard(true);
      else if (onboardStatus.kycRecord?.status !== "APPROVED") setIsOnboard(true);
  }, [onboardStatus]);

  const handleDownloadCSV = () => {
    const csvRows: string[] = [];
    const headers = [
      "Full Name",
      "Email",
      "Phone",
      `Amount (${currency})`,
      "Date",
      "State",
      "Country",
      "Status",
      "Ticket Type",
    ];
    csvRows.push(headers.join(","));

    filtered.forEach((item: any) => {
      const user = item?.User || {};
      const fullname =
        [user?.first_name, user?.last_name].filter(Boolean).join(" ") || item?.orderItem?.fullName || "--";
      const amount = item?.orderItem?.priceInSettlementCurrency ?? 0;
      const email = user?.email || item?.orderItem?.email || "--";
      const phone = user?.phone || item?.orderItem?.phoneNumber || "--";
      const date = formatDate(item?.createdAt);
      const state = user?.state || "--";
      const country = user?.country || "--";
      const statusBucket = getStatusBucket(item) || "";
      const typeLabel = getTicketType(item);

      const row = [
        safeCSV(fullname),
        safeCSV(email),
        safeCSV(phone),
        String(amount),
        safeCSV(date),
        safeCSV(state),
        safeCSV(country),
        safeCSV(statusBucket),
        safeCSV(typeLabel),
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "Registered_Guests.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // dynamic ticket type options from rows
  const ticketTypeOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => set.add(getTicketType(r)));
    return ["All Ticket Types", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [rows]);

  // filtered rows for table + export
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const name = getCustomerName(r).toLowerCase();
      const matchesSearch = !q || name.includes(q);

      const b = getStatusBucket(r);
      const matchesStatus = status === "All Statuses" ? true : b === status;

      const t = getTicketType(r);
      const matchesType = ticketType === "All Ticket Types" ? true : t === ticketType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [rows, search, status, ticketType]);

  const filterData = [
    {
      component: (
        <CustomSelect
          options={["All Statuses", "Paid", "Pending", "Failed", "Refunded"]}
          value={status}
          onChange={(v) => setStatus(v as typeof status)}
        />
      ),
    },
    {
      component: <CustomSelect options={ticketTypeOptions} value={ticketType} onChange={(v) => setTicketType(v)} />,
    },
    {
      component: (
        <Button type='button' className='flex items-center gap-1' onClick={handleDownloadCSV}>
          Export All
          <DownloadIcon className='hidden sm:block' />
        </Button>
      ),
    },
  ];

  const currency = vendor?.User?.preferredCurrency || "₦";

  return (
    <div className='px-3 sm:px-8'>
      <h3>Order history</h3>

      <div className='mt-5'>
        <TableContainer
          searchKey='customer'
          isFetching={false}
          columns={EventOrdersCol}
          data={filtered}
          filterData={filterData}
          emptyTitle='No data yet'
        />
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
    </div>
  );
};

export default EventOrders;

/* escape commas/quotes/newlines for CSV safety */
function safeCSV(val: any): string {
  const s = (val ?? "").toString();
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const EventOrdersCol: ColumnDef<any>[] = [
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
      const user = row?.original?.User;
      return (
        <div className='font-medium '>
          {user?.first_name || row.original.orderItem.fullName} {user?.last_name}
        </div>
      );
    },
    filterFn: (row, _columnId, filterValue) => {
      const firstName =
        row.original.User?.first_name?.toLowerCase() || row?.original?.orderItem?.fullName?.toLowerCase() || "";
      const lastName = row.original.User?.last_name?.toLowerCase() || "";
      const fullName = `${firstName} ${lastName}`;
      console.log(filterValue);
      console.log(fullName);
      return fullName.includes(filterValue.toLowerCase());
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div>{row.original.User?.email || row?.original?.orderItem?.email || "--"}</div>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <div>{row?.original?.User?.phone || row?.original?.orderItem?.phoneNumber || "--"}</div>,
  },

  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const createdAt: string = row.getValue("createdAt");
      return <div>{`${formatDate(createdAt)}`}</div>;
    },
  },

  {
    accessorKey: "settlementAmount",
    header: "Amount",
    cell: ({ row }) => {
      const { data: vendor } = useGetVendor();

      return (
        <div>
          {`${vendor?.User?.currencySymbol}${row.original.orderItem?.priceInSettlementCurrency?.toLocaleString() || 0}`}
        </div>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => <div>{row.original.orderItem?.quantity || 0}</div>,
  },
  {
    accessorKey: "status",
    header: "Payment status",
    meta: {
      filterVariant: "select",
    },
    cell: ({ row }) => (
      <div>
        {row?.original?.orderItem?.Event_Tickets?.[0].status === "Active" ? (
          <div className='py-1 max-w-[60px] px-2 bg-green-100 text-center text-green-700 rounded-md font-medium'>
            Paid
          </div>
        ) : (
          <div className='py-1 px-2  text-yellow-700 max-w-[90px] rounded-md bg-yellow-100 text-center font-medium'>
            Pending
          </div>
        )}
      </div>
    ),
    filterFn: (row, _columnId, filterValue) => {
      const status = row.original.orderItem?.Event_Tickets?.[0].status;
      return filterValue === "Inactive" ? status !== "Active" : status === filterValue;
    },
  },
];
