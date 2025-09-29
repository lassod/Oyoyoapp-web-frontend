"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import { Dashboard } from "@/components/ui/containers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetUserAttendingEvents } from "@/hooks/events";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SkeletonCard2 as SkeletonCardLoading } from "@/components/ui/skeleton";
import { EventCard2 } from "@/app/components/dashboard/EventCard";
import { Empty } from "@/components/ui/table";

type EventStatus = string;

interface AttendingEvent {
  id: number | string;
  title?: string;
  name?: string;
  status?: EventStatus;
  date?: string; // ISO
  endTime?: string | null; // ISO
  description?: string;
  media?: string[];
  // ... any other fields your cards use
}

interface EventTab {
  value: "upcoming" | "past";
  title: string;
  currentEvents: AttendingEvent[];
}

const PAGE_SIZE = 12;

const Tickets: React.FC = () => {
  const { data: session } = useSession();
  const navigation = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Per-tab search (debounced) + shared pagination
  const [filters, setFilters] = useState<{
    page: number;
    searchByTab: Record<string, string>;
    debouncedByTab: Record<string, string>;
  }>({
    page: 1,
    searchByTab: {},
    debouncedByTab: {},
  });

  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [event, setEvent] = useState<AttendingEvent | null>(null);

  const { data: attending = [], status } = useGetUserAttendingEvents();

  // ── Partition events: "PAST" → Past, everything else → Upcoming ─────────────
  const { upcoming, past } = useMemo(() => {
    const list = Array.isArray(attending)
      ? (attending as AttendingEvent[])
      : [];
    const out = {
      upcoming: [] as AttendingEvent[],
      past: [] as AttendingEvent[],
    };

    for (const ev of list) {
      const s = String(ev?.status ?? "").toUpperCase();
      if (s.includes("PAST")) out.past.push(ev);
      else out.upcoming.push(ev);
    }
    return out;
  }, [attending]);

  const eventTabs: EventTab[] = [
    { value: "upcoming", title: "Upcoming", currentEvents: upcoming },
    { value: "past", title: "Past", currentEvents: past },
  ];

  // Debounce search per tab
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        debouncedByTab: {
          ...prev.debouncedByTab,
          [activeTab]: prev.searchByTab[activeTab] || "",
        },
      }));
    }, 300);
    return () => clearTimeout(t);
  }, [activeTab, filters.searchByTab[activeTab]]); // eslint-disable-line react-hooks/exhaustive-deps

  if (status !== "success") return <SkeletonCard2 />;

  return (
    <Dashboard className="bg-white">
      <div className="flex gap-6 justify-between sm:items-center">
        <h3 className="mb-2">Ticket History</h3>

        {/* Mobile menu */}
        <div className="relative sm:hidden">
          <MoreVertical
            className="hover:text-red-700 cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          />
          <div
            className={`${
              isDropdownOpen ? "block" : "hidden"
            } absolute right-0 mt-2 p-4 w-[150px] bg-white rounded-lg shadow-md`}
          >
            {session?.user?.accountType !== "PERSONAL" && (
              <Button
                onClick={() => navigation.push("new-event")}
                className="mr-0 max-w-[120px]"
              >
                Create events
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs
        defaultValue="upcoming"
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as "upcoming" | "past");
          setFilters((prev) => ({ ...prev, page: 1 }));
        }}
        className="w-full mt-4"
      >
        <TabsList className="grid max-w-[220px] grid-cols-2 h-9 items-center justify-center rounded-md bg-white p-0 text-gray-500">
          {eventTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-sm py-2 data-[state=active]:bg-red-50 data-[state=active]:text-red-700 hover:text-red-700"
            >
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="border-b border-gray-200 mt-2" />

        {eventTabs.map((tab) => {
          // Tab-local search values
          const searchValue = filters.searchByTab[tab.value] || "";
          const debounced = filters.debouncedByTab[tab.value] || "";

          // Pagination math per tab
          const totalPages = Math.max(
            1,
            Math.ceil((tab.currentEvents?.length ?? 0) / PAGE_SIZE)
          );
          const safePage = Math.min(Math.max(1, filters.page), totalPages);

          return (
            <TabsContent key={tab.value} value={tab.value}>
              <>
                {/* Per-tab search bar */}
                <div className="mt-4 flex items-center gap-3">
                  <Input
                    placeholder={`Search ${tab.title.toLowerCase()} events...`}
                    value={searchValue}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        searchByTab: {
                          ...prev.searchByTab,
                          [tab.value]: e.target.value,
                        },
                        page: 1,
                      }))
                    }
                    className="max-w-md"
                  />
                </div>

                <AllEvents
                  status={status}
                  currentEvents={tab.currentEvents}
                  page={safePage}
                  totalPages={totalPages}
                  setPage={(newPage: number) =>
                    setFilters((prev) => ({ ...prev, page: newPage }))
                  }
                  tab={tab.value}
                  setEvent={setEvent}
                  setFilters={setFilters}
                  searchQuery={searchValue}
                  debouncedQuery={debounced}
                />
              </>
            </TabsContent>
          );
        })}
      </Tabs>
    </Dashboard>
  );
};

type TabKey = "upcoming" | "past" | string;

interface AllEventsProps {
  status: "success" | "pending" | "error" | string;
  currentEvents: AttendingEvent[];
  page: number;
  totalPages: number;
  setPage: (n: number) => void;
  tab: TabKey;
  setFilters: (updater: any) => void;
  setEvent: (ev: AttendingEvent | null) => void;
  guest?: boolean;
  setEventData?: (d: any) => void;
  isFetching?: boolean;
  searchQuery?: string;
  debouncedQuery?: string;
}

const AllEvents: React.FC<AllEventsProps> = ({
  status,
  currentEvents,
  page,
  totalPages,
  setPage,
  tab,
  setFilters,
  setEvent,
  guest,
  setEventData,
  isFetching,
  searchQuery,
  debouncedQuery,
}) => {
  const q = (debouncedQuery ?? searchQuery ?? "").trim().toLowerCase();
  const isSearching = q.length > 0;

  // Search filter (client-side)
  const filtered = useMemo(() => {
    const list = Array.isArray(currentEvents) ? currentEvents : [];
    if (!isSearching) return list;

    const contains = (s?: string) => (s ? s.toLowerCase().includes(q) : false);

    return list.filter((e) => {
      const name = e?.name || e?.title || "";
      const category = (e as any)?.category || (e as any)?.type || "";
      const tags = Array.isArray((e as any)?.tags)
        ? ((e as any).tags as string[]).join(" ")
        : (e as any)?.tags || "";
      const description = (e as any)?.shortDescription || e?.description || "";

      const venue =
        (e as any)?.venue ||
        (e as any)?.venueName ||
        (e as any)?.location ||
        (e as any)?.city ||
        "";

      const organizer =
        (e as any)?.organizer ||
        (e as any)?.organizerName ||
        (e as any)?.host ||
        "";

      return (
        contains(name) ||
        contains(venue) ||
        contains(organizer) ||
        contains(category) ||
        contains(tags) ||
        contains(description)
      );
    });
  }, [currentEvents, isSearching, q]);

  // Pagination slice
  const pagedList = useMemo(() => {
    const list = isSearching ? filtered : currentEvents ?? [];
    const start = (page - 1) * PAGE_SIZE;
    return list.slice(start, start + PAGE_SIZE);
  }, [filtered, currentEvents, isSearching, page]);

  const showPagination = !isSearching && totalPages > 1;

  const goToPrevPage = (p: number) => {
    if (p <= 1) return;
    setPage(p - 1);
    setFilters((prev: any) => ({ ...prev, page: p - 1 }));
  };

  const goToNextPage = (p: number) => {
    if (p >= totalPages) return;
    setPage(p + 1);
    setFilters((prev: any) => ({ ...prev, page: p + 1 }));
  };

  if (status !== "success") {
    return <SkeletonCardLoading />;
  }

  const isSearchingClass = isSearching ? "pt-4" : "";

  return (
    <div>
      {pagedList?.length > 0 ? (
        <>
          <div className="grid my-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
            {pagedList.map((event) => {
              const title = event?.name || event?.title || "";
              return (
                <div
                  key={(event as any).id ?? (event as any)._id}
                  className="rounded-xl border border-border bg-card text-card-foreground transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                >
                  <EventCard2
                    item={event}
                    value={tab}
                    setEvent={setEvent}
                    guest={guest}
                    setEventData={setEventData}
                    isFetching={isFetching}
                    searchQuery={q} // in case EventCard2 implements its own highlighting
                  />
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-1 mt-6 mb-10 items-center w-full justify-center h-full">
          <p className="text-sm text-muted-foreground">
            {isSearching ? (
              <Empty title="No events match your search." />
            ) : (
              <Empty title="No event found." />
            )}
          </p>
        </div>
      )}

      {showPagination && (
        <Pagination>
          <PaginationContent className="gap-3">
            <PaginationItem>
              <PaginationPrevious onClick={() => goToPrevPage(page)} />
            </PaginationItem>

            <PaginationItem>
              <p className="flex text-black items-center justify-center text-sm">
                Page {page} of {totalPages}
              </p>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext onClick={() => goToNextPage(page)} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default Tickets;
