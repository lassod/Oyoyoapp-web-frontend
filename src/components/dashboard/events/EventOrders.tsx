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
import { EventOrdersCol } from "@/app/components/schema/Columns";
import empty from "../../../components/assets/images/dashboard/empty.svg";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Image from "next/image";
import { Dashboard } from "@/components/ui/containers";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { FaFilter } from "react-icons/fa";
import { FaChevronUp, FaChevronDown } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import { useGetVendor } from "@/hooks/vendors";
import { formatDate } from "@/lib/auth-helper";

const EventOrders = ({ data }: any) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 }); // Set default page size to 10
  const { data: vendor } = useGetVendor();

  const table = useReactTable({
    data: data || [],
    columns: EventOrdersCol,
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

  console.log(vendor);
  const handleDownloadCSV = () => {
    const csvRows = [];
    const headers = [
      "Full Name",
      "Email",
      "Phone",
      `Amount (${vendor.User.preferredCurrency})`,
      "Date",
      "State",
      "Country",
    ];
    csvRows.push(headers.join(",")); // Add headers

    data.forEach((item: any) => {
      const user = item.User;
      const fullname = `${user?.first_name} ${user?.last_name}` || item?.orderItem?.fullName;
      const amount = item.orderItem?.priceInSettlementCurrency?.toLocaleString() || 0;
      console.log(amount);
      const row = [
        fullname || "--",
        user?.email || item?.orderItem?.email || "--",
        user?.phone || item?.orderItem?.phoneNumber || "--",
        amount,
        formatDate(item.createdAt),
        user?.state || "--",
        user?.country || "--",
      ];
      csvRows.push(row.join(","));
    });

    // Convert to CSV format
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    // Create a link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = "Registered_Guests.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className='px-4 sm:px-8'>
      <h6>Order history</h6>

      <div className='relative'>
        <div className='max-w-full mt-5 lg:mt-0'>
          <div className='flex gap-[10px] mt-[10px]'>
            {/* <div className='flex items-center border font-[500] border-gray-300 rounded-lg gap-1.5 justify-center px-2 py-1 text-sm'>
              <Calendar fill='#0F132499' className='text-white' />
              Last 7 days
            </div> */}
            <DropdownFilterMenu table={table} />
          </div>
          <div className='flex justify-between gap-6 flex-wrap items-center py-4'>
            <Input
              placeholder='Search Customer'
              value={(table?.getColumn("customer")?.getFilterValue() as string) || ""}
              onChange={(event) => table.getColumn("customer")?.setFilterValue(event.target.value)}
              className='max-w-sm'
            />
            <Button type='button' className='flex items-center gap-1 mr-0' onClick={handleDownloadCSV}>
              Export All
              <DownloadIcon className='hidden sm:block' />
            </Button>
          </div>
          <div className='relative bg-white'>
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
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <tr>
                    <td colSpan={table.getAllColumns().length}>
                      <div className='flex flex-col items-center justify-center w-full h-[200px] gap-4'>
                        <Image src={empty} alt='empty' width={100} height={100} className='w-[100px] h-auto' />
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
                      <PaginationPrevious onClick={() => table.previousPage()} isActive={table.getCanPreviousPage()} />
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
      </div>
    </div>
  );
};

export default EventOrders;

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
          !["id", "customer", "settlementAmount", "createdAt", "quantity", "email", "phone"].includes(column.id) ? (
            <div key={column.id} className='flex flex-col gap-1'>
              <label>{column.columnDef.header}:</label>
              {column.columnDef.meta?.filterVariant === "select" && (
                <Select onValueChange={(value) => column.setFilterValue(value === "all" ? undefined : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${column.columnDef.header}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All</SelectItem>
                    <SelectItem value='Active'>Paid</SelectItem>
                    <SelectItem value='Inactive'>Pending</SelectItem>
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
