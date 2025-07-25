import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  CheckCircle2,
  MoreVertical,
  XCircle,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Support } from "./Types";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { formatDate, formatTime, shortenText } from "@/lib/auth-helper";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { NewTicket } from "../dashboard/Ticket";
import { useGetVendor } from "@/hooks/vendors";

export const OrdersCol: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className="border border-gray-300"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="border border-gray-300"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="font-medium ">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const user = row?.original?.user;
      return (
        <div className="font-medium ">
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
      return (
        <div>
          {row?.original?.orderType === "Event_Plans" ? "Ticket" : "Service"}
        </div>
      );
    },
  },
  {
    accessorKey: "settlementAmount",
    header: "Amount",
    cell: ({ row }) => {
      return (
        <div>
          {`${
            row?.original?.settlementCurrencySymbol ||
            row?.original?.transactionRef?.[0]?.settlementCurrencySymbol
          }${row.original.settlementAmount.toLocaleString() || 0}`}
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
        {["CONFIRMED", "COMPLETED", "DELIVERED"].includes(
          row.getValue("orderStatus")
        ) ? (
          <div className="py-1 max-w-[100px] px-2 bg-green-100 text-center text-green-700 rounded-md font-medium">
            {row.getValue("orderStatus")}
          </div>
        ) : ["PAYMENT_COMPLETED"].includes(row.getValue("orderStatus")) ? (
          <div className="py-1 max-w-[180px] px-2 bg-green-100 text-center text-green-700 rounded-md font-medium">
            {row.getValue("orderStatus")}
          </div>
        ) : ["PENDING", "CANCELED", "DISPUTED"].includes(
            row.getValue("orderStatus")
          ) ? (
          <div className="py-1 px-2 text-red-700 rounded-md bg-red-100 max-w-[90px] text-center font-medium">
            {row.getValue("orderStatus")}
          </div>
        ) : (
          <div className="py-1 px-2  text-yellow-700 max-w-[120px] rounded-md bg-yellow-100 text-center font-medium">
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
              <MoreVertical className="cursor-pointer hover:text-red-700 h-4 w-4 text-black" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  navigation.push(`placed-orders/${row.original.id}`)
                }
              >
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

export const EventOrdersCol: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className="border border-gray-300"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="border border-gray-300"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="font-medium ">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const user = row?.original?.User;
      return (
        <div className="font-medium ">
          {user?.first_name || row.original.orderItem.fullName}{" "}
          {user?.last_name}
        </div>
      );
    },
    filterFn: (row, _columnId, filterValue) => {
      const firstName =
        row.original.User?.first_name?.toLowerCase() ||
        row?.original?.orderItem?.fullName?.toLowerCase() ||
        "";
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
    cell: ({ row }) => (
      <div>
        {row.original.User?.email || row?.original?.orderItem?.email || "--"}
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <div>
        {row?.original?.User?.phone ||
          row?.original?.orderItem?.phoneNumber ||
          "--"}
      </div>
    ),
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
          {`${vendor?.User?.currencySymbol}${
            row.original.orderItem?.priceInSettlementCurrency?.toLocaleString() ||
            0
          }`}
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
          <div className="py-1 max-w-[60px] px-2 bg-green-100 text-center text-green-700 rounded-md font-medium">
            Paid
          </div>
        ) : (
          <div className="py-1 px-2  text-yellow-700 max-w-[90px] rounded-md bg-yellow-100 text-center font-medium">
            Pending
          </div>
        )}
      </div>
    ),
    filterFn: (row, _columnId, filterValue) => {
      const status = row.original.orderItem?.Event_Tickets?.[0].status;
      return filterValue === "Inactive"
        ? status !== "Active"
        : status === filterValue;
    },
  },
];

export const TicketCol: ColumnDef<any>[] = [
  {
    accessorKey: "Users",
    header: "Name",
    cell: ({ row }) => {
      const user: any = row.getValue("Users"); // Get the Users object
      return (
        <div className="font-medium ">
          {user ? `${user.first_name}  ${user.last_name}` : "N/A"}{" "}
          {/* Safely access first_name */}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Time",
    cell: ({ row }) => <div>{formatTime(row.getValue("createdAt"))}</div>,
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div>
        {row.getValue("status") === "SUCCESS" ? (
          <div className="py-1 px-2 flex items-center gap-2 rounded-md text-center font-medium">
            <CheckCircle2 className="text-green-700 h-4 w-4" />
            <p className="leading-normal">Validation Successful</p>
          </div>
        ) : (
          <div className="py-1 px-2 flex items-center gap-2 rounded-md text-center font-medium">
            <XCircle className="text-red-700 h-4 w-4" />
            <p className="leading-normal">Validation Failed</p>
          </div>
        )}
      </div>
    ),
  },
];

export const SupportCol: ColumnDef<Support>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className="border border-gray-300"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="border border-gray-300"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="font-medium ">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => (
      <div className="font-medium ">{row.getValue("subject")}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => <div>{formatDate(row.getValue("createdAt"))}</div>,
  },
  {
    accessorKey: "name",
    header: "Category",
    meta: {
      filterVariant: "category",
    },
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },

  {
    accessorKey: "status",
    header: "Payment Status",
    meta: {
      filterVariant: "select",
    },
    cell: ({ row }) => (
      <div>
        {row.getValue("status") === "Resolved" ? (
          <div className="py-1 px-2 bg-green-100 text-center max-w-[75px] text-green-700 rounded-md font-medium">
            Resolved
          </div>
        ) : (
          <div className="py-1 px-2 text-red-700 rounded-md bg-red-100 text-center max-w-[50px] font-medium">
            Open
          </div>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const [isEditOpen, setEditOpen] = useState(false);
      const [isDeleteOpen, setDeleteOpen] = useState(false);

      return (
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setEditOpen(true)} // Open Edit dialog
              >
                View Ticket
              </DropdownMenuItem>
              {/* <DropdownMenuItem
                onClick={() => setDeleteOpen(true)} // Open Delete dialog
                style={{ color: "red", fontWeight: "500" }}
              >
                Delete
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={isEditOpen} onOpenChange={setEditOpen}>
            <AlertDialogContent className="left-[50%] top-[50%]">
              <NewTicket edit="edit" data={row.original} />
            </AlertDialogContent>
          </AlertDialog>
          {/* 
          <AlertDialog open={isDeleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent className='left-[50%] top-[50%]'>
              <DeleteTicket id={row.original.id} />
            </AlertDialogContent>
          </AlertDialog> */}
        </div>
      );
    },
  },
];

export const ListingCol: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className="border border-gray-300"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="border border-gray-300"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "package_name",
    header: "Package",
    cell: ({ row }) => (
      <div>
        {row.original.package_name &&
          shortenText(row.getValue("package_name"), 20)}
      </div>
    ),
  },
  {
    accessorKey: "package_description",
    header: "Description",
    cell: ({ row }) => (
      <div>
        {row.original.package_description &&
          shortenText(row.getValue("package_description"), 20)}
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Category",
    meta: {
      filterVariant: "select",
    },
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      return (
        <div className="font-medium ">
          {row.original.symbol || "₦"}
          {row.getValue("price")?.toLocaleString()}
        </div>
      );
    },
  },
  // {
  //   accessorKey: "order",
  //   header: "Total Orders",
  //   cell: ({ row }) => <div className='text-center font-medium '>{row.getValue("order") || 0}</div>,
  // },
  // {
  //   accessorKey: "sale",
  //   header: "Total Sales",
  //   cell: ({ row }) => <div className='text-center font-medium '>{row.getValue("sale") || 0}</div>,
  // },
  {
    accessorKey: "is_active",
    header: "Status",
    meta: {
      filterVariant: "status",
    },
    cell: ({ row }) => (
      <div>
        {row.getValue("is_active") ? (
          <div className="py-1 px-2 bg-green-100 text-green-700 rounded-md w-[55px]">
            Active
          </div>
        ) : (
          <div className="py-1 px-2 text-red-700 rounded-md bg-red-100 w-[65px]">
            Inactive
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
          {
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    navigation.push(`listing/${row.original.ServiceId}`)
                  }
                >
                  View Listing
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem style={{ color: "red", fontWeight: "500" }}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        </div>
      );
    },
  },
];

export const LatestOrdersCol: ColumnDef<any>[] = [
  {
    accessorKey: "createdAt",
    header: () => <div>Date</div>,
    cell: ({ row }) => <div>{formatDate(row?.getValue("createdAt"))}</div>,
  },
  {
    accessorKey: "id",
    header: () => <div>Order Code</div>,
    cell: ({ row }) => <div>{row.getValue("id")}</div>,
  },
  {
    accessorKey: "user",
    header: "Customer",
    cell: ({ row }) => {
      const user = row?.original?.user;
      return (
        <div className="font-medium ">
          {user?.first_name} {user?.last_name}
        </div>
      );
    },
  },

  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      return (
        <div>
          {row?.original?.orderType === "Event_Plans" ? "Ticket" : "Service"}
        </div>
      );
    },
  },
  {
    accessorKey: "settlementAmount",
    header: "Amount",
    cell: ({ row }) => {
      return (
        <div>
          {`${
            row?.original?.settlementCurrencySymbol ||
            row?.original?.transactionRef?.[0]?.settlementCurrencySymbol
          }${
            row.getValue("settlementAmount") ||
            row?.original?.transactionRef?.[0]?.amountPaid?.toLocaleString() ||
            0
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
        {["CONFIRMED", "COMPLETED", "DELIVERED"].includes(
          row.getValue("orderStatus")
        ) ? (
          <div className="py-1 max-w-[100px] px-2 bg-green-100 text-center text-green-700 rounded-md font-medium">
            {row.getValue("orderStatus")}
          </div>
        ) : ["PENDING", "CANCELED", "DISPUTED"].includes(
            row.getValue("orderStatus")
          ) ? (
          <div className="py-1 px-2 text-red-700 rounded-md bg-red-100 max-w-[90px] text-center font-medium">
            {row.getValue("orderStatus")}
          </div>
        ) : (
          <div className="py-1 px-2  text-yellow-700 max-w-[120px] rounded-md bg-yellow-100 text-center font-medium">
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
              <MoreVertical className="cursor-pointer hover:text-red-700 h-4 w-4 text-black" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigation.push(`orders/${row.original.id}`)}
              >
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

export const LatestOrdersColMobile: ColumnDef<any>[] = [
  {
    accessorKey: "package",
    header: () => <div className="desktopHide">Package</div>,
    cell: ({ row }) => (
      <div className="desktopHide flex gap-2 items-center font-medium">
        <Avatar className="align-center">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Avatar>
        <div>{row.getValue("package")}</div>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: () => <div className="desktopHide">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"));

      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return (
        <div className="desktopHide flex flex-col gap-2 font-medium">
          <div className=" w-full"> {formatted}</div>
          <div>
            {row.getValue("status") === "Active" ? (
              <div className="py-1 px-2 bg-green-100 w-[47px] text-green-700 rounded-md font-medium">
                Paid
              </div>
            ) : (
              <div className="py-1 px-2 text-red-700 rounded-md bg-red-100 max-w-[70px] font-medium">
                Pending
              </div>
            )}
          </div>
        </div>
      );
    },
  },
];

export const TopPackageCol: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: () => <div>Package</div>,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },

  {
    accessorKey: "change",
    header: () => <div>Change</div>,
    cell: ({ row }) => (
      <div className=" flex gap-2 items-center font-medium">
        --{" "}
        {/* <div className='bg-green-400 rounded-full p-[1px] w-[17px] h-[17px]'>
          <ArrowUpRight className='text-white w-[15px] h-[15px]' />
        </div>
        <div >{row.getValue("change")}</div> */}
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: () => <div>Price</div>,
    cell: ({ row }) => (
      <div>
        {row?.original?.symbol}
        {row.getValue("price")}
      </div>
    ),
  },
  {
    accessorKey: "sold",
    header: () => <div>Sold</div>,
    cell: ({ row }) => <div>{row.getValue("sold") || "--"}</div>,
  },
  {
    accessorKey: "sales",
    header: () => <div>Sales</div>,
    cell: ({ row }) => (
      <div className=" font-medium ">{row.getValue("sales") || "--"}</div>
    ),
  },
];

export const TopPackageColMobile: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: () => <div>Package</div>,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },

  {
    accessorKey: "change",
    header: () => <div>Change</div>,
    cell: ({ row }) => (
      <div className=" flex gap-2 items-center font-medium">
        <div className="bg-green-400 rounded-full p-[1px] w-[17px] h-[17px]">
          <ArrowUpRight className="text-white w-[15px] h-[15px]" />
        </div>
        <div>{row.getValue("change")}</div>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: () => <div>Price</div>,
    cell: ({ row }) => <div>{row.getValue("price")}</div>,
  },
  {
    accessorKey: "sold",
    header: () => <div>Sold</div>,
    cell: ({ row }) => <div>{row.getValue("sold")}</div>,
  },
  {
    accessorKey: "sales",
    header: () => <div>Sales</div>,
    cell: ({ row }) => (
      <div className=" font-medium ">{row.getValue("sales")}</div>
    ),
  },

  // MOBILE TABLES
  {
    accessorKey: "salesMobile",
    header: () => <div className="desktopHide">Sales</div>,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div className="desktopHide border-4 w-full flex flex-col gap-2 font-medium">
          <div className="font-medium ">{row.getValue("packageName")}</div>
          <div className="flex gap-2 items-center font-medium">
            <div className="bg-green-400 rounded-full p-[1px] w-[17px] h-[17px]">
              <ArrowUpRight className="text-white w-[15px] h-[15px]" />
            </div>
            <div>{row.getValue("change")}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "packageMobile",
    header: () => <div className="desktopHide">Package</div>,
    cell: ({ row }) => {
      return (
        <div className="desktopHide flex flex-col gap-2 font-medium">
          <div className="font-medium ">{row.getValue("sales")}</div>
          <div className="text-gray-400">{row.getValue("price")}</div>
        </div>
      );
    },
  },
];

export const SecurityCol: ColumnDef<any>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="font-medium ">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "device",
    header: "User Agent",
    cell: ({ row }) => (
      <div className="font-medium ">{row?.getValue("device") || "Chrome"}</div>
    ),
  },
  {
    accessorKey: "ip",
    header: "IP",
    cell: ({ row }) => <div>{row.getValue("ip")}</div>,
  },
  {
    accessorKey: "platform",
    header: "Platform",
    cell: ({ row }) => <div>{row.getValue("platform")}</div>,
  },
];
