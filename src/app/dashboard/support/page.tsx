"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Headset, MessageSquare, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dashboard } from "@/components/ui/containers";
import { TableContainer } from "@/components/ui/table";
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
import { CustomModal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";
import {
  AddButton,
  AddButtonContainer,
  FileDisplay,
} from "@/components/ui/button";
import { formSchemaSupport } from "@/app/components/schema/Forms";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import {
  usePostSupportTicket,
  useUpdateSupportTicket,
  useGetSupportCategories,
} from "@/hooks/support";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

const SupportPage = () => {
  const { data: tickets = [], status } = useGetUserSupportTickets();
  const { data: categories = [] } = useGetSupportCategories();
  const [ticket, setTicket] = useState<any>(null);
  // Filters exactly like Wallet’s pattern
  const [filters, setFilters] = useState<{ status: string; category: string }>({
    status: "All Statuses",
    category: "All Categories",
  });

  const filteredTickets = useMemo(() => {
    if (!tickets?.length) return [];
    return tickets.filter((t: any) => {
      const statusMatch =
        filters.status === "All Statuses" ||
        (filters.status === "Resolved" && t.status === "Resolved") ||
        (filters.status === "Open" && t.status === "Open");

      const categoryMatch =
        filters.category === "All Categories" ||
        String(t?.SupportCategory?.name || "") === filters.category;

      return statusMatch && categoryMatch;
    });
  }, [tickets, filters]);

  console.log(tickets);
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
          options={[
            "All Categories",
            ...categories.map((cat: any) => String(cat.name)),
          ]}
          value={filters.category}
          onChange={(v) => setFilters((f) => ({ ...f, category: v }))}
        />
      ),
    },
  ];

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
      cell: ({ row }) => (
        <div className="font-medium ">{row.getValue("id")}</div>
      ),
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
      cell: ({ row }) => <div>{row.original?.SupportCategory?.name}</div>,
    },

    {
      accessorKey: "status",
      header: "Status",
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
        const [isDeleteOpen, setDeleteOpen] = useState(false);

        return (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setTicket(row.original)} // Open Edit dialog
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
          </div>
        );
      },
    },
  ];

  return (
    <Dashboard className="bg-white">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between mb-6 md:items-center">
        <span>
          <h3 className="mb-2">Help & Support</h3>
          <p>Manage all support tickets on Oyoyo</p>
        </span>
        <div className="flex gap-2">
          {/* <Link href="/dashboard/chat">
            <Button variant="secondary" className="gap-2">
              <MessageSquare size={20} />
              Live Chat
            </Button>
          </Link> */}
          <Link
            target="_blank"
            href="https://tawk.to/chat/615d6bc925797d7a89029219/1fhaeq3vv"
          >
            <Button variant="secondary" className="gap-2">
              <MessageSquare size={20} />
              Live Chat
            </Button>
          </Link>
          <Button
            onClick={() =>
              setTicket({
                isNew: true,
              })
            }
            className="gap-2"
          >
            <Headset size={20} />
            Contact support
          </Button>
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

      <CustomModal
        open={ticket}
        className="max-w-[550px]"
        setOpen={setTicket}
        title="Contact Support"
        description="Our support team is here to help you. Please provide as much detail as possible about your issue."
      >
        <NewTicket ticket={ticket} setTicket={setTicket} />
      </CustomModal>
    </Dashboard>
  );
};

export default SupportPage;

const NewTicket = ({ ticket, setTicket }: any) => {
  const { data: session } = useSession();
  const { data: categories } = useGetSupportCategories();
  const { mutation: update } = useUpdateSupportTicket();
  const { mutation: post } = usePostSupportTicket();
  const [images, setImages] = useState<(File | string)[]>([]);

  const onSubmit = (values: z.infer<typeof formSchemaSupport>) => {
    if (ticket?.isNew)
      post.mutate(
        {
          ...values,
          userId: session?.user?.id,
          images,
          categoryId: parseInt(values.categoryId),
        },
        {
          onSuccess: () => setTicket(null),
        }
      );
    else
      update.mutate(
        {
          ...values,
          userId: session?.user?.id,
          images,
          id: ticket?.id,
          categoryId: parseInt(values.categoryId),
        },
        {
          onSuccess: () => setTicket(null),
        }
      );
  };

  console.log(ticket);

  const form = useForm<z.infer<typeof formSchemaSupport>>({
    resolver: zodResolver(formSchemaSupport),
  });

  useEffect(() => {
    form.reset({ ...ticket, categoryId: ticket?.categoryId?.toString() || "" });
    setImages(ticket?.images || []);
  }, [ticket]);

  console.log(form.formState.errors);
  const handleFileChange = (newFiles: File[]) => {
    if (newFiles.length > 0) setImages((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex relative flex-col gap-3"
      >
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem className="mt-2">
              <FormLabel>Subject</FormLabel>
              <Input placeholder="Enter subject" {...field} />
              <FormMessage className="relative top-1" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ticket category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className={`${!field.value && "text-gray-400"}`}>
                  <SelectValue
                    placeholder={
                      field.value
                        ? categories?.find(
                            (category: any) =>
                              category.id === parseInt(field.value)
                          )?.name
                        : "Select Category"
                    }
                  >
                    {field.value
                      ? categories?.find(
                          (category: any) =>
                            category.id === parseInt(field.value)
                        )?.name
                      : "Select Category"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((item: any) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="mt-2">
              <FormLabel>Description</FormLabel>
              <Textarea placeholder="Enter details..." {...field} />
              <FormMessage className="relative top-1" />
            </FormItem>
          )}
        />

        <AddButtonContainer>
          <AddButton
            title="Upload image (PNG, JPG format)"
            onFileChange={handleFileChange}
            isMultiple={true}
          />
          <FileDisplay
            files={images}
            onRemove={handleRemoveFile}
            isMultiple={true}
          />
        </AddButtonContainer>

        <Button
          type="submit"
          className="w-full gap-2 mt-2"
          disabled={post.isPending}
        >
          Send
          {post.isPending && <Loader className="animate-spin" size={20} />}
        </Button>
      </form>
    </Form>
  );
};
