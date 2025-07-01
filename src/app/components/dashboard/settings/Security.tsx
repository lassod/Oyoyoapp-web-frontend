"use client";
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { SecurityCol } from "../../schema/Columns";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import empty from "../../../components/assets/images/empty.svg";
import Image from "next/image";
import { useGetUserLog } from "@/hooks/user";
import SkeletonTable from "@/components/ui/skeleton";

export const Security = () => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 6 }); // Set default page size to 10
  const { data: logs, status } = useGetUserLog();

  const table = useReactTable({
    data: logs,
    columns: SecurityCol,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  return (
    <div className='flex flex-col h-full'>
      <div className='my-[15px]'>
        <h6>Sign in history</h6>
        <p>Review recent sign in activity to your account.</p>
      </div>
      <div className='border-b border-gray-200 mb-5'></div>
      {/* <div className='flex gap-[10px] '>
        <Switch id='airplane-mode' />
        <p>Notify me when I log in from a new IP address</p>
      </div> */}
      <div className='relative flex items-center py-4'>
        <div className='w-full'>
          {status === "success" ? (
            <div>
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
          ) : (
            <SkeletonTable />
          )}
        </div>
      </div>
    </div>
  );
};
