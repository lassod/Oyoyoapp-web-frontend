"use client";
import { Input } from "@/components/ui/input";
import { TableContainer } from "@/components/ui/table";
import { CardWallet } from "@/components/ui/card";
import { SkeletonDemo } from "@/components/ui/skeleton";
import { Dashboard } from "@/components/ui/containers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetTicketStats, useValidateTickets, useVerifyTickets } from "@/hooks/tickets";
import { ticketValidationSchema } from "@/app/components/schema/Forms";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ScanLine, CheckCircle2, XCircle, CalendarDays, Loader, RotateCcw } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { useGetUserEvents } from "@/hooks/events";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { formatTime } from "@/lib/auth-helper";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import Logo from "../../../../components/assets/images/Oyoyo.svg";
import Image from "next/image";
import { formatDate, shortenText } from "@/lib/auth-helper";
import { Loader2 } from "lucide-react";
import { CustomModal } from "@/components/dashboard/general/Modal";
import { set } from "date-fns";
import { FaInfoCircle } from "react-icons/fa";

const Scanner = dynamic(() => import("@yudiel/react-qr-scanner").then((m) => m.Scanner), { ssr: false });

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

  console.log(ticketStats);
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
    <Dashboard className='bg-white'>
      <div className='flex items-center justify-between'>
        <span>
          <h3 className='mb-2'>Check In</h3>
          <p>Handle arrivals with ticket scans</p>
        </span>
      </div>

      {id === "event" && (
        <div className='mt-3'>
          {selectedEvent ? (
            <div className='inline-flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm'>
              <CalendarDays className='h-4 w-4' />
              <span className='font-medium'>Showing event:</span>
              <span className='font-semibold'>{selectedEvent.title}</span>
              {selectedEvent.startAt && (
                <span className='text-gray-600'>• {formatDateRange(selectedEvent.startAt, selectedEvent.endAt)}</span>
              )}
              {selectedEvent.venue && <span className='text-gray-600'>• {selectedEvent.venue}</span>}
            </div>
          ) : (
            <div className='text-sm text-gray-500'>Select an event below.</div>
          )}
        </div>
      )}

      <Tabs defaultValue={tab ?? "ticket"} className='w-full mt-4'>
        <TabsList className='grid max-w-[520px] grid-cols-3 rounded-md bg-white p-0 text-gray-500'>
          {tabs.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              onClick={() => {
                const qs = id === "event" && selectedEvent?.id ? `?id=${selectedEvent.id}` : "";
                router.push(`/dashboard/check-in/${id}/${t.value}${qs}`);
              }}
            >
              {t.title}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className='border-b border-gray-200 mt-2' />

        {tabs.map((t) => (
          <TabsContent value={t.value} key={t.value}>
            {t.value === "ticket" && (
              <>
                {id === "event" && (
                  <EventSelect selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} isTicket />
                )}

                <div className='grid gap-3 grid-flow-row-dense sm:grid-cols-2 md:grid-cols-3 pt-5 pb-8'>
                  <CardWallet title='Total Ticket Sold' header={ticketStats?.totalTickets?.toString() ?? "--"} />
                  <CardWallet title='Tickets Validated' header={ticketStats?.validatedTickets?.toString() ?? "--"} />
                  <CardWallet title='Total Declined' header={ticketStats?.declinedTickets?.toString() ?? "--"} />
                </div>

                <div className='relative space-y-4 pt-2'>
                  <div className='space-y-1'>
                    <h4>Ticket</h4>
                    <p>See number of confirmed and approved tickets</p>
                    <h6>Latest Activity</h6>
                  </div>
                  <TableContainer
                    searchKey='name'
                    isFetching={isFetching}
                    columns={TicketCol}
                    data={ticketStats?.activities ?? []}
                  />
                </div>
              </>
            )}

            {t.value === "validation" && (
              <ValidateTicket id={id} selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} />
            )}

            {t.value === "scan" && (
              <ValidateQR id={id} selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} />
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
  const list = useMemo(() => (isTicket ? all : all.filter((e: any) => e.status !== "PAST")), [all, isTicket]);

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
        <div className='space-y-2'>
          <Label className='text-black'>{isTicket ? "Search" : "Active"} events</Label>
          <Button
            type='button'
            variant='outline'
            role='combobox'
            size='sm'
            className={cn("max-w-[500px] ml-0 mt-4", className, !selectedEvent && "text-gray-400 font-normal")}
            disabled={status !== "success"}
          >
            {status !== "success" ? "Loading events…" : selectedEvent?.title ?? "Search events"}
            <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0'>
        {status !== "success" ? (
          <div className='p-3'>
            <SkeletonDemo />
          </div>
        ) : (
          <Command>
            <CommandInput placeholder='Search events...' />
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
                      className={cn("mr-2 h-4 w-4", event.id === selectedEvent?.id ? "opacity-100" : "opacity-0")}
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
  const mutation = useVerifyTickets();
  const [ticket, setTicket] = useState<any>(null);

  useEffect(() => {
    if (id !== "event" && !Number.isNaN(Number(id))) {
      form.reset({ EventId: Number(id) });
    } else if (selectedEvent?.id) {
      form.reset({ EventId: Number(selectedEvent.id) });
    }
  }, [id, selectedEvent?.id]);

  console.log(selectedEvent);
  const onSubmit = (v: z.infer<typeof ticketValidationSchema>) => {
    mutation.mutate(
      {
        ticketRef: v.ticketRef?.toLowerCase().trim(),
        EventId: v.EventId,
      },
      {
        onSuccess: (res) => {
          setTicket(res.data.data);
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='flex max-w-[420px] mx-auto mt-5 flex-col gap-3'>
        <h3 className='text-black font-semibold'>Manual Validation</h3>
        <p>Enter the ticket number and ensure it matches our records for validation.</p>

        {id === "event" && (
          <FormField
            control={form.control}
            name='EventId'
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
          name='ticketRef'
          render={({ field }) => (
            <FormItem>
              <Label className='text-black'>Reference Number</Label>
              <Input placeholder='Enter ticket number' {...field} />
              <FormMessage className='top-1' />
            </FormItem>
          )}
        />
        <Button disabled={mutation.isPending} type='submit' className='w-full mt-8 gap-2'>
          Check now
          {mutation.isPending && <Loader className='animate-spin' size={20} />}
        </Button>
      </form>
      <CustomModal open={ticket} setOpen={setTicket} title='Ticket Information'>
        <TicketDetails ticket={ticket} setTicket={setTicket} />
      </CustomModal>
    </Form>
  );
}

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
  const mutation = useVerifyTickets();
  const [ticket, setTicket] = useState<any>(null);

  // UI/debug
  const [rawPreview, setRawPreview] = useState<string>("");
  const [parsedPreview, setParsedPreview] = useState<string>("");

  // error + auto-reset
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [autoResetSec, setAutoResetSec] = useState<number | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // scan control
  const busyRef = useRef(false);
  const lastTicketRef = useRef<string | null>(null);
  const lastTicketAtRef = useRef<number>(0); // for duplicate suppression
  const lastDecodeAtRef = useRef<number>(0); // for throttle

  // force remount of Scanner after reset/errors
  const [scannerKey, setScannerKey] = useState(0);

  const clearTimer = () => {
    if (resetTimerRef.current) {
      clearInterval(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  };

  const resetScanner = useCallback(() => {
    clearTimer();
    setAutoResetSec(null);
    setErrorMsg("");
    setRawPreview("");
    setParsedPreview("");
    busyRef.current = false;
    lastTicketRef.current = null;
    lastTicketAtRef.current = 0;
    lastDecodeAtRef.current = 0;
    mutation.reset?.();
    // remount scanner to ensure detector restarts
    setScannerKey((k) => k + 1);
    try {
      navigator?.vibrate?.(20);
    } catch {}
  }, [mutation]);

  // inside your component (replace your effect with this one)
  useEffect(() => {
    if (mutation.isError) {
      // Safe error extraction (won’t throw if fields are missing)
      const mErr = (mutation as any)?.error;
      const msg = mErr?.response?.data?.errors?.[0]?.message || mErr?.message || "Validation failed";
      setErrorMsg(msg);

      // Start timer only if one isn't already running
      if (!resetTimerRef.current) {
        setAutoResetSec(10);
        resetTimerRef.current = setInterval(() => {
          setAutoResetSec((s) => {
            if (s === null) return s; // already cleared elsewhere
            if (s <= 1) {
              // time's up: clear and reset scanner
              if (resetTimerRef.current) {
                clearInterval(resetTimerRef.current);
                resetTimerRef.current = null;
              }
              resetScanner();
              return null;
            }
            return s - 1;
          });
        }, 1000);
      }
    } else {
      // No error: ensure countdown stops and UI clears
      setAutoResetSec(null);
      if (resetTimerRef.current) {
        clearInterval(resetTimerRef.current);
        resetTimerRef.current = null;
      }
    }

    // Cleanup on unmount or dep change
    return () => {
      if (resetTimerRef.current) {
        clearInterval(resetTimerRef.current);
        resetTimerRef.current = null;
      }
    };
  }, [mutation.isError, resetScanner]);

  const handleDecoded = useCallback(
    (raw?: string) => {
      // Require an event selected
      if (!raw || !selectedEventId) return;
      setRawPreview(raw);

      const now = Date.now();

      // THROTTLE: ignore frames within 350ms of last decode
      if (now - lastDecodeAtRef.current < 350) return;

      const ticketRef = extractTicketRef(raw);
      setParsedPreview(ticketRef || "");
      if (!ticketRef) {
        lastDecodeAtRef.current = now; // we did attempt to decode
        return;
      }

      // DUPLICATE SUPPRESSION: same ticket within 2s
      if (lastTicketRef.current === ticketRef && now - lastTicketAtRef.current < 2000) {
        lastDecodeAtRef.current = now;
        return;
      }

      // accept this decode
      lastTicketRef.current = ticketRef;
      lastTicketAtRef.current = now;
      lastDecodeAtRef.current = now;

      if (busyRef.current) return;

      try {
        navigator?.vibrate?.(50);
      } catch {}

      busyRef.current = true;
      mutation.mutate(
        { ticketRef, EventId: selectedEventId },
        {
          onSuccess: (res) => {
            setTicket(res.data.data);
          },
          onError: (err: any) => {
            // allow rescans quickly after an error
            setTimeout(() => {
              busyRef.current = false;
            }, 300);
          },
          onSettled: () => {
            // also release after success so it’s reusable if user comes back
            setTimeout(() => {
              busyRef.current = false;
            }, 600);
          },
        }
      );
    },
    [mutation, router, selectedEventId]
  );

  return (
    <div className='max-w-[720px] mt-6 mx-auto space-y-6'>
      <div className='flex items-center gap-2'>
        <ScanLine className='h-5 w-5 text-primary' />
        <h4>QR Validation</h4>
      </div>
      <p className='text-sm text-muted-foreground'>
        Point the camera at the ticket QR. On success, you will be redirected to the ticket details.
      </p>

      {id === "event" && <EventSelect selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} />}

      <div className='rounded-lg border border-border overflow-hidden'>
        <div className='aspect-video bg-black/5'>
          {typeof window !== "undefined" && selectedEventId ? (
            <Scanner
              key={scannerKey} // ⬅️ force remount after resets
              onScan={(codes) => handleDecoded(codes?.[0]?.rawValue)}
              onError={(e) => console.error("[QR] camera error:", e)}
              constraints={{ facingMode: "environment" }}
              scanDelay={250}
              allowMultiple={false}
              styles={{
                container: { width: "100%", height: "100%" },
                video: { width: "100%", height: "100%", objectFit: "cover" },
              }}
            />
          ) : (
            <div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
              {selectedEventId ? "Loading camera…" : "Select an event to start scanning"}
            </div>
          )}
        </div>
      </div>

      {/* Status / Controls */}
      <div className='flex items-center gap-2'>
        <Button
          type='button'
          variant='secondary'
          onClick={resetScanner}
          disabled={mutation.isPending}
          className='gap-2'
        >
          <RotateCcw className='w-4 h-4' />
          Reset
        </Button>
      </div>

      {/* Debug (optional) */}
      <div className='rounded-md border p-3 bg-muted/30 text-xs'>
        <div className='font-medium mb-1'>Ticket Information</div>
        <div className='break-all'>
          <span className='text-muted-foreground'>Reference number:</span> {parsedPreview?.toUpperCase() || "—"}
        </div>
        {mutation.isError && (
          <div className='text-xs text-red-600'>
            {errorMsg}
            {typeof autoResetSec === "number" && (
              <span className='ml-2'>
                Auto reset in <b>{autoResetSec}s</b>
              </span>
            )}
          </div>
        )}
      </div>

      <CustomModal open={ticket} setOpen={setTicket} title='Ticket Information'>
        <TicketDetails ticket={ticket} setTicket={setTicket} />
      </CustomModal>
    </div>
  );
}

const TicketCol: ColumnDef<any>[] = [
  {
    accessorKey: "Users",
    header: "Name",
    cell: ({ row }) => {
      const user: any = row.getValue("Users");
      return <div className='font-medium '>{user ? `${user.first_name}  ${user.last_name}` : "N/A"}</div>;
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
          <div className='py-1 px-2 flex items-center gap-2 rounded-md text-center font-medium'>
            <CheckCircle2 className='text-green-700 h-4 w-4' />
            <p className='leading-normal'>Validation Successful</p>
          </div>
        ) : (
          <div className='py-1 px-2 flex items-center gap-2 rounded-md text-center font-medium'>
            <XCircle className='text-red-700 h-4 w-4' />
            <p className='leading-normal'>Validation Failed</p>
          </div>
        )}
      </div>
    ),
  },
];

// Parses many QR formats and returns a ticketRef (string) or null
function extractTicketRef(raw: string): string | null {
  if (!raw) return null;

  // 1) JSON payloads
  try {
    const obj = JSON.parse(raw);
    // Common shapes: { ticketRef: "ABC123" } or { ticket: { ref: "..." } }
    const j1 = obj?.ticketRef ?? obj?.ticket?.ref ?? obj?.ref ?? obj?.code;
    if (typeof j1 === "string" && j1.trim()) return j1.trim();
  } catch {
    // not JSON
  }

  // 2) URL payloads (query, hash, or path)
  try {
    const u = new URL(raw);
    // query params
    const params = u.searchParams;
    const qp =
      params.get("ticketRef") || params.get("ticket_ref") || params.get("ref") || params.get("t") || params.get("code");
    if (qp && qp.trim()) return qp.trim();

    // hash fragment e.g. #ticketRef=ABC123
    if (u.hash) {
      const h = new URLSearchParams(u.hash.replace(/^#/, ""));
      const hp = h.get("ticketRef") || h.get("ticket_ref") || h.get("ref") || h.get("t") || h.get("code");
      if (hp && hp.trim()) return hp.trim();
    }

    // path segments… e.g. /ticket/ABC123 or /t/ABC123
    const seg = u.pathname.split("/").filter(Boolean);
    for (let i = 0; i < seg.length - 1; i++) {
      const k = seg[i]?.toLowerCase();
      if (["ticket", "t", "ref"].includes(k)) {
        const val = seg[i + 1];
        if (val && /^[A-Za-z0-9\-_]+$/.test(val)) return val;
      }
    }
  } catch {
    // not a URL
  }

  // 3) Plain text / fallback regex (…ticketRef: ABC123, ref=ABC123, etc.)
  const m =
    raw.match(/(?:ticket\.?ref|ticketRef|ticket_ref|ref|code|t)[\s:=/#-]*([A-Za-z0-9\-_]{4,})/i) ||
    raw.match(/([A-Za-z0-9\-_]{6,})/); // last resort: longest token
  if (m && m[1]) return m[1].trim();

  return null;
}

type LabelValueItem = {
  label: string;
  value?: React.ReactNode;
  /** If true, blank values render as "--" instead of "—" */
  isFee?: boolean;
};

const FallbackText = ({ value, isFee }: { value?: React.ReactNode; isFee?: boolean }) => {
  const isBlank = value === null || value === undefined || (typeof value === "string" && value.trim() === "");
  if (isBlank) return <>{isFee ? "--" : "—"}</>;
  return <>{value}</>;
};

const FieldRow = ({ item }: { item: LabelValueItem }) => (
  <div>
    <p>{item.label}</p>
    <p className='text-black font-medium'>
      <FallbackText value={item.value} isFee={item.isFee} />
    </p>
  </div>
);

const TicketDetails = ({ ticket, setTicket }: any) => {
  const mutation = useValidateTickets();
  const [isDisable, setIsDisable] = useState(false);

  console.log(ticket);

  const handleValidate = () => {
    mutation.mutate(
      {
        EventId: ticket?.EventId,
        ticketRef: ticket?.ref,
      },
      {
        onSuccess: () => {
          setIsDisable(true);
        },
      }
    );
  };

  // Safe data handle (works if API returns {data:{...}} or just {...})
  const eventTitle = shortenText(ticket?.Events?.title, 19);
  const eventDateTime = ticket?.Events?.createdAt
    ? `${formatDate(ticket?.Events.createdAt)}, ${formatTime(ticket?.Events.createdAt)}`
    : "—";
  const ticketRefUpper = ticket?.ref ? String(ticket?.ref).toUpperCase() : "";
  const fullName = [ticket?.Users?.first_name, ticket?.Users?.last_name ?? ticket?.Users?.username]
    .filter(Boolean)
    .join(" ");

  // Map-configured fields (DRY)
  const leftCol: LabelValueItem[] = [
    { label: "Ticket Ref:", value: ticketRefUpper },
    { label: "Phone Number:", value: ticket?.Users?.phone },
    { label: "Ticket Type:", value: ticket?.Event_Plans?.name },
    // {
    //   label: "Ticket Fee:",
    //   value: ticket?.Event_Plans?.fee ?? ticket?.fee,
    //   isFee: true,
    // },
  ];

  const rightCol: LabelValueItem[] = [
    { label: "Name:", value: fullName },
    { label: "Date:", value: eventDateTime },
    { label: "Email:", value: shortenText(ticket?.Users?.email, 19) },
  ];

  return (
    <div className='max-w-[500px] w-full mx-auto'>
      <div className='relative pt-6 pb-[10px] px-6 border border-gray-200 rounded-lg'>
        <div className='redBorder absolute top-0 left-0 bg-red-700 h-[6px] w-full' />

        <div className='flex flex-col gap-[10px] pt-2 pb-6'>
          <Image src={Logo} alt='Logo' className='mx-auto' />

          <div>
            <Image
              src={ticket?.avatar || "/noavatar.png"}
              alt='Event'
              width={500}
              height={300}
              className='h-[100px] mb-4 max-w-[100px] object-cover rounded-full shadow-lg'
            />

            <div>
              <p>Event:</p>
              <p className='text-black font-medium'>
                <FallbackText value={eventTitle} />
              </p>
            </div>

            <div className='flex justify-between gap-6'>
              <div className='flex flex-col gap-3 pt-5'>
                {leftCol.map((item) => (
                  <FieldRow key={item.label} item={item} />
                ))}
              </div>

              <div className='flex flex-col gap-3 pt-5'>
                {rightCol.map((item) => (
                  <FieldRow key={item.label} item={item} />
                ))}
              </div>
            </div>
          </div>

          <div className='space-y-2 mt-8'>
            {isDisable && (
              <div className='grid w-fit mb-3 mx-auto items-center justify-center grid-cols-[16px,1fr] gap-2'>
                <CheckCircle2 size={16} className='text-green-600' />
                <p className='text-sm text-green-600'>This ticket has been approved.</p>
              </div>
            )}
            {ticket?.dateOfUsage && (
              <div className='grid w-fit mb-3 mx-auto items-center justify-center grid-cols-[16px,1fr] gap-2'>
                <FaInfoCircle size={16} className='text-red-600' />
                <p className='text-sm text-red-600'>This ticket has already been used.</p>
              </div>
            )}
            <Button
              disabled={ticket?.dateOfUsage || mutation.isPending || isDisable}
              className='max-w-[350px] mx-auto w-full'
              onClick={handleValidate}
            >
              {mutation.isPending ? <Loader2 size={20} className='animate-spin' /> : "Approve Ticket"}
            </Button>

            <Button className='max-w-[350px] w-full mx-auto' variant='secondary' onClick={() => setTicket(null)}>
              Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
