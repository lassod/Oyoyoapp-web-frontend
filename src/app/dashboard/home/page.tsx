"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import Autoplay from "embla-carousel-autoplay";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaInfoCircle } from "react-icons/fa";
import { X, Search as Lens } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dashboard } from "@/components/ui/containers";
import { SkeletonCard1, SkeletonCard2 } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import EventCard from "@/app/components/dashboard/EventCard";
import ViewEvent from "@/components/dashboard/events/ViewEvent";
import TicketSummary from "@/components/dashboard/events/TicketSummary";
import { FilterMenu } from "@/app/components/dashboard/FilterMenu";

import { useGetAllEvents, useGetSpecificEvents } from "@/hooks/events";
import { useGetOnboardingStatus } from "@/hooks/wallet";

import { filterEventsByDate } from "@/lib/auth-helper";
import { Empty } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

/* ------------------------------------------------------------------ */

type EventLike = {
  status?: string;
  date?: string;
  end?: string;
  endTime?: string;
};

function isOngoingEvent(event: EventLike, now = Date.now()) {
  if (event.status === "ONGOING") return true;
  if (!event.date) return false;

  const start = new Date(event.date).getTime();
  const endSource = event.endTime ?? event.end;
  if (!endSource) return false;

  const end = new Date(endSource).getTime();
  return start <= now && now <= end;
}

/* ------------------------------------------------------------------ */

const DashboardPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const plugin = useRef(Autoplay({ delay: 2500, stopOnInteraction: true }));
  const { status } = useSession();
  const { data: kycData, status: kycStatus } = useGetOnboardingStatus();
  const [event, setEvent] = useState<any>(null);
  const [ticket, setTicket] = useState<any>(null);
  const [kycInfo, setKycInfo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  /* ------------------ Persist selection ------------------ */
  useEffect(() => {
    const e = sessionStorage.getItem("selectedEvent");
    const t = sessionStorage.getItem("selectedTicket");
    if (e) setEvent(JSON.parse(e));
    if (t) setTicket(JSON.parse(t));
  }, []);

  useEffect(() => {
    if (event) sessionStorage.setItem("selectedEvent", JSON.stringify(event));
    if (ticket)
      sessionStorage.setItem("selectedTicket", JSON.stringify(ticket));
  }, [event, ticket]);

  /* ------------------ KYC Banner ------------------ */
  useEffect(() => {
    if (kycStatus !== "success") return;

    const s = kycData?.kycRecord?.status;
    if (s === "APPROVED") return setKycInfo(null);

    const map: Record<string, string> = {
      IN_REVIEW: "KYC is in review. You’ll be notified once completed.",
      PENDING: "KYC application is pending.",
      REJECTED: "KYC was rejected. Please resubmit.",
    };

    setKycInfo(map[s] ?? null);
  }, [kycStatus, kycData]);

  /* ------------------ DATA FETCH ------------------ */

  const { data: allEventsRes, isLoading } = useGetAllEvents();

  const { data: nearMeEnv, isLoading: nearMeLoading } =
    useGetSpecificEvents("near-me");

  const allEvents = allEventsRes?.data ?? [];

  /* ------------------ FILTER STATES ------------------ */

  const [filterOngoing, setFilterOngoing] = useState("");
  const [filterUpcoming, setFilterUpcoming] = useState("");
  const [filterPast, setFilterPast] = useState("");

  /* ------------------ DERIVED EVENTS (FAST) ------------------ */

  const { ongoingEvents, upcomingEvents, pastEvents } = useMemo(() => {
    const now = Date.now();
    const q = searchQuery.trim().toLowerCase();

    const ongoing: any[] = [];
    const upcoming: any[] = [];
    const past: any[] = [];

    for (const e of allEvents) {
      const title = e?.title?.toLowerCase() || "";

      // 🔍 SEARCH FILTER
      if (q && !title.includes(q)) continue;

      if (isOngoingEvent(e, now)) {
        ongoing.push(e);
      } else if (new Date(e.date).getTime() > now) {
        upcoming.push(e);
      } else {
        past.push(e);
      }
    }

    return {
      ongoingEvents: filterEventsByDate(ongoing, filterOngoing),
      upcomingEvents: filterEventsByDate(upcoming, filterUpcoming),
      pastEvents: filterEventsByDate(past, filterPast, true),
    };
  }, [allEvents, searchQuery, filterOngoing, filterUpcoming, filterPast]);

  const eventSections = [
    {
      key: "ongoing",
      title: "Ongoing Events",
      filter: filterOngoing,
      setFilter: setFilterOngoing,
      events: ongoingEvents,
      past: false,
      empty: "No ongoing events",
    },
    {
      key: "upcoming",
      title: "Upcoming Events",
      filter: filterUpcoming,
      setFilter: setFilterUpcoming,
      events: upcomingEvents,
      past: false,
      empty: "No upcoming events",
    },
    {
      key: "past",
      title: "Past Events",
      filter: filterPast,
      setFilter: setFilterPast,
      events: pastEvents,
      past: true,
      empty: "No past events",
    },
  ];

  /* ------------------ ROUTE VIEWS ------------------ */

  if (isLoading || status === "loading") return <SkeletonCard2 />;

  if (pathname === "/dashboard/events/view" && event)
    return <ViewEvent event={event} setTicket={setTicket} />;

  if (pathname === "/dashboard/events/view-ticket" && event && ticket)
    return <TicketSummary event={event} ticket={ticket} />;

  /* ------------------ UI ------------------ */

  return (
    <Dashboard className="bg-white">
      <div className="flex mb-4 flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div>
          <h3>Home</h3>
          <p>Explore the top events on Oyoyo</p>
        </div>
        <div className="relative max-w-[260px] w-full">
          <Lens className="absolute z-10 left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by name…"
            className="w-full h-9 pl-8 pr-3"
          />
        </div>
      </div>
      {searchQuery &&
        !ongoingEvents.length &&
        !upcomingEvents.length &&
        !pastEvents.length && (
          <div className="py-10 text-center text-gray-500">
            No events match “{searchQuery}”
          </div>
        )}

      {kycInfo && (
        <div className="border rounded-xl bg-red-50 p-4 grid grid-cols-[20px,1fr,20px] gap-4 mb-6">
          <FaInfoCircle className="fill-red-600 mt-1" />
          <div>
            <h4 className="font-semibold">KYC Verification</h4>
            <p>{kycInfo}</p>
            <Button
              variant="destructive"
              className="mt-2"
              onClick={() => router.push("/dashboard/kyc")}
            >
              Proceed
            </Button>
          </div>
          <X className="cursor-pointer" onClick={() => setKycInfo(null)} />
        </div>
      )}

      {eventSections.map((section) => (
        <Section
          {...section}
          key={section.key}
          plugin={plugin}
          searchQuery={searchQuery}
        />
      ))}

      <h4 className="mt-10 mb-4">Events Near You</h4>
      {nearMeLoading ? (
        <SkeletonCard1 />
      ) : (
        <div className="relative">
          <Carousel>
            {nearMeEnv?.length > 1 && (
              <>
                <CarouselPrevious className="left-[-8px] sm:left-[-18px] top-1/2 -translate-y-1/2" />
                <CarouselNext className="right-[-8px] sm:right-[-18px] top-1/2 -translate-y-1/2" />
              </>
            )}

            <CarouselContent className="gap-4">
              {nearMeEnv?.length ? (
                nearMeEnv.map((item: any) => (
                  <CarouselItem key={item.id} className="max-w-[320px]">
                    <EventCard
                      item={item}
                      setEvent={setEvent}
                      searchQuery={searchQuery}
                    />
                  </CarouselItem>
                ))
              ) : (
                <Empty />
              )}
            </CarouselContent>
          </Carousel>
        </div>
      )}
    </Dashboard>
  );
};

export default DashboardPage;

/* ------------------------------------------------------------------ */

function Section({
  title,
  filter,
  setFilter,
  events,
  setEvent,
  plugin,
  past = false,
  empty,
  searchQuery,
}: any) {
  return (
    <div className="mb-10">
      <h4 className="mb-2">{title}</h4>
      <FilterMenu
        type={past ? 2 : 1}
        filterDateRange={filter}
        setFilterDateRange={setFilter}
        placeholder="Filter by Date"
      />

      <div className="relative">
        <Carousel onMouseLeave={plugin.current.reset}>
          {/* Navigation */}
          {events.length > 1 && (
            <>
              <CarouselPrevious className="left-[-8px] sm:left-[-18px] top-1/2 -translate-y-1/2" />
              <CarouselNext className="right-[-8px] sm:right-[-18px] top-1/2 -translate-y-1/2" />
            </>
          )}

          <CarouselContent className="gap-4 mt-4">
            {events.length ? (
              events.map((item: any) => (
                <CarouselItem key={item.id} className="max-w-[320px]">
                  <EventCard
                    item={item}
                    setEvent={setEvent}
                    searchQuery={searchQuery}
                  />
                </CarouselItem>
              ))
            ) : (
              <Empty title={empty} />
            )}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}
