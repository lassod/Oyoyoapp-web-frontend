"use client";
// import { useState } from "react";
import * as React from "react";
import { Pagination } from "@/components/ui/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ColumnDef, ColumnFiltersState, SortingState, VisibilityState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const data: Payment[] = [
	{
		id: "m5gr84i9",
		price: 792,
		package: "Vanilla cake",
		description: "A creamy sweet cake that can...",
		category: "Basic",
		order: 2,
		sale: 792,
		isOnline: "Active",
	},
	{
		id: "o9ebht6q",
		price: 792,
		package: "Cake",
		description: "A creamy sweet cake that can...",
		category: "Standard",
		order: 5,
		sale: 1210,
		isOnline: "Active",
	},
	{
		id: "n11iogs",
		price: 792,
		package: "Cupcake",
		description: "A creamy sweet cake that can...",
		category: "Premium",
		order: 9,
		sale: 792,
		isOnline: "Inactive",
	},
	{
		id: "lo984hk",
		price: 792,
		package: "Cake",
		description: "A creamy sweet cake that can...",
		category: "Basic",
		order: 1,
		sale: 1678,
		isOnline: "Active",
	},

	{
		id: "3u1reuv4",
		price: 792,
		package: "Cake",
		description: "A creamy sweet cake that can...",
		category: "Basic",
		order: 1,
		sale: 521,
		isOnline: "Active",
	},
	{
		id: "derv1ws0",
		price: 792,
		package: "Cake",
		description: "A creamy sweet cake that can...",
		category: "Basic",
		order: 1,
		sale: 2893,
		isOnline: "Active",
	},
	{
		id: "5kma53ae",
		price: 792,
		package: "Cake",
		description: "A creamy sweet cake that can...",
		category: "Basic",
		order: 1,
		sale: 657,
		isOnline: "Active",
	},
	{
		id: "bhqecj4p",
		price: 1432,
		package: "Cake",
		description: "A creamy sweet cake that can...",
		category: "Basic",
		order: 0,
		sale: 792,
		isOnline: "Inactive",
	},
];

export type Payment = {
	id: string;
	price: number;
	package: "Vanilla cake" | "Cake" | "Cupcake";
	description: string;
	category: "Basic" | "Standard" | "Premium";
	order: number;
	sale: number;
	isOnline: "Active" | "Inactive";
};

export const columns: ColumnDef<Payment>[] = [
	{
		id: "select",
		header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
		cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "package",
		header: "Package",
		cell: ({ row }) => (
			<div className="capitalize flex gap-2 font-bold justify-center items-center">
				<Avatar className="align-center">
					<Avatar>
						<AvatarImage src="https://github.com/shadcn.png" />
						<AvatarFallback>CN</AvatarFallback>
					</Avatar>
				</Avatar>
				{row.getValue("package")}
			</div>
		),
	},
	{
		accessorKey: "description",
		header: "Description",
		cell: ({ row }) => <div className="capitalize">{row.getValue("description")}</div>,
	},
	{
		accessorKey: "category",
		header: "Category",
		cell: ({ row }) => <div className="capitalize">{row.getValue("category")}</div>,
	},
	{
		accessorKey: "price",
		header: () => <div className="text-center">price</div>,
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue("price"));

			// Format the price as a dollar price
			const formatted = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).format(amount);

			return <div className="text-right font-medium">{formatted}</div>;
		},
	},
	{
		accessorKey: "order",
		header: "Total Orders",
		cell: ({ row }) => <div className="text-center font-medium capitalize">{row.getValue("order")}</div>,
	},
	{
		accessorKey: "sale",
		header: () => <div className="text-center">Total Sales</div>,
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue("sale"));

			// Format the price as a dollar price
			const formatted = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).format(amount);

			return <div className="text-center font-medium">{formatted}</div>;
		},
	},
	{
		accessorKey: "isOnline",
		header: "Status",
		cell: ({ row }) => <div className="capitalize px-2 border-2 border-solid rounded-md">{row.getValue("isOnline")}</div>,
	},
	{
		id: "actions",
		enableHiding: false,
		cell: ({ row }) => {
			const payment = row.original;

			return (
				<div>
					{
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="h-8 w-8 p-0">
									<span className="sr-only">Open menu</span>
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>View Listing</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem>Edit Listing</DropdownMenuItem>
								<DropdownMenuItem style={{ color: "red", fontWeight: "500" }}>Delete</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					}
				</div>
			);
		},
	},
];

export function DataTableDemo() {
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
			<div className="flex items-center py-4 ">
				<Input placeholder="Search product" value={(table.getColumn("package")?.getFilterValue() as string) ?? ""} onChange={(event) => table.getColumn("package")?.setFilterValue(event.target.value)} className="max-w-sm" />
			</div>
			<div className="rounded-md border">
				<Table>
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
			<div className="items-center">
				<Pagination />
			</div>
		</div>
	);
}
