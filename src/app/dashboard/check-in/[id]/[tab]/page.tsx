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
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useGetUserEvents } from "@/hooks/events";
import { useRouter } from "next/navigation";

const CheckIn = ({ params }: any) => {
  const { id, tab } = params;
  const [eventId, setEventId] = useState<any>(null);
  const { data: ticketStats, isFetching } = useGetTicketStats(eventId);
  const router = useRouter();

  useEffect(() => {
    if (id !== "event") setEventId(parseInt(id));
  }, [id]);
  console.log(ticketStats);

  return (
    <Dashboard className="bg-white">
      <div className="flex flex-row justify-between items-center">
        <span>
          <h4 className="mb-2">Check In</h4>
          <p>Handle arrivals with ticket scans</p>
        </span>
      </div>

      <Tabs defaultValue={tab} className="w-full mt-4">
        <TabsList className="grid max-w-[329px] grid-cols-2 items-center justify-center rounded-md bg-white p-0 text-gray-500">
          {tickets.map((item: any) => (
            <TabsTrigger
              value={item?.value}
              onClick={() => router.push(item.value)}
              key={item?.value}
            >
              {item?.title}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="border-b border-gray-200 mt-2"></div>

        {tickets.map((item: any) => (
          <TabsContent value={item?.value} key={item?.title}>
            <>
              {item?.value === "ticket" && (
                <>
                  {id === "event" && (
                    <EventId eventId={eventId} setEventId={setEventId} />
                  )}
                  <div className="grid gap-3 grid-flow-row-dense sm:grid-cols-2 md:grid-cols-3 pt-5 pb-8 m-0">
                    <CardWallet
                      title="Total Ticket Sold"
                      header={ticketStats?.totalTickets.toString() || "--"}
                    />
                    <CardWallet
                      title="Tickets Validated"
                      header={ticketStats?.validatedTickets.toString() || "--"}
                    />
                    <CardWallet
                      title="Total Declined"
                      header={ticketStats?.declinedTickets.toString() || "--"}
                    />
                  </div>
                </>
              )}
              <div className="pt-[30px]">
                {item?.value === "ticket" ? (
                  <div className="relative space-y-4">
                    <div className="space-y-1">
                      <h4>{item?.title}</h4>
                      <p>See number of confirmed and approved tickets</p>
                      <h6>Latest Activity</h6>
                    </div>
                    <TableContainer
                      searchKey="name"
                      isFetching={isFetching}
                      columns={TicketCol}
                      data={ticketStats?.activities || []}
                    />
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
  const { data: events } = useGetUserEvents();
  const [activeEvent, setActiveEvent] = useState<any>([]);
  const [open, setOpen] = useState(false);
  const navigation = useRouter();

  useEffect(() => {
    if (events && events?.data?.length > 0) {
      const active = events.data.filter(
        (event: any) => event.status === "UPCOMING"
      );
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
    navigation.push(
      `/dashboard/check-in/${values.EventId}/validation/${values.ticketRef}`
    );
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex max-w-[374px] mx-auto flex-col gap-3"
      >
        <h6 className="text-black font-semibold">Manual Validation</h6>
        <p>
          Enter the ticket number and ensure it matches our records for
          validation
        </p>
        {id === "event" && (
          <FormField
            control={form.control}
            name="EventId"
            render={({ field }) => (
              <FormItem>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      size={"sm"}
                      className={cn(
                        !field.value
                          ? "text-gray-400 font-normal"
                          : "font-normal"
                      )}
                    >
                      {field.value
                        ? activeEvent.find(
                            (item: any) => item.id === field.value
                          )?.title
                        : "Select Event"}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search events..." />
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
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  event.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
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
          name="ticketRef"
          render={({ field }) => (
            <FormItem>
              <Input placeholder="Enter ticket number" {...field} />
              <FormMessage className="top-1" />
            </FormItem>
          )}
        />
        <Button className="w-full mt-10">Check now</Button>
      </form>
    </Form>
  );
};

const EventId = ({ eventId, setEventId }: any) => {
  const { data: events, status } = useGetUserEvents();
  const [open, setOpen] = useState(false);

  if (status !== "success") return <SkeletonDemo />;
  else
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            size={"sm"}
            className={cn(
              "max-w-[500px] ml-0 mt-4",
              !eventId ? "text-gray-400 font-normal" : "font-normal"
            )}
          >
            {eventId
              ? events?.data.find((item: any) => item.id === eventId)?.title
              : "Select Event"}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search events..." />
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
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          event.id === eventId ? "opacity-100" : "opacity-0"
                        )}
                      />
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
