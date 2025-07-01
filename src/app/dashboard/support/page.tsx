"use client";
import React, { useEffect, useState } from "react";
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
import { MessageSquareMore, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SupportCol } from "../../components/schema/Columns";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Dashboard } from "@/components/ui/containers";
import empty from "../../components/assets/images/empty.svg";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Image from "next/image";
import { NewTicket } from "@/app/components/dashboard/Ticket";
import { useGetUserSupportTickets } from "@/hooks/support";
import SkeletonTable from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaFilter } from "react-icons/fa";
import { FaChevronUp, FaChevronDown } from "react-icons/fa6";

const TawkTo: React.FC = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://tawk.to/chat/615d6bc925797d7a89029219/1fhaeq3vv";
    script.async = true;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");

    document.body.appendChild(script);
    console.log("TawkTo script added");

    return () => {
      document.body.removeChild(script);
      console.log("TawkTo script removed");
    };
  }, []);

  return null;
};

const SupportPage = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 6 }); // Set default page size to 10
  const { data: tickets, status } = useGetUserSupportTickets();

  const table = useReactTable({
    data: tickets,
    columns: SupportCol,
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
    <Dashboard className='bg-white'>
      <div className='flex flex-col mb-6'>
        <div className='flex flex-row justify-between items-center'>
          <span>
            <h5 className='mb-2'>Help & Support</h5>
            <p>Manage all support tickets on oyoyo</p>
          </span>
          <div className='flex gap-[16px]'>
            {/* <Link
              target='_blank'
              rel='noopener noreferrer'
              href='https://tawk.to/chat/615d6bc925797d7a89029219/1fhaeq3vv'
              className='btn'
            >
              <Button variant={"secondary"}>
                <MessageSquareMore className='mr-2 h-4 w-4' />
                Live chat
              </Button>
            </Link> */}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className='flex flex-row text-center justify-start items-center gap-[5px] mr-0 max-w-[190px] sm:max-w-[250px]'>
                  <Plus className='hidden sm:flex h-4 w-4' />
                  <span>New ticket</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <NewTicket edit='none' />
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className='sm:mt-10'>
        <div className='flex gap-[10px] mt-[20px]'>
          {/* <FilterMenu
            type={2}
            filterDateRange={filterPast}
            placeholder={"Filter by Date"}
            setFilterDateRange={setFilterPast}
          /> */}
          <DropdownFilterMenu table={table} />
        </div>

        <div className='relative'>
          {status !== "success" ? (
            <SkeletonTable />
          ) : (
            <div className='max-w-full'>
              <div className='flex items-center py-4 '>
                <Input
                  placeholder='Search tickets'
                  value={(table.getColumn("subject")?.getFilterValue() as string) ?? ""}
                  onChange={(event) => table.getColumn("subject")?.setFilterValue(event.target.value)}
                  className='max-w-sm'
                />
              </div>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead className='tableHeader' key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
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
          )}
        </div>
      </div>
      <TawkTo />
    </Dashboard>
  );
};

export default SupportPage;

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
          column.getCanFilter() && !["id", "createdAt", "subject"].includes(column.id) ? (
            <div key={column.id} className='flex flex-col gap-1'>
              <label>{column.columnDef.header}:</label>
              {column.columnDef.meta?.filterVariant === "select" && (
                <Select onValueChange={(value) => column.setFilterValue(value === "all" ? undefined : value)}>
                  <SelectTrigger className='gap-3'>
                    <SelectValue placeholder={`Select ${column.columnDef.header}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All</SelectItem>
                    <SelectItem value='Resolved'>Resolved</SelectItem>
                    <SelectItem value='Open'>Open</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {column.columnDef.meta?.filterVariant === "category" && (
                <Select onValueChange={(value) => column.setFilterValue(value === "All" ? undefined : value)}>
                  <SelectTrigger className='gap-3'>
                    <SelectValue placeholder={`Select ${column.columnDef.header}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {["All", "Account", "Orders", "Services", "Payments", "Events"].map((item, index) => (
                      <SelectItem key={index} value={item}>
                        {item}
                      </SelectItem>
                    ))}
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
