"use client";
import React, { useEffect, useMemo, useState } from "react";
import { SkeletonCard1 } from "@/components/ui/skeleton";
import { Dashboard } from "@/components/ui/containers";
import { useGetAllEvents } from "@/hooks/events";
import { goToPrevPage, goToNextPage } from "@/lib/auth-helper";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { EventCard2 } from "@/app/components/dashboard/EventCard";
import { FilterMenuEvent } from "./FilterMenu";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import TicketSummary from "@/components/dashboard/events/TicketSummary";
import ViewEvent from "@/components/dashboard/events/ViewEvent";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Empty from "../../components/assets/images/empty.svg";
import { useGetAllGuestEvent } from "@/hooks/guest";

/** simple debounce hook */
function useDebounce<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const Search = ({
  setIsSearch,
  setEventData,
  guest = false,
  currency,
}: any) => {
  const [filters, setFilters] = useState<any>(null);
  const { data: allGuestEvents, status: allGuestEventStatus } =
    useGetAllGuestEvent({ ...filters, currency });
  const {
    data: allEvents,
    status: allEventStatus,
    refetch,
    isFetching,
  } = useGetAllEvents(filters);
  const [page, setPage] = useState(allEvents?.pagination?.page || 1);
  const [totalPages, setTotalPages] = useState(
    allEvents?.pagination?.totalPages || 1
  );
  const [event, setEvent] = useState<any>(null);
  const pathname = usePathname();
  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedQuery = useDebounce(searchQuery, 250);
  const isSearching = debouncedQuery.trim().length > 0;

  useEffect(() => {
    if (event) sessionStorage.setItem("selectedEvent", JSON.stringify(event));
    if (ticket)
      sessionStorage.setItem("selectedTicket", JSON.stringify(ticket));
  }, [event, ticket]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const savedEvent = sessionStorage.getItem("selectedEvent");
    const savedTicket = sessionStorage.getItem("selectedTicket");
    if (savedEvent) setEvent(JSON.parse(savedEvent));
    if (savedTicket) setTicket(JSON.parse(savedTicket));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (allEvents) {
      setPage(allEvents.pagination.page);
      setTotalPages(allEvents?.pagination?.totalPages);
    }
  }, [allEvents]);

  useEffect(() => {
    if (allGuestEvents) {
      setPage(allGuestEvents.pagination.page);
      setTotalPages(allGuestEvents?.pagination?.totalPages);
    }
  }, [allGuestEvents]);

  if (isLoading) return <SkeletonCard1 />;

  return (
    <>
      {pathname === "/guest/view" && event ? (
        <ViewEvent event={event} setTicket={setTicket} />
      ) : pathname === "/guest/view-ticket" && event && ticket ? (
        <TicketSummary event={event} ticket={ticket} guest={true} />
      ) : pathname === "/dashboard/events/view" && event ? (
        <ViewEvent event={event} setTicket={setTicket} />
      ) : pathname === "/dashboard/events/completed" && event ? (
        <ViewEvent
          event={{ ...event, completed: true }}
          setTicket={setTicket}
        />
      ) : pathname === "/dashboard/events/view-ticket" && event && ticket ? (
        <TicketSummary event={event} ticket={ticket} />
      ) : (
        <Dashboard
          className="bg-white pt-16"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top bar */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-border">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center px-2 py-3">
              <Button
                onClick={() => setIsSearch(false)}
                className="gap-2 w-fit"
              >
                <XCircle className="w-4 h-5" />
                Close
              </Button>

              {/* Filter/search controls (existing component) */}
              <div className="mt-3 sm:mt-0">
                <FilterMenuEvent
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  setFilters={setFilters}
                />
              </div>
            </div>

            {/* Results summary bar (visible only while searching) */}
            {/* {isSearching && (
              <div className="px-2 pb-3">
                <SearchSummary
                  query={debouncedQuery}
                  onClear={() => setSearchQuery("")}
                />
              </div>
            )} */}
          </div>

          <AllEvents
            status={guest ? allGuestEventStatus : allEventStatus}
            currentEvents={guest ? allGuestEvents?.data : allEvents?.data}
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            setFilters={setFilters}
            setEvent={setEvent}
            setEventData={setEventData}
            guest={guest}
            isFetching={isFetching}
            /** pass both raw & debounced */
            searchQuery={searchQuery}
            debouncedQuery={debouncedQuery}
          />
        </Dashboard>
      )}
    </>
  );
};

export default Search;

/** A small summary chip row shown when searching */
// function SearchSummary({
//   query,
//   onClear,
// }: {
//   query: string;
//   onClear: () => void;
// }) {
//   return (
//     <div className="flex items-center justify-between rounded-md border border-border bg-muted px-3 py-2">
//       <div className="text-sm text-muted-foreground">
//         Showing results for{" "}
//         <span className="font-medium text-foreground">&quot;{query}&quot;</span>
//       </div>
//       <Button variant="ghost" size="sm" onClick={onClear} className="h-8">
//         Clear
//       </Button>
//     </div>
//   );
// }

export const AllEvents = ({
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
}: any) => {
  /** normalize + match helper */
  const q = (debouncedQuery ?? "").trim().toLowerCase();
  const isSearching = q.length > 0;

  const filtered = useMemo(() => {
    const list = Array.isArray(currentEvents) ? currentEvents : [];
    if (!isSearching) return list;

    const pick = (obj: any, key: string) =>
      (obj?.[key] ?? obj?.[key?.toLowerCase?.()] ?? "") as string;

    const contains = (s?: string) => (s ? s.toLowerCase().includes(q) : false);

    return list.filter((e: any) => {
      // Be liberal with possible fields your API may return
      const name = e?.name || e?.title || e?.eventName || e?.event_title || "";
      const venue = e?.venue || e?.venueName || e?.location || e?.city || "";
      const organizer = e?.organizer || e?.organizerName || e?.host || "";
      const category = e?.category || e?.type || "";
      const tags = Array.isArray(e?.tags) ? e.tags.join(" ") : e?.tags || "";

      const description = e?.shortDescription || e?.description || "";

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

  const listToRender = isSearching ? filtered : currentEvents ?? [];
  const showPagination = !isSearching && tab !== "attending";

  return (
    <>
      {status !== "success" ? (
        <SkeletonCard1 />
      ) : (
        <div>
          {listToRender?.length > 0 ? (
            <>
              {/* classy grid with subtle animation */}
              <div className="grid my-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                {listToRender.map((event: any) => (
                  <div
                    key={event.id ?? event._id}
                    className="rounded-xl border border-border bg-card text-card-foreground transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <EventCard2
                      item={event}
                      value={tab}
                      setEvent={setEvent}
                      guest={guest}
                      setEventData={setEventData}
                      isFetching={isFetching}
                      searchQuery={searchQuery} // keeps your internal highlight behaviour if any
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-1 mt-6 mb-10 items-center w-full justify-center h-full">
              <Image src={Empty} alt="Empty" className="h-[150px] w-[130px]" />
              <p className="text-sm text-muted-foreground">
                {isSearching
                  ? "No events match your search."
                  : "No event found."}
              </p>
            </div>
          )}

          {showPagination && (
            <Pagination>
              <PaginationContent className="gap-3">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => goToPrevPage(page, setPage, setFilters)}
                    isActive={page !== 1}
                  />
                </PaginationItem>

                <PaginationItem>
                  <p className="flex text-black items-center justify-center text-sm">
                    Page {page} of {totalPages}
                  </p>
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      goToNextPage(page, totalPages, setPage, setFilters)
                    }
                    isActive={page !== totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </>
  );
};
