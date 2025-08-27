"use client";
import { Input } from "@/components/ui/input";
import { TableContainer } from "@/components/ui/table";
import { CardWallet } from "@/components/ui/card";
import { SkeletonDemo } from "@/components/ui/skeleton";
import { Dashboard } from "@/components/ui/containers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetTicketStats, useValidateTickets } from "@/hooks/tickets";
import { ticketValidationSchema } from "@/app/components/schema/Forms";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Check,
  ChevronDown,
  ScanLine,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Loader,
} from "lucide-react";
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
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { useGetUserEvents } from "@/hooks/events";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { formatTime } from "@/lib/auth-helper";
import { useEffect, useMemo, useRef, useState } from "react";
import { Label } from "@/components/ui/label";

const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((m) => m.Scanner),
  { ssr: false }
);

export default function CheckIn({ params }: any) {
  const { id, tab } = params;
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  // Single source of truth
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Keep URL in sync on /event
  useEffect(() => {
    if (id !== "event") return;
    if (!selectedEvent?.id) return;
    const sp = new URLSearchParams(search.toString());
    sp.set("id", String(selectedEvent.id));
    router.replace(`${pathname}?${sp.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEvent?.id, id]);

  const selectedEventId = useMemo(() => {
    if (id !== "event") {
      const numeric = Number(id);
      return Number.isFinite(numeric) ? numeric : undefined;
    }
    return selectedEvent?.id;
  }, [id, selectedEvent?.id]);

  const { data: ticketStats, isFetching } = useGetTicketStats(selectedEventId);

  const tabs = [
    { value: "ticket", title: "Ticket" },
    { value: "validation", title: "Manual validation" },
    { value: "scan", title: "QR Validation" },
  ];

  const formatDateRange = (start?: string | Date, end?: string | Date) => {
    try {
      if (!start) return "";
      const s = new Date(start);
      const e = end ? new Date(end) : null;
      const f = (d: Date) =>
        d.toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      return e ? `${f(s)} – ${f(e)}` : f(s);
    } catch {
      return "";
    }
  };

  return (
    <Dashboard className="bg-white">
      <div className="flex items-center justify-between">
        <span>
          <h3 className="mb-2">Check In</h3>
          <p>Handle arrivals with ticket scans</p>
        </span>
      </div>

      {id === "event" && (
        <div className="mt-3">
          {selectedEvent ? (
            <div className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm">
              <CalendarDays className="h-4 w-4" />
              <span className="font-medium">Showing event:</span>
              <span className="font-semibold">{selectedEvent.title}</span>
              {selectedEvent.startAt && (
                <span className="text-gray-600">
                  •{" "}
                  {formatDateRange(selectedEvent.startAt, selectedEvent.endAt)}
                </span>
              )}
              {selectedEvent.venue && (
                <span className="text-gray-600">• {selectedEvent.venue}</span>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">Select an event below.</div>
          )}
        </div>
      )}

      <Tabs defaultValue={tab ?? "ticket"} className="w-full mt-4">
        <TabsList className="grid max-w-[520px] grid-cols-3 rounded-md bg-white p-0 text-gray-500">
          {tabs.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              onClick={() => {
                const qs =
                  id === "event" && selectedEvent?.id
                    ? `?id=${selectedEvent.id}`
                    : "";
                router.push(`/dashboard/check-in/${id}/${t.value}${qs}`);
              }}
            >
              {t.title}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="border-b border-gray-200 mt-2" />

        {tabs.map((t) => (
          <TabsContent value={t.value} key={t.value}>
            {t.value === "ticket" && (
              <>
                {id === "event" && (
                  <EventSelect
                    selectedEvent={selectedEvent}
                    setSelectedEvent={setSelectedEvent}
                    isTicket
                  />
                )}

                <div className="grid gap-3 grid-flow-row-dense sm:grid-cols-2 md:grid-cols-3 pt-5 pb-8">
                  <CardWallet
                    title="Total Ticket Sold"
                    header={ticketStats?.totalTickets?.toString() ?? "--"}
                  />
                  <CardWallet
                    title="Tickets Validated"
                    header={ticketStats?.validatedTickets?.toString() ?? "--"}
                  />
                  <CardWallet
                    title="Total Declined"
                    header={ticketStats?.declinedTickets?.toString() ?? "--"}
                  />
                </div>

                <div className="relative space-y-4 pt-2">
                  <div className="space-y-1">
                    <h4>Ticket</h4>
                    <p>See number of confirmed and approved tickets</p>
                    <h6>Latest Activity</h6>
                  </div>
                  <TableContainer
                    searchKey="name"
                    isFetching={isFetching}
                    columns={TicketCol}
                    data={ticketStats?.activities ?? []}
                  />
                </div>
              </>
            )}

            {t.value === "validation" && (
              <ValidateTicket
                id={id}
                selectedEvent={selectedEvent}
                setSelectedEvent={setSelectedEvent}
              />
            )}

            {t.value === "scan" && (
              <ValidateQR
                id={id}
                selectedEvent={selectedEvent}
                setSelectedEvent={setSelectedEvent}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </Dashboard>
  );
}

/* ------------------------ Event Select (fixed hooks order) ------------------------ */
function EventSelect({
  selectedEvent,
  setSelectedEvent,
  className,
  isTicket,
}: {
  selectedEvent: any;
  setSelectedEvent: (ev: any) => void;
  className?: string;
  isTicket?: boolean;
}) {
  const { data: events, status } = useGetUserEvents({ pageSize: 10000 });
  const [open, setOpen] = useState(false);

  // read ?id= from the URL (only used for first-time init)
  const search = useSearchParams();
  const queryId = useMemo(() => {
    const v = Number(search.get("id"));
    return Number.isFinite(v) ? v : undefined;
  }, [search]);

  // Build list (optionally filter)
  const all = events?.data ?? [];
  const list = useMemo(
    () => (isTicket ? all : all.filter((e: any) => e.status !== "PAST")),
    [all, isTicket]
  );

  // Initialize selection ONCE:
  // 1) if we already have a selectedEvent -> do nothing
  // 2) else if ?id= is present -> pick that
  // 3) else -> pick first in list
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    if (status !== "success") return;
    if (!list.length) return;

    if (selectedEvent) {
      initializedRef.current = true; // respect existing selection
      return;
    }

    let initial = undefined as any;

    if (queryId) {
      initial = list.find((e: any) => e.id === queryId);
    }
    if (!initial) {
      initial = list[0];
    }

    if (initial) {
      setSelectedEvent(initial);
      initializedRef.current = true; // prevent future overrides
    }
  }, [status, list, selectedEvent, queryId, setSelectedEvent]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="space-y-2">
          <Label className="text-black">
            {isTicket ? "Search" : "Active"} events
          </Label>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            size="sm"
            className={cn(
              "max-w-[500px] ml-0 mt-4",
              className,
              !selectedEvent && "text-gray-400 font-normal"
            )}
            disabled={status !== "success"}
          >
            {status !== "success"
              ? "Loading events…"
              : selectedEvent?.title ?? "Search events"}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        {status !== "success" ? (
          <div className="p-3">
            <SkeletonDemo />
          </div>
        ) : (
          <Command>
            <CommandInput placeholder="Search events..." />
            <CommandList>
              <CommandEmpty>No event found.</CommandEmpty>
              <CommandGroup>
                {list.map((event: any) => (
                  <CommandItem
                    key={event.id}
                    value={String(event.id)}
                    onSelect={() => {
                      setSelectedEvent(event);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        event.id === selectedEvent?.id
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
        )}
      </PopoverContent>
    </Popover>
  );
}

/* ------------------------ Manual validation ------------------------ */

function ValidateTicket({
  id,
  selectedEvent,
  setSelectedEvent,
}: {
  id: string;
  selectedEvent: any;
  setSelectedEvent: (ev: any) => void;
}) {
  const form = useForm<z.infer<typeof ticketValidationSchema>>({
    resolver: zodResolver(ticketValidationSchema),
  });
  const mutation = useValidateTickets();
  const router = useRouter();

  useEffect(() => {
    if (id !== "event" && !Number.isNaN(Number(id))) {
      form.reset({ EventId: Number(id) });
    } else if (selectedEvent?.id) {
      form.reset({ EventId: Number(selectedEvent.id) });
    }
  }, [id, selectedEvent?.id]);

  console.log(selectedEvent);
  const onSubmit = (v: z.infer<typeof ticketValidationSchema>) => {
    mutation.mutate(v, {
      onSuccess: () => {
        router.push(
          `/dashboard/check-in/${v.EventId}/validation/${v.ticketRef}`
        );
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex max-w-[420px] mx-auto mt-5 flex-col gap-3"
      >
        <h3 className="text-black font-semibold">Manual Validation</h3>
        <p>
          Enter the ticket number and ensure it matches our records for
          validation.
        </p>

        {id === "event" && (
          <FormField
            control={form.control}
            name="EventId"
            render={({ field }) => (
              <FormItem>
                <EventSelect
                  selectedEvent={selectedEvent}
                  setSelectedEvent={(ev) => {
                    setSelectedEvent(ev);
                    field.onChange(ev?.id ?? null);
                  }}
                />
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
              <Label className="text-black">Reference Number</Label>
              <Input placeholder="Enter ticket number" {...field} />
              <FormMessage className="top-1" />
            </FormItem>
          )}
        />
        <Button
          disabled={mutation.isPending}
          type="submit"
          className="w-full mt-8 gap-2"
        >
          Check now
          {mutation.isPending && <Loader className="animate-spin" size={20} />}
        </Button>
      </form>
    </Form>
  );
}

/* ------------------------ QR validation ------------------------ */

function ValidateQR({
  id,
  selectedEvent,
  setSelectedEvent,
}: {
  id: string;
  selectedEvent: any;
  setSelectedEvent: (ev: any) => void;
}) {
  const router = useRouter();
  const selectedEventId = selectedEvent?.id;
  const mutation = useValidateTickets();

  const handleDecoded = (raw?: string) => {
    if (!raw || !selectedEventId) return;
    const ticketRef = extractTicketRef(raw);
    if (ticketRef)
      mutation.mutate(
        {
          ticketRef,
          EventId: selectedEventId,
        },
        {
          onSuccess: () => {
            router.push(
              `/dashboard/check-in/${selectedEventId}/validation/${ticketRef}`
            );
          },
        }
      );
  };

  return (
    <div className="max-w-[720px] mt-6 mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <ScanLine className="h-5 w-5 text-primary" />
        <h4>QR Validation</h4>
      </div>
      <p className="text-sm text-muted-foreground">
        Point the camera at the ticket QR. On success, you’ll be redirected to
        the ticket details.
      </p>

      {id === "event" && (
        <EventSelect
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
        />
      )}

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="aspect-video bg-black/5">
          {typeof window !== "undefined" && selectedEventId ? (
            <Scanner
              onScan={(codes) => handleDecoded(codes?.[0]?.rawValue)}
              onError={() => {}}
              constraints={{ facingMode: "environment" }}
              scanDelay={250}
              allowMultiple={false}
              styles={{
                container: { width: "100%", height: "100%" },
                video: { width: "100%", height: "100%", objectFit: "cover" },
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {selectedEventId
                ? "Loading camera…"
                : "Select an event to start scanning"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------ Shared utils & columns ------------------------ */

function extractTicketRef(input: string): string | null {
  try {
    const url = new URL(input);
    const q = url.searchParams.get("ref");
    if (q) return q;
    const parts = url.pathname.split("/").filter(Boolean);
    const i = parts.findIndex((p) => p.toLowerCase() === "validation");
    if (i > -1 && parts[i + 1]) return parts[i + 1];
  } catch {
    if (input?.trim()) return input.trim();
  }
  return null;
}

const TicketCol: ColumnDef<any>[] = [
  {
    accessorKey: "Users",
    header: "Name",
    cell: ({ row }) => {
      const user: any = row.getValue("Users");
      return (
        <div className="font-medium ">
          {user ? `${user.first_name}  ${user.last_name}` : "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Time",
    cell: ({ row }) => <div>{formatTime(row.getValue("createdAt"))}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div>
        {row.getValue("status") === "SUCCESS" ? (
          <div className="py-1 px-2 flex items-center gap-2 rounded-md text-center font-medium">
            <CheckCircle2 className="text-green-700 h-4 w-4" />
            <p className="leading-normal">Validation Successful</p>
          </div>
        ) : (
          <div className="py-1 px-2 flex items-center gap-2 rounded-md text-center font-medium">
            <XCircle className="text-red-700 h-4 w-4" />
            <p className="leading-normal">Validation Failed</p>
          </div>
        )}
      </div>
    ),
  },
];
