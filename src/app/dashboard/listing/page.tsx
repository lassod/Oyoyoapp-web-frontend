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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import empty from "../../components/assets/images/empty.svg";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from "next/link";
import { ListingCol } from "@/app/components/schema/Columns";
import { useGetVendorServices } from "@/hooks/vendors";
import { useState } from "react";
import { Dashboard } from "@/components/ui/containers";
import { useSession } from "next-auth/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { FaFilter } from "react-icons/fa";
import { FaChevronUp, FaChevronDown } from "react-icons/fa6";
import { useGetVendorByUserId } from "@/hooks/guest";

const Listing = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const { data: session } = useSession();
  const { data: vendor } = useGetVendorByUserId(session?.user?.id);
  const { data: service } = useGetVendorServices(vendor?.id);

  console.log(service);
  const table = useReactTable({
    data: service?.[0]?.Service_Plans || [],
    columns: ListingCol,
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

  return (
    <Dashboard className='bg-white'>
      <div className='flex flex-row justify-between items-center'>
        <h5>Services</h5>
        <span className='flex gap-[16px]'>
          {/* <Button variant={"secondary"}>Action</Button> */}
          <Link href='/dashboard/service/listing/new'>
            <Button className='max-w-[115px] sm:max-w-[140px]'>New service</Button>
          </Link>
        </span>
      </div>

      <div className='mt-5'>
        <div className='flex gap-[10px] mt-[20px]'>
          {/* <div className='flex items-center border font-[500] border-gray-300 rounded-lg gap-1.5 justify-center px-2 py-1 text-sm'>
              <Calendar fill='#0F132499' className='text-white' />
              Last 7 days
            </div> */}
          <DropdownFilterMenu table={table} />
        </div>
        <div className='relative'>
          <div className='max-w-full'>
            <div className='flex items-center py-4 '>
              <Input
                placeholder='Search package'
                value={(table.getColumn("package_name")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("package_name")?.setFilterValue(event.target.value)}
                className='max-w-sm'
              />
            </div>
            <div>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
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
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
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
        </div>
      </div>
    </Dashboard>
  );
};

export default Listing;

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
          column.getCanFilter() && !["id", "createdAt", "price", "package_name", "actions"].includes(column.id) ? (
            <div key={column.id} className='flex flex-col gap-1'>
              <label>{column.columnDef.header}:</label>
              {column.columnDef.meta?.filterVariant === "select" ? (
                <Select onValueChange={(value) => column.setFilterValue(value === "all" ? undefined : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${column.columnDef.header}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All</SelectItem>
                    <SelectItem value='Basic'>Basic</SelectItem>
                    <SelectItem value='Standard'>Standard</SelectItem>
                  </SelectContent>
                </Select>
              ) : column.columnDef.meta?.filterVariant === "status" ? (
                <Select
                  onValueChange={(value) =>
                    column.setFilterValue(value === "all" ? undefined : value === "Active" ? true : false)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${column.columnDef.header}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All</SelectItem>
                    <SelectItem value='Active'>Active</SelectItem>
                    <SelectItem value='Inactive'>Inactive</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  onChange={(e) => column.setFilterValue(e.target.value)}
                  placeholder={`Search ${column.columnDef.header}`}
                  type='text'
                />
              )}
            </div>
          ) : null
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
