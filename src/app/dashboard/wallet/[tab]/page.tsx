"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CardWallet } from "@/components/ui/card";
import { FileDownIcon, MoreVertical } from "lucide-react";
import {
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  useGetUser,
  useGetUserDisputes,
  useGetUserWalletStats,
} from "@/hooks/user";
import { useGetTransactions, useGetVendorTransactions } from "@/hooks/orders";
import {
  DisputeTransactionsCol,
  RequestPayoutCol,
  WalletTransactionsCol,
} from "@/app/components/schema/Columns";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import { defaultUser, UserProp } from "@/app/components/schema/Types";
import { RequestPayout } from "@/app/components/business/walletData/walletData";
import { useGetAllWithdrawals } from "@/hooks/withdrawal";
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
import { useSession } from "next-auth/react";
import { exportToCSV } from "@/lib/auth-helper";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { FaFilter } from "react-icons/fa";
import { FaChevronUp, FaChevronDown } from "react-icons/fa6";
import VerificationPage from "@/app/components/business/Verification";
import { PayoutSchedules } from "@/components/dashboard/stripe/EmbededComponents";
import ViewTransaction from "@/components/dashboard/ViewTransaction";

const WalletPage = () => {
  const { tab } = useParams();

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [activeTab, setActiveTab] = useState<any>(tab || "transaction");
  const [transaction, setTransaction] = useState<any>([]);
  const [user, setUser] = useState<UserProp>(defaultUser);
  const navigation = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const connectId = session?.stripeConnectId;
  const [sorting, setSorting] = useState([{ id: "createdAt", desc: true }]);
  const getUser = useGetUser();
  const { data: transactionData, status: transactionStatus } =
    useGetTransactions();
  const { data: vendorTransaction } = useGetVendorTransactions();
  const { data: walletStats } = useGetUserWalletStats();
  const { data: disputeData } = useGetUserDisputes();
  const getWithdrawals = useGetAllWithdrawals();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/dashboard/wallet/transaction")
      setActiveTab("transaction");
    else if (pathname === "/dashboard/wallet/payouts") setActiveTab("payouts");
    else if (pathname === "/dashboard/wallet/dispute") setActiveTab("dispute");
    else if (pathname === "/dashboard/wallet/verification")
      setActiveTab("verification");
  }, [pathname]);

  useEffect(() => {
    if (getUser?.data) setUser(getUser.data);
  }, [getUser]);

  useEffect(() => {
    if (transactionData) {
      if (vendorTransaction)
        setTransaction([...transactionData, ...vendorTransaction]);
      else setTransaction(transactionData);
    }
  }, [transactionData, vendorTransaction]);

  const getColumnsForActiveTab = () => {
    return activeTab === "dispute"
      ? DisputeTransactionsCol
      : activeTab === "payouts"
      ? RequestPayoutCol
      : WalletTransactionsCol.filter(
          ({ accessorKey }: any) => accessorKey !== "resolution"
        );
  };

  const handleExport = () => {
    const dataToExport =
      activeTab === "payouts"
        ? getWithdrawals.data
        : activeTab === "dispute"
        ? disputeData
        : transaction;

    // Call exportToCSV function with the table data and desired filename
    if (dataToExport.length > 0) exportToCSV(dataToExport, "WalletData");
    else console.log("No data to export.");
  };

  const table = useReactTable({
    data:
      activeTab === "payouts"
        ? getWithdrawals?.data
        : activeTab === "dispute"
        ? disputeData
        : transaction,
    columns: getColumnsForActiveTab(),
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

  if (status === "loading") return <SkeletonCard2 />;
  if (transactionStatus !== "success") return <SkeletonCard2 />;
  if (getWithdrawals.status !== "success") return <SkeletonCard2 />;
  return (
    <>
      {pathname === "/dashboard/wallet/view" ? (
        <ViewTransaction />
      ) : (
        <Dashboard className="bg-white">
          <div className="flex flex-col gap-2">
            <h5>Wallet</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-[10px] mb-[50px]">
              <CardWallet
                title="Available Balance"
                header={`${user.Wallet.symbol} ${
                  walletStats?.availableBalance.toLocaleString() || "--"
                }`}
              />
              <CardWallet
                title="Overall Earning"
                header={`${user.Wallet.symbol} ${
                  walletStats?.availableBalance.toLocaleString() || "--"
                }`}
              />
              <CardWallet
                title="Pending Funds"
                header={`${user.Wallet.symbol} ${
                  walletStats?.totalPendingAmount.toLocaleString() || "--"
                }`}
              />
              <CardWallet
                title="Cancelled Funds"
                header={`${user.Wallet.symbol} ${
                  walletStats?.totalCancelledAmount.toLocaleString() || "--"
                }`}
              />
              <CardWallet
                title="Funds in Dispute"
                header={`${user.Wallet.symbol} ${
                  walletStats?.totalDisputedAmount.toLocaleString() || "--"
                }`}
              />
            </div>
          </div>
          <div>
            <Tabs defaultValue={activeTab} className="w-full mt-2">
              <TabsList className="flex max-w-[565px] gap-3 justify-start  rounded-md bg-white p-1 text-gray-500">
                {session?.user?.accountType === "PERSONAL" ? (
                  <>
                    {walletData
                      .filter((item: any) => item.type !== "business")
                      .map((item) => (
                        <TabsTrigger
                          onClick={() => navigation.push(item.value)}
                          value={item.value}
                          key={item.value}
                        >
                          {item.title}
                        </TabsTrigger>
                      ))}
                  </>
                ) : (
                  <>
                    {walletData.map((item) => (
                      <TabsTrigger
                        onClick={() => navigation.push(item.value)}
                        value={item.value}
                        key={item.value}
                      >
                        {item.title}
                      </TabsTrigger>
                    ))}
                  </>
                )}
              </TabsList>
              <div className="border-b border-gray-200 mt-2"></div>

              <div className="relative">
                <div className="max-w-full pb0">
                  {walletData.map((item) => (
                    <TabsContent value={item.value} key={item.title}>
                      {item.value === "verification" ? (
                        <VerificationPage />
                      ) : item.value === "payouts" && connectId ? (
                        <PayoutSchedules />
                      ) : (
                        <>
                          <h6 className="mt-5">{item.title}</h6>
                          <div className="flex mt-2 flex-row gap-5 justify-between ">
                            <p>{item.note}</p>

                            {/* Ellipsis menu for smaller screens */}
                            <div className="relative md:hidden z-10">
                              <MoreVertical
                                className="hover:text-red-700 cursor-pointer"
                                onClick={() =>
                                  setIsDropdownOpen(!isDropdownOpen)
                                }
                              />
                              <div
                                className={`${
                                  isDropdownOpen ? "block" : "hidden"
                                } absolute right-0 mt-2 p-4 w-[150px] bg-white rounded-lg shadow-md`}
                              >
                                <div className="flex flex-col gap-[16px]">
                                  <Button
                                    className="px-4 w-full sm:px-6 text-[12px]"
                                    variant={"secondary"}
                                    onClick={handleExport}
                                  >
                                    <span className="flex">Export All</span>
                                    <FileDownIcon className="ml-2 hidden sm:block h-5 w-5" />
                                  </Button>
                                  <Button
                                    onClick={() => setOpen(true)}
                                    className="px-5"
                                  >
                                    Request payouts
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* For larger screens, show the buttons inline */}
                            <div className="hidden md:flex flex-col sm:flex-row gap-[16px]">
                              <Button
                                variant={"secondary"}
                                onClick={handleExport}
                              >
                                <span className="flex">Export All</span>
                                <FileDownIcon className="ml-2 h-5 w-5" />
                              </Button>

                              <Button
                                onClick={() => setOpen(true)}
                                className="px-5"
                              >
                                Request payouts
                              </Button>
                            </div>
                          </div>

                          <div className="max-w-full mt-5 lg:mt-0">
                            <div className="flex gap-[10px] mt-[10px]">
                              {/* <div className='flex items-center border font-[500] border-gray-300 rounded-lg gap-1.5 justify-center px-2 py-1 text-sm'>
              <Calendar fill='#0F132499' className='text-white' />
              Last 7 days
            </div> */}
                              <DropdownFilterMenu table={table} />
                            </div>
                            <div className="flex items-center py-4">
                              <Input
                                placeholder="Search Customer"
                                value={
                                  (table
                                    ?.getColumn("user")
                                    ?.getFilterValue() as string) || ""
                                }
                                onChange={(event) =>
                                  table
                                    .getColumn("user")
                                    ?.setFilterValue(event.target.value)
                                }
                                className="max-w-sm"
                              />
                            </div>
                            <div className="relative">
                              <Table>
                                <TableHeader>
                                  {table
                                    ?.getHeaderGroups()
                                    .map((headerGroup) => (
                                      <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                          return (
                                            <TableHead key={header.id}>
                                              {header.isPlaceholder ? null : (
                                                <div
                                                  {...{
                                                    className:
                                                      header.column.getCanSort()
                                                        ? "cursor-pointer select-none"
                                                        : "",
                                                    onClick:
                                                      header.column.getToggleSortingHandler(),
                                                  }}
                                                >
                                                  {flexRender(
                                                    header.column.columnDef
                                                      .header,
                                                    header.getContext()
                                                  )}
                                                  {{
                                                    // asc: <ArrowUp />,
                                                    // desc: <ArrowDown />,
                                                  }[
                                                    header.column.getIsSorted() as string
                                                  ] ?? null}
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
                                      <TableRow
                                        key={row.id}
                                        data-state={
                                          row.getIsSelected() && "selected"
                                        }
                                      >
                                        {row.getVisibleCells().map((cell) => (
                                          <TableCell key={cell.id}>
                                            {flexRender(
                                              cell.column.columnDef.cell,
                                              cell.getContext()
                                            )}
                                          </TableCell>
                                        ))}
                                      </TableRow>
                                    ))
                                  ) : (
                                    <tr>
                                      <td
                                        colSpan={table.getAllColumns().length}
                                      >
                                        <div className="flex flex-col items-center justify-center w-full h-[200px] gap-4">
                                          <Image
                                            src={empty}
                                            alt="empty"
                                            width={100}
                                            height={100}
                                            className="w-[100px] h-auto"
                                          />
                                          <p className="text-[#666666] text-center">
                                            No data yet
                                          </p>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </TableBody>
                                <div className="absolute w-full bottom-0 flex items-center justify-end space-x-2 py-4">
                                  <Pagination>
                                    <PaginationContent>
                                      <PaginationItem>
                                        <PaginationPrevious
                                          onClick={() => table.previousPage()}
                                          isActive={table.getCanPreviousPage()}
                                        />
                                      </PaginationItem>

                                      <PaginationItem>
                                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                          Page{" "}
                                          {table.getState().pagination
                                            .pageIndex + 1}{" "}
                                          of {table.getPageCount()}
                                        </div>
                                      </PaginationItem>
                                      <PaginationItem>
                                        <PaginationNext
                                          onClick={() =>
                                            table.getCanNextPage() &&
                                            table.nextPage()
                                          }
                                          isActive={table.getCanNextPage()}
                                        />
                                      </PaginationItem>
                                    </PaginationContent>
                                  </Pagination>
                                </div>
                              </Table>
                            </div>
                          </div>
                        </>
                      )}
                    </TabsContent>
                  ))}
                </div>
              </div>
            </Tabs>
          </div>
          <RequestPayout open={open} setOpen={setOpen} connectId={connectId} />
        </Dashboard>
      )}
    </>
  );
};

export default WalletPage;

const walletData = [
  {
    value: "transaction",
    title: "Transactions",
    note: "See all transaction made on your store",
  },
  {
    value: "payouts",
    title: "Payouts",
    note: "See all withdrawal you have made",
  },
  {
    value: "dispute",
    type: "business",
    title: "Payment dispute",
    note: "See all concerns related to the payment made for a service",
  },
  {
    value: "verification",
    type: "business",
    title: "Verification status",
    note: "",
  },
];

const DropdownFilterMenu = ({ table }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
      <DropdownMenuTrigger asChild>
        <div className="flex gap-3 border hover:border-red-700 hover:text-red-700 items-center py-[5px] px-4 rounded-lg cursor-pointer">
          <FaFilter className="w-4 h-4 cursor-pointer" />
          Filter
          {isOpen ? (
            <FaChevronUp className="w-3 h-3" />
          ) : (
            <FaChevronDown className="w-3 h-3" />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="px-4 py-6 space-y-4">
        {table.getAllColumns().map((column: any) =>
          column.getCanFilter() &&
          ![
            "id",
            "createdAt",
            "user",
            "type",
            "totalAmount",
            "actions",
          ].includes(column.id) ? (
            <div key={column.id} className="flex flex-col gap-1">
              <label>{column.columnDef.header}:</label>
              {column.columnDef.meta?.filterVariant === "select" ? (
                <Select
                  onValueChange={(value) =>
                    column.setFilterValue(value === "all" ? undefined : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={`Select ${column.columnDef.header}`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                    <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="DISPUTED">DISPUTED</SelectItem>
                  </SelectContent>
                </Select>
              ) : column.columnDef.meta?.filterVariant === "resolution" ? (
                <Select
                  onValueChange={(value) =>
                    column.setFilterValue(value === "all" ? undefined : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={`Select ${column.columnDef.header}`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Refund">Refund</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  onChange={(e) => column.setFilterValue(e.target.value)}
                  placeholder={`Search ${column.columnDef.header}`}
                  type="text"
                />
              )}
            </div>
          ) : null
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
