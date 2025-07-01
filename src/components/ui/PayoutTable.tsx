"use client";

import * as React from "react";
import { ColumnDef, ColumnFiltersState, SortingState, VisibilityState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const data: PayoutTable[] = [
	{
		id: "m5gr84i9",
		ids: 2001,
		amount: 316,
		status: "Paid",
		customer: "Brandon Clark",
		date: "Today at 6:58pm",
	},
	{
		id: "3u1reuv4",
		ids: 2002,
		amount: 242,
		status: "Cancelled",
		customer: "Ryan Mitchell",
		date: "Today at 2:24pm",
	},
	{
		id: "derv1ws0",
		ids: 2003,
		amount: 837,
		status: "Pending",
		customer: "Mia Rodriguez",
		date: "Today at 10:32pm",
	},
	{
		id: "5kma53ae",
		ids: 2004,
		amount: 874,
		status: "Cancelled",
		customer: "Katherine Turner",
		date: "Today at 1:03pm",
	},
	{
		id: "bhqecj4p",
		ids: 2005,
		amount: 721,
		status: "Pending",
		customer: "Sarah Reynolds",
		date: "Today at 10:47am",
	},
	{
		id: "m5gr84i9",
		ids: 2006,
		amount: 2893,
		status: "Pending",
		customer: "David Larson",
		date: "Today at 7:31pm",
	},
	{
		id: "m5gr84i9",
		ids: 2007,
		amount: 657,
		status: "Paid",
		customer: "Emma Thompson",
		date: "Yesterday at 11:34pm",
	},
	{
		id: "m5gr84i9",
		ids: 2008,
		amount: 1432,
		status: "Paid",
		customer: "Alex Chen",
		date: "Yesterday at 9:16pm",
	},
	{
		id: "m5gr84i9",
		ids: 2009,
		amount: 1008,
		status: "Paid",
		customer: "Olivia Bennett",
		date: "Yesterday at 6:09pm",
	},
	{
		id: "m5gr84i9",
		ids: 2010,
		amount: 2165,
		status: "Pending",
		customer: "Ethan Reynolds",
		date: "Yesterday at 4:14pm",
	},
	{
		id: "m5gr84i9",
		ids: 2011,
		amount: 1008,
		status: "Paid",
		customer: "Olivia Benette",
		date: "Yesterday at 6:09pm",
	},
	{
		id: "m5gr84i9",
		ids: 2012,
		amount: 1267,
		status: "Paid",
		customer: "Sarah Reynold",
		date: "Yesteray at 6:09pm",
	},
	{
		id: "m5gr84i9",
		ids: 2013,
		amount: 1267,
		status: "Paid",
		customer: " Oliver Brown",
		date: "Today at 6:58pm",
	},
];

export type PayoutTable = {
	id: string;
	ids: number;
	amount: number;
	status: "Paid" | "Cancelled" | "Pending";
	customer: string;
	date: any;
};

export const columns: ColumnDef<PayoutTable>[] = [
	{
		id: "select",
		header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
		cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "ids",
		header: "ID",
		cell: ({ row }) => <div className="align-left">{row.getValue("ids")}</div>,
	},
	{
		accessorKey: "customer",
		header: " Customer",
		cell: ({ row }) => <div className="align-left">{row.getValue("customer")}</div>,
	},
	{
		accessorKey: "date",
		header: " Date",
		cell: ({ row }) => <div className="align-left">{row.getValue("date")}</div>,
	},

	{
		accessorKey: "amount",
		header: () => <div>Amount</div>,
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue("amount"));

			// Format the amount as a dollar amount
			const formatted = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).format(amount);

			return <div className=" font-medium">{formatted}</div>;
		},
	},
	{
		accessorKey: "status",
		header: "Payment status",
		cell: ({ row }) => <div className="capitalize">{row.getValue("status") === "Paid" ? <div className="py-1 px-2 bg-green-100 text-green-700 rounded-md">Paid</div> : <div className="py-1 px-2 mx-0 text-red-700 rounded-md bg-red-100">Cancelled</div>} </div>,
	},
	{
		id: "actions",
		enableHiding: false,
		cell: ({ row }) => {
			const payment = row.original;

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>View transaction</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>Print Receipt</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];

export function PayoutTable() {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState({});

	const table = useReactTable({
		data,
		columns,
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
		<div className="w-full">
			<div className="flex items-center py-4">
				<Input placeholder="Search Transaction" value={(table.getColumn("customer")?.getFilterValue() as string) ?? ""} onChange={(event) => table.getColumn("customer")?.setFilterValue(event.target.value)} className="max-w-sm" />
			</div>
			<div className="rounded-md border">
				<Table className="max-w-[1020px]">
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead className="tableHeader" key={header.id}>
											{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
										<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell className="h-24 text-center">No results.</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-end space-x-2 py-4">
				<div className="flex-1 text-sm text-muted-foreground">
					{table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
				</div>
				{/* <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div> */}
			</div>
		</div>
	);
}
