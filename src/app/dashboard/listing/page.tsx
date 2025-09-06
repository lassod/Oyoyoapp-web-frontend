"use client";
import * as React from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dashboard } from "@/components/ui/containers";
import { TableContainer } from "@/components/ui/table";
import empty from "../../components/assets/images/empty.svg";

import { useGetVendorByUserId } from "@/hooks/guest";
import { useGetVendorServices } from "@/hooks/vendors";

import { CustomSelect } from "@/components/ui/select";
import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { shortenText } from "@/lib/auth-helper";

const Listing = () => {
  const { data: session } = useSession();
  const { data: vendor } = useGetVendorByUserId(session?.user?.id);
  const { data: service } = useGetVendorServices(vendor?.id);

  // Raw rows from API (fallback to [])
  const rows = service?.[0]?.Service_Plans ?? [];

  // Local UI state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All Status" | "Active" | "Inactive">("All Status");
  const [category, setCategory] = useState<string>("All Categories");

  // Build category options dynamically from data
  const categoryOptions = useMemo(() => {
    const names = new Set<string>();
    for (const r of rows) {
      const n = (r?.name ?? "").toString().trim();
      if (n) names.add(n);
    }
    return ["All Categories", ...Array.from(names).sort((a, b) => a.localeCompare(b))];
  }, [rows]);

  // Apply filters + search (case-insensitive)
  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rows.filter((r: any) => {
      const pkg = (r?.package_name ?? "").toString().toLowerCase();
      const cat = (r?.name ?? "").toString();
      const isActive = !!r?.is_active;

      const matchesSearch = !q || pkg.includes(q);
      const matchesStatus = status === "All Status" ? true : status === "Active" ? isActive : !isActive;
      const matchesCategory = category === "All Categories" ? true : cat === category;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [rows, search, status, category]);

  // Toolbar filters to render inside TableContainer header
  const filterData = [
    {
      component: (
        <CustomSelect
          options={["All Status", "Active", "Inactive"]}
          value={status}
          onChange={(v) => setStatus(v as typeof status)}
        />
      ),
    },
    {
      component: <CustomSelect options={categoryOptions} value={category} onChange={(v) => setCategory(v)} />,
    },
  ];

  return (
    <Dashboard className='bg-white'>
      <div className='flex flex-row justify-between items-center'>
        <h3>Services</h3>
        <span className='flex gap-[16px]'>
          <Link href='/dashboard/service/listing/new'>
            <Button className='max-w-[115px] sm:max-w-[140px]'>New service</Button>
          </Link>
        </span>
      </div>

      <div className='mt-5'>
        {/* Search input */}
        <div className='flex items-center py-4 gap-3'>
          <Input
            placeholder='Search package'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='max-w-sm'
          />
        </div>

        {/* Unified table pattern (same as Orders/Tickets) */}
        <TableContainer
          // searchKey='package_name'
          isFetching={false}
          columns={ListingCol}
          data={filteredData}
          filterData={filterData}
          emptyTitle='No data yet'
        />
      </div>
    </Dashboard>
  );
};

export default Listing;

const ListingCol: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className='border border-gray-300'
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className='border border-gray-300'
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "package_name",
    header: "Package",
    cell: ({ row }) => <div>{row.original.package_name && shortenText(row.getValue("package_name"), 20)}</div>,
  },
  {
    accessorKey: "package_description",
    header: "Description",
    cell: ({ row }) => (
      <div>{row.original.package_description && shortenText(row.getValue("package_description"), 20)}</div>
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
        <div className='font-medium '>
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
          <div className='py-1 px-2 bg-green-100 text-green-700 rounded-md w-[55px]'>Active</div>
        ) : (
          <div className='py-1 px-2 text-red-700 rounded-md bg-red-100 w-[65px]'>Inactive</div>
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
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <span className='sr-only'>Open menu</span>
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => navigation.push(`listing/${row.original.ServiceId}`)}>
                  View Listing
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem style={{ color: "red", fontWeight: "500" }}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        </div>
      );
    },
  },
];
