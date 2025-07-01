"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import empty from "@/components/assets/images/dashboard/empty.svg";
import { ColumnDef, flexRender } from "@tanstack/react-table";
import { PaginationContainer } from "./pagination";
import { LogoLoader } from "./skeleton";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  VisibilityState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Input } from "./input";

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className='w-full overflow-auto rounded-md'>
      <table
        ref={ref}
        className={cn("w-full border border-gray-200 caption-bottom text-sm mb-[100px]", className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn("relative bg-gray-100 max-w-full overflow-auto [&_tr]:border-b", className)}
      {...props}
    />
  )
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn("relative max-w-full overflow-auto [&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} {...props} />
  )
);
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-12 px-4 text-left hover:text-red-700 align-middle font-[400] text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />
  )
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
  )
);
TableCaption.displayName = "TableCaption";

const Empty = ({ title }: { title?: string }) => {
  return (
    <div className='flex flex-col items-center mt-5 justify-center w-full h-[200px] gap-4'>
      <Image src={empty} alt='empty' width={100} height={100} className='w-[100px] h-auto' />
      <p className='text-[#666666] text-center max-w-[400px] w-full'>{title ? title : "No data yet"}</p>
    </div>
  );
};

interface TableContainerProps {
  isPagination?: boolean;
  isFetching?: boolean;
  isSearch?: boolean;
  emptyTitle?: string;
  searchClassName?: string;
  searchPlaceHolder?: string;
  data: any[];
  columns: ColumnDef<any, any>[];
  pageSize?: number;
}

const TableContainer = ({
  data,
  columns,
  pageSize = 10,
  isPagination = true,
  isFetching = false,
  emptyTitle,
  isSearch = false,
  searchPlaceHolder = "Search",
  searchClassName,
}: TableContainerProps) => {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize });

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className='w-full'>
      {isSearch && (
        <Input
          placeholder={searchPlaceHolder}
          className={searchClassName}
          value={(table?.getColumn("user")?.getFilterValue() as string) || ""}
          onChange={(event) => table.getColumn("user")?.setFilterValue(event.target.value)}
        />
      )}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup: any) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header: any) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : (
                    <div
                      {...{
                        className: header.column.getCanSort() ? "cursor-pointer select-none" : "",
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row: any) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell: any) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <tr>
              <td colSpan={table.getAllColumns().length}>
                <Empty title={emptyTitle} />
              </td>
            </tr>
          )}
        </TableBody>
      </Table>
      {isFetching && <LogoLoader />}
      {/* {isFetching && <LogoLoader type={2} />} */}
      {isPagination && <PaginationContainer table={table} />}
    </div>
  );
};

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  Empty,
  TableContainer,
};
