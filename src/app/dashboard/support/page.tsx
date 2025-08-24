"use client";
import React, { useEffect, useMemo, useState } from "react";
import { MessageSquareMore, MoreVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
} from "@/components/ui/alert-dialog";
import { Dashboard } from "@/components/ui/containers";
import { TableContainer } from "@/components/ui/table";
import { NewTicket } from "@/app/components/dashboard/Ticket";
import { useGetUserSupportTickets } from "@/hooks/support";
import { CustomSelect } from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/auth-helper";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SupportPage = () => {
  const { data: tickets = [], status } = useGetUserSupportTickets();

  // Filters exactly like Wallet’s pattern
  const [filters, setFilters] = useState<{ status: string; category: string }>({
    status: "All Statuses",
    category: "All Categories",
  });

  // Build Category options from incoming data
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    (tickets || []).forEach((t: any) => {
      if (t?.name) set.add(String(t.name));
    });
    return ["All Categories", ...Array.from(set)];
  }, [tickets]);

  // Apply client-side filters (TableContainer will handle search by searchKey)
  const filteredTickets = useMemo(() => {
    if (!tickets?.length) return [];
    return tickets.filter((t: any) => {
      const statusMatch =
        filters.status === "All Statuses" ||
        (filters.status === "Resolved" && t.status === "Resolved") ||
        (filters.status === "Open" && t.status === "Open");

      const categoryMatch =
        filters.category === "All Categories" ||
        String(t?.name || "") === filters.category;

      return statusMatch && categoryMatch;
    });
  }, [tickets, filters]);

  // Build filter UI for TableContainer (same style as Wallet)
  const filterData = [
    {
      component: (
        <CustomSelect
          options={["All Statuses", "Resolved", "Open"]}
          value={filters.status}
          onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
        />
      ),
    },
    {
      component: (
        <CustomSelect
          options={categoryOptions}
          value={filters.category}
          onChange={(v) => setFilters((f) => ({ ...f, category: v }))}
        />
      ),
    },
  ];

  return (
    <Dashboard className="bg-white">
      <div className="flex flex-col mb-6">
        <div className="flex flex-row justify-between items-center">
          <span>
            <h5 className="mb-2">Help & Support</h5>
            <p>Manage all support tickets on Oyoyo</p>
          </span>
          <div className="flex gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>New ticket</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <NewTicket edit="none" />
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className="sm:mt-6">
        {/* Skeleton while loading (optional; TableContainer can also show its own loader via isFetching) */}
        <TableContainer
          // ✅ just like Wallet
          searchKey="subject"
          isFetching={status !== "success"}
          columns={SupportCol}
          data={filteredTickets}
          filterData={filterData}
        />
      </div>

      <TawkTo />
    </Dashboard>
  );
};

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

export default SupportPage;

const SupportCol: ColumnDef<any>[] = [
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
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => (
      <div className="font-medium ">{row.getValue("subject")}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => <div>{formatDate(row.getValue("createdAt"))}</div>,
  },
  {
    accessorKey: "name",
    header: "Category",
    meta: {
      filterVariant: "category",
    },
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },

  {
    accessorKey: "status",
    header: "Payment Status",
    meta: {
      filterVariant: "select",
    },
    cell: ({ row }) => (
      <div>
        {row.getValue("status") === "Resolved" ? (
          <div className="py-1 px-2 bg-green-100 text-center max-w-[75px] text-green-700 rounded-md font-medium">
            Resolved
          </div>
        ) : (
          <div className="py-1 px-2 text-red-700 rounded-md bg-red-100 text-center max-w-[50px] font-medium">
            Open
          </div>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const [isEditOpen, setEditOpen] = useState(false);
      const [isDeleteOpen, setDeleteOpen] = useState(false);

      return (
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setEditOpen(true)} // Open Edit dialog
              >
                View Ticket
              </DropdownMenuItem>
              {/* <DropdownMenuItem
                onClick={() => setDeleteOpen(true)} // Open Delete dialog
                style={{ color: "red", fontWeight: "500" }}
              >
                Delete
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={isEditOpen} onOpenChange={setEditOpen}>
            <AlertDialogContent className="left-[50%] top-[50%]">
              <NewTicket edit="edit" data={row.original} />
            </AlertDialogContent>
          </AlertDialog>
          {/* 
          <AlertDialog open={isDeleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent className='left-[50%] top-[50%]'>
              <DeleteTicket id={row.original.id} />
            </AlertDialogContent>
          </AlertDialog> */}
        </div>
      );
    },
  },
];
