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
import { CardWallet } from "@/components/ui/card";
import { SkeletonCard1, SkeletonDemo } from "@/components/ui/skeleton";
import { TicketCol } from "@/app/components/schema/Columns";
import empty from "../../../../components/assets/images/empty.svg";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Image from "next/image";
import { Dashboard } from "@/components/ui/containers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetTicketStats } from "@/hooks/tickets";
import { ticketValidationSchema } from "@/app/components/schema/Forms";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useGetUserEvents } from "@/hooks/events";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const CheckIn = ({ params }: any) => {
  const { id, tab } = params;
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 }); // Set default page size to 10
  const [eventId, setEventId] = useState<any>(null);
  const { data: ticketStats } = useGetTicketStats(eventId);
  const router = useRouter();

  useEffect(() => {
    if (id !== "event") setEventId(parseInt(id));
  }, [id]);
  console.log(ticketStats);

  const table = useReactTable({
    data: ticketStats?.activities || [],
    columns: TicketCol,
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
      <div className='flex flex-row justify-between items-center'>
        <span>
          <h5 className='mb-2'>Check In</h5>
          <p>Handle arrivals with ticket scans</p>
        </span>
      </div>

      <Tabs defaultValue={tab} className='w-full mt-4'>
        <TabsList className='grid max-w-[329px] grid-cols-2 items-center justify-center rounded-md bg-white p-0 text-gray-500'>
          {tickets.map((item: any) => (
            <TabsTrigger value={item?.value} onClick={() => router.push(item.value)} key={item?.value}>
              {item?.title}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className='border-b border-gray-200 mt-2'></div>

        {tickets.map((item: any) => (
          <TabsContent value={item?.value} key={item?.title}>
            <>
              {item?.value === "ticket" && (
                <>
                  {id === "event" && <EventId eventId={eventId} setEventId={setEventId} />}
                  <div className='grid gap-3 grid-flow-row-dense sm:grid-cols-2 md:grid-cols-3 pt-5 pb-8 m-0'>
                    <CardWallet title='Total Ticket Sold' header={ticketStats?.totalTickets.toString() || "--"} />
                    <CardWallet title='Tickets Validated' header={ticketStats?.validatedTickets.toString() || "--"} />
                    <CardWallet title='Total Declined' header={ticketStats?.declinedTickets.toString() || "--"} />
                  </div>
                </>
              )}
              <div className='pt-[30px]'>
                {item?.value === "ticket" ? (
                  <div className='relative'>
                    <h6>{item?.title}</h6>
                    <p className='mb-5'>See number of confirmed and approved tickets</p>
                    <h6>Latest Activity</h6>

                    <div className='w-full'>
                      <div className='flex items-center py-4 '>
                        <Input
                          placeholder='Search by name...'
                          value={(table.getColumn("name")?.getFilterValue() as number) ?? ""}
                          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                          className='max-w-sm'
                        />
                      </div>
                      <div>
                        {ticketStats || ticketStats != undefined ? (
                          <div className='relative'>
                            <Table>
                              <TableHeader>
                                {table?.getHeaderGroups().map((headerGroup) => (
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
                                {table?.getRowModel().rows?.length ? (
                                  table?.getRowModel().rows.map((row) => (
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
                                        <Image
                                          src={empty}
                                          alt='empty'
                                          width={100}
                                          height={100}
                                          className='w-[100px] h-auto'
                                        />
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
                          <SkeletonCard1 />
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <ValidateTicket id={id} />
                )}
              </div>
            </>
          </TabsContent>
        ))}
      </Tabs>
    </Dashboard>
  );
};

export default CheckIn;

const tickets = [
  {
    value: "ticket",
    title: "Ticket",
  },
  {
    value: "validation",
    title: "Manual validation",
  },
];

const ValidateTicket = ({ id }: any) => {
  const { data: session } = useSession();
  const { data: events } = useGetUserEvents(session?.user?.id);
  const [activeEvent, setActiveEvent] = useState<any>([]);
  const [open, setOpen] = useState(false);
  const navigation = useRouter();

  useEffect(() => {
    if (events && events?.data?.length > 0) {
      const active = events.data.filter((event: any) => event.status === "UPCOMING");
      setActiveEvent(active);
    }
  }, [events]);

  useEffect(() => {
    if (id !== "event")
      form.reset({
        EventId: parseInt(id),
      });
  }, [id]);

  const form = useForm<z.infer<typeof ticketValidationSchema>>({
    resolver: zodResolver(ticketValidationSchema),
  });

  const onSubmit = (values: z.infer<typeof ticketValidationSchema>) => {
    navigation.push(`/dashboard/check-in/${values.EventId}/validation/${values.ticketRef}`);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='flex max-w-[374px] mx-auto flex-col gap-3'>
        <h6 className='text-black font-semibold'>Manual Validation</h6>
        <p>Enter the ticket number and ensure it matches our records for validation</p>
        {id === "event" && (
          <FormField
            control={form.control}
            name='EventId'
            render={({ field }) => (
              <FormItem>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      role='combobox'
                      size={"sm"}
                      className={cn(!field.value ? "text-gray-400 font-normal" : "font-normal")}
                    >
                      {field.value ? activeEvent.find((item: any) => item.id === field.value)?.title : "Select Event"}
                      <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-full p-0'>
                    <Command>
                      <CommandInput placeholder='Search events...' />
                      <CommandList>
                        <CommandEmpty>No event found.</CommandEmpty>
                        <CommandGroup>
                          {activeEvent?.map((event: any) => (
                            <CommandItem
                              value={event.id}
                              key={event.id}
                              onSelect={() => {
                                form.setValue("EventId", event.id);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn("mr-2 h-4 w-4", event.id === field.value ? "opacity-100" : "opacity-0")}
                              />
                              {event.title}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name='ticketRef'
          render={({ field }) => (
            <FormItem>
              <Input placeholder='Enter ticket number' {...field} />
              <FormMessage className='top-1' />
            </FormItem>
          )}
        />
        <Button className='w-full mt-10'>Check now</Button>
      </form>
    </Form>
  );
};

const EventId = ({ eventId, setEventId }: any) => {
  const { data: session } = useSession();
  const { data: events, status } = useGetUserEvents(session?.user?.id);
  const [open, setOpen] = useState(false);

  if (status !== "success") return <SkeletonDemo />;
  else
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            size={"sm"}
            className={cn("max-w-[500px] ml-0 mt-4", !eventId ? "text-gray-400 font-normal" : "font-normal")}
          >
            {eventId ? events?.data.find((item: any) => item.id === eventId)?.title : "Select Event"}
            <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-full p-0'>
          <Command>
            <CommandInput placeholder='Search events...' />
            <CommandList>
              <CommandEmpty>No event found.</CommandEmpty>
              <CommandGroup>
                {events?.data?.length &&
                  events?.data?.map((event: any) => (
                    <CommandItem
                      value={event.title}
                      key={event.id}
                      onSelect={() => {
                        setEventId(event.id);
                        setOpen(false);
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", event.id === eventId ? "opacity-100" : "opacity-0")} />
                      {event.title}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
};
