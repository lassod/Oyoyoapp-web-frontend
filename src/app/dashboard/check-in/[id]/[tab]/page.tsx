"use client";
import { Input } from "@/components/ui/input";
import { TableContainer } from "@/components/ui/table";
import { CardWallet } from "@/components/ui/card";
import { SkeletonDemo } from "@/components/ui/skeleton";
import { Dashboard } from "@/components/ui/containers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetTicketStats } from "@/hooks/tickets";
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
import { useEffect, useState } from "react";

const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((m) => m.Scanner),
  { ssr: false }
);

export default function CheckIn({ params }: any) {
  const { id, tab } = params;
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  // prefill from route or ?id=
  const eventIdFromQuery = search.get("id");
  const [eventId, setEventId] = useState<number | null>(null);

  // /dashboard/check-in/:id/...
  useEffect(() => {
    if (id !== "event" && !Number.isNaN(Number(id))) setEventId(Number(id));
  }, [id]);

  // /dashboard/check-in/event? id=123
  useEffect(() => {
    if (
      id === "event" &&
      eventIdFromQuery &&
      !Number.isNaN(Number(eventIdFromQuery))
    ) {
      setEventId(Number(eventIdFromQuery));
    }
  }, [id, eventIdFromQuery]);

  // reflect selection back in the URL when on /event
  useEffect(() => {
    if (id === "event" && eventId) {
      const sp = new URLSearchParams(search.toString());
      sp.set("id", String(eventId));
      router.replace(`${pathname}?${sp.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const { data: ticketStats, isFetching } = useGetTicketStats(eventId);

  const tabs = [
    { value: "ticket", title: "Ticket" },
    { value: "validation", title: "Manual validation" },
    { value: "scan", title: "QR Validation" },
  ];

  return (
    <Dashboard className="bg-white">
      <div className="flex items-center justify-between">
        <span>
          <h4 className="mb-2">Check In</h4>
          <p>Handle arrivals with ticket scans</p>
        </span>
      </div>

      <Tabs defaultValue={tab} className="w-full mt-4">
        <TabsList className="grid max-w-[520px] grid-cols-3 rounded-md bg-white p-0 text-gray-500">
          {tabs.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              onClick={() => {
                const qs = id === "event" && eventId ? `?id=${eventId}` : "";
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
                  <EventSelect value={eventId} onChange={setEventId} />
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
              <ValidateTicket id={id} prefEventId={eventId} />
            )}

            {t.value === "scan" && <ValidateQR id={id} prefEventId={eventId} />}
          </TabsContent>
        ))}
      </Tabs>
    </Dashboard>
  );
}
/* ------------------------ Manual validation ------------------------ */

function EventSelect({
  value,
  onChange,
  className,
}: {
  value: number | null;
  onChange: (v: number) => void;
  className?: string;
}) {
  const { data: events, status } = useGetUserEvents();
  const [open, setOpen] = useState(false);

  if (status !== "success") return <SkeletonDemo />;
  const upcoming = (events?.data ?? []).filter(
    (e: any) => e.status === "UPCOMING"
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          size="sm"
          className={cn(
            "max-w-[500px] ml-0 mt-4",
            className,
            !value && "text-gray-400 font-normal"
          )}
        >
          {value
            ? upcoming.find((e: any) => e.id === value)?.title ?? "Select Event"
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
              {upcoming.map((event: any) => (
                <CommandItem
                  key={event.id}
                  value={String(event.id)}
                  onSelect={() => {
                    onChange(event.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      event.id === value ? "opacity-100" : "opacity-0"
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
}

function ValidateTicket({
  id,
  prefEventId,
}: {
  id: string;
  prefEventId: number | null;
}) {
  const form = useForm<z.infer<typeof ticketValidationSchema>>({
    resolver: zodResolver(ticketValidationSchema),
  });

  // prefill EventId from route or parent
  useEffect(() => {
    if (id !== "event" && !Number.isNaN(Number(id)))
      form.reset({ EventId: Number(id) });
    else if (prefEventId) form.reset({ EventId: prefEventId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, prefEventId]);

  const onSubmit = (v: z.infer<typeof ticketValidationSchema>) =>
    // same endpoint/page used by QR
    (window.location.href = `/dashboard/check-in/${v.EventId}/validation/${v.ticketRef}`);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex max-w-[420px] mx-auto flex-col gap-3"
      >
        <h6 className="text-black font-semibold">Manual Validation</h6>
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
                  value={field.value ?? null}
                  onChange={(v) => field.onChange(v)}
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
              <Input placeholder="Enter ticket number" {...field} />
              <FormMessage className="top-1" />
            </FormItem>
          )}
        />
        <Button className="w-full mt-8">Check now</Button>
      </form>
    </Form>
  );
}

function ValidateQR({
  id,
  prefEventId,
}: {
  id: string;
  prefEventId: number | null;
}) {
  const router = useRouter();
  const [eventId, setEventId] = useState<number | null>(null);
  const [lastRef, setLastRef] = useState("");
  const [lastTs, setLastTs] = useState(0);

  // source of truth for event
  useEffect(() => {
    if (id !== "event" && !Number.isNaN(Number(id))) setEventId(Number(id));
    else if (prefEventId) setEventId(prefEventId);
  }, [id, prefEventId]);

  const handleDecoded = (raw?: string) => {
    if (!raw) return;
    const now = Date.now();
    if (raw === lastRef && now - lastTs < 1500) return; // debounce duplicates
    setLastRef(raw);
    setLastTs(now);

    const ticketRef = extractTicketRef(raw);
    if (ticketRef && eventId)
      router.push(`/dashboard/check-in/${eventId}/validation/${ticketRef}`);
  };

  return (
    <div className="max-w-[720px] mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <ScanLine className="h-5 w-5 text-primary" />
        <h4>QR Validation</h4>
      </div>
      <p className="text-sm text-muted-foreground">
        Point the camera at the ticket QR. On success, you’ll be redirected to
        the ticket details.
      </p>

      {/* event select lives here too when on /event */}
      {id === "event" && <EventSelect value={eventId} onChange={setEventId} />}

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="aspect-video bg-black/5">
          {typeof window !== "undefined" && eventId ? (
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
              {eventId
                ? "Loading camera…"
                : "Select an event to start scanning"}
            </div>
          )}
        </div>
      </div>

      {lastRef && (
        <div className="rounded-md border border-border bg-muted px-3 py-2 text-xs break-words">
          <span className="font-medium">Last scan:</span> {lastRef}
        </div>
      )}
    </div>
  );
}

// shared util: raw ref, ?ref=REF, or .../validation/REF
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
      const user: any = row.getValue("Users"); // Get the Users object
      return (
        <div className="font-medium ">
          {user ? `${user.first_name}  ${user.last_name}` : "N/A"}{" "}
          {/* Safely access first_name */}
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
