"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search as Lens } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { SkeletonCard1 } from "@/components/ui/skeleton";
import { Dashboard } from "@/components/ui/containers";
import EventCard from "@/app/components/dashboard/EventCard";
import TicketSummary from "@/components/dashboard/events/TicketSummary";
import ViewEvent from "@/components/dashboard/events/guest/ViewEvent";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import Download from "@/app/components/oyoyoLandingPage/download/Download";
import { FilterMenu } from "@/app/components/dashboard/FilterMenu";
import { detectCurrency, filterEventsByDate } from "@/lib/auth-helper";
import { useGetAllGuestEvent } from "@/hooks/events";
import { useGetSpecificGuestEvent } from "@/hooks/guest";
import { Empty } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const Guest = () => {
  const pathname = usePathname();
  const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));
  const [searchQuery, setSearchQuery] = useState("");
  const [event, setEvent] = useState<any>(null);
  const [ticket, setTicket] = useState<any>(null);
  const [currency, setCurrency] = useState("");
  const [guestId, setGuestId] = useState("");

  /* ------------------ Filters ------------------ */
  const [filterOngoing, setFilterOngoing] = useState("");
  const [filterUpcoming, setFilterUpcoming] = useState("");
  const [filterPast, setFilterPast] = useState("");

  /* ------------------ Fetch all guest events ------------------ */
  const { data: allEventsRes, isLoading } = useGetAllGuestEvent(currency);

  /* ------------------ Near-me (kept separate) ------------------ */
  const { data: nearMeEnv, isLoading: nearMeLoading } =
    useGetSpecificGuestEvent("near-me", { currency });

  const allEvents = allEventsRes?.data ?? [];

  const { ongoingEvents, upcomingEvents, pastEvents } = useMemo(() => {
    const now = Date.now();
    const q = searchQuery.trim().toLowerCase();

    const ongoing: any[] = [];
    const upcoming: any[] = [];
    const past: any[] = [];

    for (const e of allEvents) {
      const title = e?.title?.toLowerCase() || "";

      // 🔍 SEARCH FILTER (name/title only)
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

  /* ------------------ Currency detection ------------------ */
  useEffect(() => {
    detectCurrency(setCurrency);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const saved = params.get("currency");
    if (saved) setCurrency(saved);
  }, []);

  const updateCurrency = (newCurrency: string) => {
    setCurrency(newCurrency);
    const params = new URLSearchParams(window.location.search);
    params.set("currency", newCurrency);
    window.history.replaceState({}, "", `?${params.toString()}`);
  };

  /* ------------------ Guest ID ------------------ */
  useEffect(() => {
    fetch("/api/guestId")
      .then((r) => r.json())
      .then((d) => setGuestId(d.guestId))
      .catch(() => null);
  }, []);

  /* ------------------ Persist selection ------------------ */
  useEffect(() => {
    if (event) sessionStorage.setItem("selectedEvent", JSON.stringify(event));
    if (ticket)
      sessionStorage.setItem("selectedTicket", JSON.stringify(ticket));
  }, [event, ticket]);

  useEffect(() => {
    const e = sessionStorage.getItem("selectedEvent");
    const t = sessionStorage.getItem("selectedTicket");
    if (e) setEvent(JSON.parse(e));
    if (t) setTicket(JSON.parse(t));
  }, []);

  /* ------------------ ROUTES ------------------ */

  return (
    <>
      <Header guest />

      {pathname === "/guest/view" && event ? (
        <ViewEvent event={event} setTicket={setTicket} currencyE={currency} />
      ) : pathname === "/guest/view-ticket" && event && ticket ? (
        <TicketSummary
          event={event}
          ticket={ticket}
          guest
          currency={currency}
        />
      ) : pathname === "/guest/events" ? (
        <Dashboard className="bg-white max-w-screen-xl">
          {/* ---------------- Header ---------------- */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-6 mb-6">
            <div>
              <h3 className="mb-2">Welcome</h3>
              <p>Explore the top events on Oyoyo</p>
            </div>

            <div className="flex sm:flex-col gap-3">
              <div className="relative max-w-[260px] w-full">
                <Lens className="absolute z-10 left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events by name…"
                  className="w-full h-9 pl-8 pr-3"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr,80px] gap-2 items-center justify-end">
                <span className="hidden sm:block text-black">
                  Default currency:
                </span>
                <Select onValueChange={(e) => updateCurrency(e)}>
                  <SelectTrigger className="max-w-[80px] h-8">
                    <SelectValue placeholder={currency || "GBP"} />
                  </SelectTrigger>
                  <SelectContent>
                    {["GBP", "USD", "NGN"].map(
                      (currency: string, index: number) => (
                        <SelectItem key={index} value={currency}>
                          {currency}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
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
          </div>

          {/* ---------------- Sections ---------------- */}
          {[
            {
              title: "Ongoing Events",
              events: ongoingEvents,
              filter: filterOngoing,
              setFilter: setFilterOngoing,
              empty: "No ongoing events",
            },
            {
              title: "Upcoming Events",
              events: upcomingEvents,
              filter: filterUpcoming,
              setFilter: setFilterUpcoming,
              empty: "No upcoming events",
            },
            {
              title: "Past Events",
              events: pastEvents,
              filter: filterPast,
              setFilter: setFilterPast,
              past: true,
              empty: "No past events",
            },
          ].map((s) => (
            <div key={s.title} className="mb-10">
              <h4 className="mb-2">{s.title}</h4>
              <FilterMenu
                type={s.past ? 2 : 1}
                filterDateRange={s.filter}
                setFilterDateRange={s.setFilter}
              />

              {isLoading ? (
                <SkeletonCard1 />
              ) : (
                <div className="relative">
                  <Carousel onMouseLeave={plugin.current.reset}>
                    {/* Navigation */}
                    <CarouselPrevious className="absolute left-[-12px] top-1/2 -translate-y-1/2 z-10" />
                    <CarouselNext className="absolute right-[-12px] top-1/2 -translate-y-1/2 z-10" />

                    <CarouselContent className="gap-4 mt-4">
                      {s.events.length ? (
                        s.events.map((item: any) => (
                          <CarouselItem key={item.id} className="max-w-[320px]">
                            <EventCard
                              guest
                              item={item}
                              setEvent={setEvent}
                              guestId={guestId}
                              searchQuery={searchQuery}
                            />
                          </CarouselItem>
                        ))
                      ) : (
                        <Empty title={s.empty} />
                      )}
                    </CarouselContent>
                  </Carousel>
                </div>
              )}
            </div>
          ))}

          {/* ---------------- Near Me ---------------- */}
          <h4 className="mb-2">Events Near You</h4>
          {nearMeLoading ? (
            <SkeletonCard1 />
          ) : (
            <div className="relative">
              <Carousel>
                {/* Navigation */}
                <CarouselPrevious className="absolute left-[-12px] top-1/2 -translate-y-1/2 z-10" />
                <CarouselNext className="absolute right-[-12px] top-1/2 -translate-y-1/2 z-10" />

                <CarouselContent className="gap-4">
                  {nearMeEnv?.length ? (
                    nearMeEnv.map((item: any) => (
                      <CarouselItem key={item.id} className="max-w-[320px]">
                        <EventCard
                          guest
                          item={item}
                          setEvent={setEvent}
                          guestId={guestId}
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
      ) : (
        <ViewEvent setEvent={setEvent} setTicket={setTicket} />
      )}

      <Footer />
    </>
  );
};

export default Guest;
