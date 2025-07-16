"use client";
import React, { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
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
import Image from "next/image";
import {
  detectCurrencyWithGeolocation,
  filterEventsByDate,
} from "@/lib/auth-helper";
import empty from "@/app/components/assets/images/empty.svg";
import { usePathname } from "next/navigation";
import TicketSummary from "@/components/dashboard/events/TicketSummary";
import { useGetSpecificGuestEvent } from "@/hooks/guest";
import Header from "@/components/landing/Header";
import Download from "@/app/components/oyoyoLandingPage/download/Download";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Filter, Search as Lens } from "lucide-react";
import Search from "@/app/components/dashboard/Search";
import ViewEvent from "@/components/dashboard/events/guest/ViewEvent";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterMenu } from "@/app/components/dashboard/FilterMenu";

const Guest = ({ params }: any) => {
  const { name } = params;
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [eventsNearMe, setEventsNearMe] = useState([]);
  const [filterUpcoming, setFilterUpcoming] = useState("");
  const [filterTrending, setFilterTrending] = useState("");
  const [filterPast, setFilterPast] = useState("");
  const [event, setEvent] = useState<any>(null);
  const [ticket, setTicket] = useState<any>(null);
  const pathname = usePathname();
  const [isSearch, setIsSearch] = useState(false);
  const [currency, setCurrency] = useState("");
  const {
    data: upcomingEnv,
    isLoading: upcomingLoading,
    isFetching: upcomingFetching,
    refetch: refetchUpcoming,
  } = useGetSpecificGuestEvent("upcoming", { currency });

  const {
    data: trendingEnv,
    isLoading: trendingLoading,
    isFetching: trendingFetching,
    refetch: refetchTrending,
  } = useGetSpecificGuestEvent("trending", { currency });

  const {
    data: pastEnv,
    isLoading: pastLoading,
    isFetching: pastFetching,
    refetch: refetchPast,
  } = useGetSpecificGuestEvent("past", { currency });

  const { data: nearMeEnv, isLoading: nearMeLoading } =
    useGetSpecificGuestEvent("near-me", { currency });
  const [guestId, setGuestId] = useState("");

  useEffect(() => {
    if (currency) {
      refetchUpcoming();
      refetchPast();
      refetchTrending();
    }
  }, [currency]);

  useEffect(() => {
    const getGuestId = async () => {
      try {
        const res = await fetch("/api/guestId");
        const data = await res.json();
        setGuestId(data.guestId);
      } catch (e) {
        console.error(e);
      }
    };

    getGuestId();
  }, []);

  useEffect(() => {
    if (event) sessionStorage.setItem("selectedEvent", JSON.stringify(event));
    if (ticket)
      sessionStorage.setItem("selectedTicket", JSON.stringify(ticket));
  }, [event, ticket]);

  useEffect(() => {
    refetchUpcoming();
    refetchPast();
    refetchTrending();
    const savedEvent = sessionStorage.getItem("selectedEvent");
    const savedTicket = sessionStorage.getItem("selectedTicket");
    if (savedEvent) setEvent(JSON.parse(savedEvent));
    if (savedTicket) setTicket(JSON.parse(savedTicket));
  }, []);

  useEffect(() => {
    if (upcomingEnv)
      setUpcomingEvents(filterEventsByDate(upcomingEnv, filterUpcoming));
  }, [upcomingEnv, filterUpcoming]);
  useEffect(() => {
    if (trendingEnv)
      setTrendingEvents(filterEventsByDate(trendingEnv, filterTrending));
  }, [trendingEnv, filterTrending]);
  useEffect(() => {
    if (pastEnv) setPastEvents(filterEventsByDate(pastEnv, filterPast, true));
  }, [pastEnv, filterPast]);

  const plugin1 = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  useEffect(() => {
    if (upcomingEnv) setUpcomingEvents(upcomingEnv);
  }, [upcomingEnv]);
  useEffect(() => {
    if (pastEnv) setPastEvents(pastEnv);
  }, [pastEnv]);
  useEffect(() => {
    if (trendingEnv) setTrendingEvents(trendingEnv);
  }, [trendingEnv]);
  useEffect(() => {
    if (nearMeEnv) setEventsNearMe(nearMeEnv);
  }, [nearMeEnv]);

  const updateCurrency = (newCurrency: any) => {
    setCurrency(newCurrency);
    const params = new URLSearchParams(window.location.search);
    params.set("currency", newCurrency);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  };

  useEffect(() => {
    detectCurrencyWithGeolocation(setCurrency);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const savedCurrency = params.get("currency") || "USD"; // Default to GBP if no currency is found
    setCurrency(savedCurrency);
  }, []);

  return (
    <>
      <Header guest={true} />
      {pathname === "/guest/view" && event ? (
        <ViewEvent event={event} setTicket={setTicket} currencyE={currency} />
      ) : pathname === "/guest/view-ticket" && event && ticket ? (
        <TicketSummary
          event={event}
          ticket={ticket}
          guest={true}
          currency={currency}
        />
      ) : pathname === "/guest/events" ? (
        <>
          {isSearch ? (
            <Search
              setIsSearch={setIsSearch}
              guest={true}
              setEventData={setEvent}
              currency={currency}
            />
          ) : (
            <Dashboard className="bg-white max-w-screen-xl">
              <div className="flex justify-between gap-6">
                <div>
                  <h3 className="mb-2">Welcome</h3>
                  <p>Explore the top events on Oyoyo</p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => setIsSearch(true)}
                    className="mr-0 hidden sm:flex gap-2 justify-start items-left text-gray-400 hover:text-black max-w-[200px]"
                    variant={"combobox"}
                  >
                    <Lens className="w-5 h-5 shadow-sm" /> Search events...
                  </Button>
                  <div className="grid grid-cols-[25px,1fr] sm:grid-cols-[1fr,80px] gap-2 items-center justify-end">
                    <span className="hidden sm:block text-black">
                      Default currency:
                    </span>
                    <Filter
                      onClick={() => setIsSearch(true)}
                      className="text-gray-500 sm:hidden cursor-pointer hover:text-black"
                    />
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
              </div>

              <div>
                <div className="flex flex-col gap-10 pt-4 pb-10">
                  <div className="flex flex-col gap-1 ">
                    <h4 className="mb-2">Upcoming Events</h4>
                    <FilterMenu
                      type={1}
                      filterDateRange={filterUpcoming}
                      placeholder={"Filter by Date"}
                      setFilterDateRange={setFilterUpcoming}
                    />

                    {upcomingLoading || upcomingFetching ? (
                      <SkeletonCard1 />
                    ) : (
                      <Carousel onMouseLeave={plugin1.current.reset}>
                        <div className="absolute z-[1] top-[50%] w-full flex items-center">
                          <CarouselPrevious className="left-[-8px] sm:left-[-18px]" />
                          <CarouselNext className=" right-[-8px] sm:right-[-18px]" />
                        </div>
                        <CarouselContent className="flex mt-4 relative gap-4 pb-4">
                          {upcomingEvents.length > 0 ? (
                            upcomingEvents.map((item: any) => (
                              <CarouselItem
                                key={item?.id}
                                className="relative max-w-[320px] p-0 rounded-lg overflow-hidden"
                              >
                                <EventCard
                                  guest={true}
                                  item={item}
                                  setEvent={setEvent}
                                  guestId={guestId}
                                  isFetching={upcomingFetching}
                                />
                              </CarouselItem>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center w-full h-[150px] gap-4">
                              <Image
                                src={empty}
                                alt="empty"
                                width={100}
                                height={100}
                                className="w-[100px] h-auto"
                              />
                              <p className="text-[#666666] text-center">
                                No Event
                              </p>
                            </div>
                          )}
                        </CarouselContent>
                      </Carousel>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-col gap-4 md:mt-4 mb-5">
                      <h4>Trending Events</h4>
                      <FilterMenu
                        type={1}
                        filterDateRange={filterTrending}
                        placeholder={"Filter by Date"}
                        setFilterDateRange={setFilterTrending}
                      />
                    </div>
                    {trendingLoading || trendingFetching ? (
                      <SkeletonCard1 />
                    ) : (
                      <Carousel>
                        <div className="absolute z-[1] top-[50%] w-full flex items-center">
                          <CarouselPrevious className="left-[-8px] sm:left-[-18px]" />
                          <CarouselNext className=" right-[-8px] sm:right-[-18px]" />
                        </div>
                        <CarouselContent className="flex relative gap-4 pb-4">
                          {trendingEvents.length > 0 ? (
                            trendingEvents.map((item: any) => (
                              <CarouselItem
                                key={item?.id}
                                className="relative max-w-[320px] p-0 rounded-lg overflow-hidden"
                              >
                                <EventCard
                                  guest={true}
                                  item={item}
                                  setEvent={setEvent}
                                  guestId={guestId}
                                  isFetching={trendingFetching}
                                />
                              </CarouselItem>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center w-full h-[150px] gap-4">
                              <Image
                                src={empty}
                                alt="empty"
                                width={100}
                                height={100}
                                className="w-[100px] h-auto"
                              />
                              <p className="text-[#666666] text-center">
                                No Event
                              </p>
                            </div>
                          )}
                        </CarouselContent>
                      </Carousel>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-col gap-4 md:mt-4 mb-5">
                      <h4>Past Events</h4>
                      <FilterMenu
                        type={2}
                        filterDateRange={filterPast}
                        placeholder={"Filter by Date"}
                        setFilterDateRange={setFilterPast}
                      />
                    </div>
                    {pastLoading || pastFetching ? (
                      <SkeletonCard1 />
                    ) : (
                      <Carousel>
                        <div className="absolute z-[1] top-[50%] w-full flex items-center">
                          <CarouselPrevious className="left-[-8px] sm:left-[-18px]" />
                          <CarouselNext className=" right-[-8px] sm:right-[-18px]" />
                        </div>
                        <CarouselContent className="flex relative gap-4 pb-4">
                          {pastEvents.length > 0 ? (
                            pastEvents.map((item: any) => (
                              <CarouselItem
                                key={item?.id}
                                className="relative max-w-[320px] p-0 rounded-lg overflow-hidden"
                              >
                                <EventCard
                                  guest={true}
                                  item={item}
                                  setEvent={setEvent}
                                  guestId={guestId}
                                  isFetching={pastFetching}
                                />
                              </CarouselItem>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center w-full h-[150px] gap-4">
                              <Image
                                src={empty}
                                alt="empty"
                                width={100}
                                height={100}
                                className="w-[100px] h-auto"
                              />
                              <p className="text-[#666666] text-center">
                                No Event
                              </p>
                            </div>
                          )}
                        </CarouselContent>
                      </Carousel>
                    )}
                  </div>
                </div>
                {nearMeLoading ? (
                  <SkeletonCard1 />
                ) : (
                  <Carousel>
                    <h4 className="mb-2 md:mt-4">Events Near You</h4>
                    <div className="absolute z-[1] top-[50%] w-full flex items-center">
                      <CarouselPrevious className="left-[-8px] sm:left-[-18px]" />
                      <CarouselNext className=" right-[-8px] sm:right-[-18px]" />
                    </div>
                    <CarouselContent className="flex relative gap-4 pb-4">
                      {eventsNearMe.length > 0 ? (
                        eventsNearMe?.map((item: any) => (
                          <CarouselItem
                            key={item?.id}
                            className="relative max-w-[320px] p-0 rounded-lg overflow-hidden"
                          >
                            <EventCard
                              guest={true}
                              item={item}
                              setEvent={setEvent}
                              guestId={guestId}
                            />
                          </CarouselItem>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-[150px] gap-4">
                          <Image
                            src={empty}
                            alt="empty"
                            width={100}
                            height={100}
                            className="w-[100px] h-auto"
                          />
                          <p className="text-[#666666] text-center">No Event</p>
                        </div>
                      )}
                    </CarouselContent>
                  </Carousel>
                )}
              </div>
            </Dashboard>
          )}
        </>
      ) : (
        <ViewEvent setEvent={setEvent} setTicket={setTicket} name={name} />
      )}
      <Download className="top-0 md:top-0" />
      <Footer className="top-[50px] md:top-[100px]" />
    </>
  );
};

export default Guest;
