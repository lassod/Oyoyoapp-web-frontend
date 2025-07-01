"use client";
import React, { useEffect, useState } from "react";
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

const Search = ({ setIsSearch, setEventData, guest = false, currency }: any) => {
  const [filters, setFilters] = useState<any>(null);
  const { data: allGuestEvents, status: allGuestEventStatus } = useGetAllGuestEvent({ ...filters, currency });
  const { data: allEvents, status: allEventStatus, refetch, isFetching } = useGetAllEvents(filters);
  const [page, setPage] = useState(allEvents?.pagination?.page || 1);
  const [totalPages, setTotalPages] = useState(allEvents?.pagination?.totalPages || 1);
  const [event, setEvent] = useState<any>(null);
  const pathname = usePathname();
  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (event) sessionStorage.setItem("selectedEvent", JSON.stringify(event));
    if (ticket) sessionStorage.setItem("selectedTicket", JSON.stringify(ticket));
  }, [event, ticket]);

  console.log("first");
  console.log(isFetching);

  useEffect(() => {
    refetch();
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
        <ViewEvent event={{ ...event, completed: true }} setTicket={setTicket} />
      ) : pathname === "/dashboard/events/view-ticket" && event && ticket ? (
        <TicketSummary event={event} ticket={ticket} />
      ) : (
        <Dashboard className='bg-white' onClick={(e) => e.stopPropagation()}>
          <div className='flex flex-col sm:flex-row z-10 justify-between sm:items-center'>
            <Button onClick={() => setIsSearch(false)} className='gap-2 mt-6 ml-0'>
              <XCircle className='w-4 h-5' />
              Close
            </Button>
            <FilterMenuEvent searchQuery={searchQuery} setSearchQuery={setSearchQuery} setFilters={setFilters} />
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
            searchQuery={searchQuery}
          />
        </Dashboard>
      )}
    </>
  );
};

export default Search;

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
}: any) => {
  return (
    <>
      {status !== "success" ? (
        <SkeletonCard1 />
      ) : (
        <div>
          {currentEvents?.length > 0 ? (
            <div className='grid my-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
              {currentEvents?.map((event: any) => (
                <EventCard2
                  key={event.id}
                  item={event}
                  value={tab}
                  setEvent={setEvent}
                  guest={guest}
                  setEventData={setEventData}
                  isFetching={isFetching}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          ) : (
            <div className='flex flex-col gap-1 mt-4 mb-6 items-center w-full justify-center h-full'>
              <Image src={Empty} alt='Empty' className='h-[150px] w-[130px]' />
              <p>No event found</p>
            </div>
          )}
          {tab !== "attending" && (
            <Pagination>
              <PaginationContent className='gap-3'>
                <PaginationItem>
                  <PaginationPrevious onClick={() => goToPrevPage(page, setPage, setFilters)} isActive={page !== 1} />
                </PaginationItem>

                <PaginationItem>
                  <p className='flex text-black items-center justify-center text-sm'>
                    Page {page} of {totalPages}
                  </p>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => goToNextPage(page, totalPages, setPage, setFilters)}
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
