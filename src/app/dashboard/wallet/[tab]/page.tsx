"use client";
import { useEffect, useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CardWallet } from "@/components/ui/card";
import { FileDownIcon, MoreVertical } from "lucide-react";
import { TableContainer } from "@/components/ui/table";
import {
  useGetUser,
  useGetUserDisputes,
  useGetUserWalletStats,
} from "@/hooks/user";
import { useGetTransactions, useGetVendorTransactions } from "@/hooks/orders";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import { defaultUser, UserProp } from "@/app/components/schema/Types";
import { RequestPayout } from "@/app/components/business/walletData/walletData";
import { Dashboard } from "@/components/ui/containers";
import { useSession } from "next-auth/react";
import { exportToCSV, formatDate, shortenText } from "@/lib/auth-helper";
import { useParams, usePathname, useRouter } from "next/navigation";
import { CustomSelect } from "@/components/ui/select";
import VerificationPage from "@/app/components/business/Verification";
import { PayoutSchedules } from "@/components/dashboard/stripe/EmbededComponents";
import ViewTransaction from "@/components/dashboard/ViewTransaction";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useGetAllWithdrawals } from "@/hooks/wallet";

const WalletPage = () => {
  const { tab }: any = useParams();
  const [transaction, setTransaction] = useState<any>([]);
  const [user, setUser] = useState<UserProp>(defaultUser);
  const navigation = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const connectId = session?.stripeConnectId;
  const getUser = useGetUser();
  const { data: transactionData, status: transactionStatus } =
    useGetTransactions();
  const { data: vendorTransaction } = useGetVendorTransactions();
  const { data: walletStats } = useGetUserWalletStats();
  const { data: disputeData } = useGetUserDisputes();
  const pathname = usePathname();
  const [payoutFilters, setPayoutFilters] = useState<any>({
    type: connectId ? "STRIPE" : "PAYSTACK",
    page: 1,
    limit: 100,
    search: "",
    status: "All Statuses",
  });
  const [filters, setFilters] = useState<any>({
    status: "All Statuses",
    date: "All Dates",
  });

  const {
    data: getWithdrawals,
    refetch,
    status: withdrawalStatus,
  } = useGetAllWithdrawals(payoutFilters);

  useEffect(() => {
    if (payoutFilters) refetch();
  }, [payoutFilters]);

  const filteredTransaction = useMemo(() => {
    if (!transaction.length) return [];

    const now = new Date();

    return transaction.filter((item: any) => {
      /* status filter */
      const statusMatch =
        filters.status === "All Statuses" ||
        (filters.status === "Pending" && item.status === "PENDING") ||
        (filters.status === "Completed" && item.status === "COMPLETED") ||
        (filters.status === "Disputed" && item.status === "DISPUTED") ||
        (filters.status === "Cancelled" && item.status === "CANCELLED");

      /* date filter */
      const created = new Date(item.createdAt);
      let dateMatch = true;

      if (filters.date === "Yesterday") {
        const y = new Date(now);
        y.setDate(now.getDate() - 1);
        dateMatch = created.toDateString() === y.toDateString();
      } else if (filters.date === "Last week") {
        const w = new Date(now);
        w.setDate(now.getDate() - 7);
        dateMatch = created >= w;
      } else if (filters.date === "Last month") {
        const m = new Date(now);
        m.setMonth(now.getMonth() - 1);
        dateMatch = created >= m;
      }

      return statusMatch && dateMatch;
    });
  }, [transaction, filters]);

  console.log(filteredTransaction);
  console.log(transaction);

  const filteredDispute = useMemo(() => {
    if (!disputeData || !disputeData.length) return [];

    const now = new Date();

    return disputeData.filter((item: any) => {
      /* status filter */
      const statusMatch =
        filters.status === "All Statuses" ||
        (filters.status === "Pending" && item.status === "PENDING") ||
        (filters.status === "Completed" && item.status === "COMPLETED") ||
        (filters.status === "Disputed" && item.status === "DISPUTED") ||
        (filters.status === "Cancelled" && item.status === "CANCELLED");

      /* date filter */
      const created = new Date(item.createdAt);
      let dateMatch = true;

      if (filters.date === "Yesterday") {
        const y = new Date(now);
        y.setDate(now.getDate() - 1);
        dateMatch = created.toDateString() === y.toDateString();
      } else if (filters.date === "Last week") {
        const w = new Date(now);
        w.setDate(now.getDate() - 7);
        dateMatch = created >= w;
      } else if (filters.date === "Last month") {
        const m = new Date(now);
        m.setMonth(now.getMonth() - 1);
        dateMatch = created >= m;
      }

      return statusMatch && dateMatch;
    });
  }, [transaction, filters]);

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

  const handleExport = () => {
    const dataToExport =
      tab === "payouts"
        ? getWithdrawals?.data
        : tab === "dispute"
        ? disputeData
        : transaction;

    // Call exportToCSV function with the table data and desired filename
    if (dataToExport.length > 0) exportToCSV(dataToExport, "WalletData");
    else console.log("No data to export.");
  };

  const filterTransaction = [
    {
      component: (
        <CustomSelect
          options={[
            "All Statuses",
            "Pending",
            "Completed",
            "Disputed",
            "Cancelled",
          ]}
          value={filters.status}
          onChange={(v) => setFilters((f: any) => ({ ...f, status: v }))}
        />
      ),
    },
    {
      component: (
        <CustomSelect
          options={["All Dates", "Yesterday", "Last week", "Last month"]}
          value={filters.date}
          onChange={(v) => setFilters((f: any) => ({ ...f, date: v }))}
        />
      ),
    },
  ];

  const filterPayout = [
    {
      component: (
        <CustomSelect
          options={["All Statuses", "PENDING", "PAID", "CANCELLED"]}
          value={payoutFilters.status}
          onChange={(v) =>
            setPayoutFilters((f: any) => ({ ...f, status: v, page: 1 }))
          }
        />
      ),
    },
  ];

  const filterDispute = [
    {
      component: (
        <CustomSelect
          options={["All Statuses", "Pending", "Completed", "Cancelled"]}
          value={filters.status}
          onChange={(v) => setFilters((f: any) => ({ ...f, status: v }))}
        />
      ),
    },
    {
      component: (
        <CustomSelect
          options={["All Dates", "Yesterday", "Last week", "Last month"]}
          value={filters.date}
          onChange={(v) => setFilters((f: any) => ({ ...f, date: v }))}
        />
      ),
    },
  ];

  const walletData = [
    {
      value: "transaction",
      title: "Transactions",
      note: "See all transaction made on your store",
      component: (
        <TableContainer
          searchClassName="mb-0 rounded-ee-none rounded-es-none"
          columns={WalletTransactionsCol.filter(
            ({ accessorKey }: any) => accessorKey !== "resolution"
          )}
          data={filteredTransaction}
          filterData={filterTransaction}
        />
      ),
    },
    {
      value: "payouts",
      title: "Payouts",
      note: "See all withdrawal you have made",
      component: (
        <TableContainer
          searchClassName="mb-0 rounded-ee-none rounded-es-none"
          columns={RequestPayoutCol}
          data={getWithdrawals?.data || []}
          filterData={filterPayout}
          search={payoutFilters.search}
          setSearch={setPayoutFilters}
          isServerSearch={true}
          isFetching={withdrawalStatus !== "success"}
        />
      ),
    },
    {
      value: "dispute",
      type: "business",
      title: "Payment dispute",
      note: "See all concerns related to the payment made for a service",
      component: (
        <TableContainer
          searchClassName="mb-0 rounded-ee-none rounded-es-none"
          columns={DisputeTransactionsCol}
          data={filteredDispute}
          filterData={filterDispute}
        />
      ),
    },
    {
      value: "verification",
      type: "business",
      title: "Verification status",
      note: "",
    },
  ];

  if (status === "loading") return <SkeletonCard2 />;
  if (transactionStatus !== "success") return <SkeletonCard2 />;
  if (withdrawalStatus !== "success") return <SkeletonCard2 />;
  return (
    <>
      {pathname === "/dashboard/wallet/view" ? (
        <ViewTransaction />
      ) : (
        <Dashboard className="bg-white">
          <div className="flex flex-col gap-2">
            <h3>Wallet</h3>
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
            <Tabs defaultValue={tab} className="w-full mt-2">
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
                                } absolute right-0 mt-2 p-4 max-w-[180px] bg-white rounded-lg shadow-md`}
                              >
                                <div className="flex flex-col gap-[16px]">
                                  <Button
                                    className="px-4 w-full sm:px-6 text-[12px]"
                                    variant="secondary"
                                    onClick={handleExport}
                                  >
                                    <span className="flex">Export All</span>
                                    <FileDownIcon className="ml-2 hidden sm:block h-5 w-5" />
                                  </Button>
                                  <Button onClick={() => setOpen(true)}>
                                    Request payouts
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* For larger screens, show the buttons inline */}
                            <div className="hidden md:flex flex-col sm:flex-row gap-[16px]">
                              <Button
                                variant="secondary"
                                onClick={handleExport}
                              >
                                <span className="flex">Export All</span>
                                <FileDownIcon className="ml-2 h-5 w-5" />
                              </Button>

                              <Button onClick={() => setOpen(true)}>
                                Request payouts
                              </Button>
                            </div>
                          </div>
                          <div className="mt-5">{item.component}</div>{" "}
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

const WalletTransactionsCol: ColumnDef<any>[] = [
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
    accessorKey: "transactionId",
    header: "ID",
    cell: ({ row }) => (
      <div className="font-medium ">
        {shortenText(row.getValue("transactionId"), 15)}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => <div>{formatDate(row.getValue("createdAt"))}</div>,
  },
  {
    accessorKey: "totalAmount",
    header: "Amount",
    cell: ({ row }) => (
      <div>
        {row?.original?.symbol}
        {row?.original?.amountPaid?.toLocaleString() || 0}
      </div>
    ),
  },
  {
    accessorKey: "purpose",
    header: "Type",
    cell: ({ row }) => (
      <div>
        {row.getValue("purpose") === "TICKET_PURCHASE" ? "Tickets" : "Services"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Payment Status",
    meta: {
      filterVariant: "select",
    },
    cell: ({ row }) => (
      <div>
        {row.getValue("status") === "PAID" ||
        row.getValue("status") === "COMPLETED" ? (
          <div className="py-1 px-2 bg-green-100 w-[105px] text-center text-green-700 rounded-md font-medium">
            Completed
          </div>
        ) : row.getValue("status") === "CONFIRMED" ? (
          <div className="py-1 px-2 bg-green-100 w-[105px] text-center text-green-700 rounded-md font-medium">
            Confirmed
          </div>
        ) : row.getValue("status") === "CANCELLED" ? (
          <div className="py-1 px-2 bg-red-100 w-[105px] text-center text-red-700 rounded-md font-medium">
            Cancelled
          </div>
        ) : (
          <div className="py-1 px-2 bg-yellow-100 w-[90px] text-center text-yellow-700 rounded-md font-medium">
            Pending
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "resolution",
    header: "Resolution",
    meta: {
      filterVariant: "resolution",
    },
    cell: ({ row }) => (
      <div>
        {row.getValue("orderStatus") === "COMPLETED" ? (
          <div className="font-medium">Refund</div>
        ) : (
          <div className="font-medium">Paid</div>
        )}
      </div>
    ),
  },

  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      console.log(row.original);
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
                  onClick={() => {
                    sessionStorage.setItem(
                      "selectedTransact",
                      JSON.stringify(row.original)
                    );
                    navigation.push(`view`);
                  }}
                >
                  View Transaction
                </DropdownMenuItem>
                {/* <DropdownMenuItem
                  onClick={() => deleteOrders.mutate(row.original.id)}
                  style={{ color: "red", fontWeight: "500" }}
                >
                  Delete
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          }
        </div>
      );
    },
  },
];

const DisputeTransactionsCol: ColumnDef<any>[] = [
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
    accessorKey: "vendor",
    header: "Vendor",
    cell: ({ row }) => (
      <div className="capitalize flex gap-2 items-center font-medium ">
        <Avatar className="align-center">
          <Avatar>
            <AvatarImage
              src={row?.original?.vendor?.User?.avatar || "/noavatar.png"}
            />
          </Avatar>
        </Avatar>
        <div>
          {row?.original?.vendor?.User?.first_name}{" "}
          {row?.original?.vendor?.User?.last_name}
        </div>
      </div>
    ),
    filterFn: (row, _columnId, filterValue) => {
      const firstName = row.original.user?.first_name?.toLowerCase() || "";
      const lastName = row.original.user?.last_name?.toLowerCase() || "";
      const fullName = `${firstName} ${lastName}`;

      return fullName.includes(filterValue.toLowerCase());
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => <div>{formatDate(row.getValue("createdAt"))}</div>,
  },
  {
    accessorKey: "totalAmount",
    header: "Amount",
    cell: ({ row }) => (
      <div>
        {row?.original?.order?.symbol}{" "}
        {row?.original?.order?.totalAmount?.toLocaleString() || 0}
      </div>
    ),
  },
  {
    accessorKey: "orderStatus",
    header: "Payment Status",
    meta: {
      filterVariant: "select",
    },
    cell: ({ row }) => (
      <div>
        {row.getValue("status") === "PAID" ||
        row.getValue("status") === "COMPLETED" ? (
          <div className="py-1 px-2 bg-green-100 w-[105px] text-center text-green-700 rounded-md font-medium">
            Completed
          </div>
        ) : row.getValue("status") === "CONFIRMED" ? (
          <div className="py-1 px-2 bg-green-100 w-[105px] text-center text-green-700 rounded-md font-medium">
            Confirmed
          </div>
        ) : row.getValue("status") === "CANCELLED" ? (
          <div className="py-1 px-2 bg-red-100 w-[105px] text-center text-red-700 rounded-md font-medium">
            Cancelled
          </div>
        ) : (
          <div className="py-1 px-2 bg-yellow-100 w-[90px] text-center text-yellow-700 rounded-md font-medium">
            Pending
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "resolution",
    header: "Resolution",
    meta: {
      filterVariant: "resolution",
    },
    cell: ({ row }) => (
      <div>
        {row?.original?.order?.orderStatus === "COMPLETED" ? (
          <div className="font-medium">Refund</div>
        ) : (
          <div className="font-medium">Paid</div>
        )}
      </div>
    ),
    filterFn: (row, _columnId, filterValue) => {
      const status = row?.original?.order?.orderStatus;
      // console.log(row);
      // console.log(filterValue);
      if (filterValue === "Refund") return status === "COMPLETED";
      else if (filterValue === "Paid") return status === "DISPUTED";
      return true;
    },
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
                  onClick={() => {
                    sessionStorage.setItem(
                      "selectedTransact",
                      JSON.stringify(row.original)
                    );
                    navigation.push(`view`);
                  }}
                >
                  View Transaction
                </DropdownMenuItem>
                {/* <DropdownMenuItem
                  onClick={() => deleteOrders.mutate(row.original.id)}
                  style={{ color: "red", fontWeight: "500" }}
                >
                  Delete
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          }
        </div>
      );
    },
  },
];

const RequestPayoutCol: ColumnDef<any>[] = [
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
    header: "id",
    cell: ({ row }) => <div className="font-medium ">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "type",
    header: "Payment method",
    cell: ({ row }) => (
      <div className="font-medium ">{row.getValue("type") || "PAYSTACK"}</div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const { data: user } = useGetUser();
      return (
        <div className="font-medium">
          {user?.currencySymbol}
          {row.getValue("amount")?.toLocaleString() || 0}
        </div>
      );
    },
  },
  {
    accessorKey: "payoutAccountNumber",
    header: "Account Number",
    cell: ({ row }) => (
      <div className="font-medium ">{row.getValue("payoutAccountNumber")}</div>
    ),
  },
  {
    accessorKey: "payoutBankName",
    header: "Account Number",
    cell: ({ row }) => (
      <div className="font-medium ">
        {shortenText(row.getValue("payoutBankName"), 20)}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => <div>{formatDate(row.getValue("createdAt"))}</div>,
  },
  {
    accessorKey: "status",
    header: "Payment Status",
    meta: {
      filterVariant: "select",
    },
    cell: ({ row }) => (
      <div>
        {row.getValue("status") === "PAID" ||
        row.getValue("status") === "COMPLETED" ? (
          <div className="py-1 px-2 bg-green-100 w-[105px] text-center text-green-700 rounded-md font-medium">
            Completed
          </div>
        ) : row.getValue("status") === "CONFIRMED" ? (
          <div className="py-1 px-2 bg-green-100 w-[105px] text-center text-green-700 rounded-md font-medium">
            Confirmed
          </div>
        ) : row.getValue("status") === "CANCELLED" ? (
          <div className="py-1 px-2 bg-red-100 w-[105px] text-center text-red-700 rounded-md font-medium">
            Cancelled
          </div>
        ) : (
          <div className="py-1 px-2 bg-yellow-100 w-[90px] text-center text-yellow-700 rounded-md font-medium">
            Pending
          </div>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      console.log(row.original);
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
