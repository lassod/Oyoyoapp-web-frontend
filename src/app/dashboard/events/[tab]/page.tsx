"use client";
import { Dashboard } from "@/components/ui/containers";
import { useGetAllEvents, useGetUserAttendingEvents, useGetUserEvents, useGetUserEventsStats } from "@/hooks/events";
import { MoreVertical, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { CardWallet } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { FilterMenuEvent } from "@/app/components/dashboard/FilterMenu";
import { AllEvents } from "@/app/components/dashboard/Search";
import ViewEvent from "@/components/dashboard/events/ViewEvent";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import TicketSummary from "@/components/dashboard/events/TicketSummary";
import EditEvent from "@/components/dashboard/events/EditEvent";
import EditEvent2 from "@/components/dashboard/events/EditEvent2";
import CreatorEventView from "@/components/dashboard/events/CreatorEventView";
import AiEventNew from "@/components/dashboard/events/AiEventNew";
import AiEventPlanner from "@/components/dashboard/events/AiEventPlanner";
import NewEvent from "@/components/dashboard/events/NewEvent";
import TableArrangement from "@/components/dashboard/events/TableArrangement";
import NewTable from "@/components/dashboard/events/NewTable";
import { useGetUser } from "@/hooks/user";
import ManageAccess from "@/components/dashboard/events/ManageAccess";

const Events = () => {
  const { data: session } = useSession();
  const { data: user } = useGetUser();
  const navigation = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<any>({ page: 1 });
  const [event, setEvent] = useState<any>(null);
  const [ticket, setTicket] = useState<any>(null);

  const { data: allEvents, status: allEventStatus, refetch, isFetching } = useGetAllEvents(filters);
  const { data: myEvents, status: myEventsStatus } = useGetUserEvents(filters);
  const { data: attending, status: attendingStatus } = useGetUserAttendingEvents();
  const { data: eventStats } = useGetUserEventsStats();

  const [totalPages, setTotalPages] = useState(allEvents?.pagination?.totalPages || 1);

  // Restore saved selections
  useEffect(() => {
    if (event) sessionStorage.setItem("selectedEvent", JSON.stringify(event));
    if (ticket) sessionStorage.setItem("selectedTicket", JSON.stringify(ticket));
  }, [event, ticket]);

  useEffect(() => {
    if (allEvents) setTotalPages(allEvents?.pagination?.totalPages);
    if (myEvents) setTotalPages(myEvents?.pagination?.totalPages);
  }, [allEvents, myEvents]);

  useEffect(() => {
    const detailPaths = [
      "/dashboard/events/view",
      "/dashboard/events/edit-event",
      "/dashboard/events/completed",
      "/guest/view",
    ];

    const isOnDetailPage = detailPaths.includes(pathname);

    // Only restore if we're on a detail page
    if (isOnDetailPage) {
      const savedEvent = sessionStorage.getItem("selectedEvent");
      if (savedEvent && !event) {
        try {
          const parsed = JSON.parse(savedEvent);
          setEvent(parsed);
        } catch (error) {
          console.error("Failed to parse saved event", error);
          sessionStorage.removeItem("selectedEvent");
        }
      }
    }

    setIsLoading(false);
  }, [pathname]);

  if (isLoading) return <SkeletonCard2 />;

  const eventTabs = [
    {
      value: "all-events",
      title: "All events",
      type: "personal",
      showFilter: true,
      status: allEventStatus,
      currentEvents: allEvents?.data,
      showStats: false,
    },
    {
      value: "attending",
      title: "Attending",
      type: "personal",
      status: attendingStatus,
      currentEvents: attending,
      showStats: false,
    },
    {
      value: "my-events",
      title: "My events",
      status: myEventsStatus,
      currentEvents: myEvents?.data,
      showStats: true,
    },
  ];

  const renderEventView = () => {
    // Check if viewing an event and if user is the creator
    if (pathname === "/dashboard/events/view" && event) {
      const isCreator = event?.UserId === session?.user?.id;
      if (isCreator) {
        return <CreatorEventView event={event} />;
      }
      return <ViewEvent event={event} setTicket={setTicket} />;
    }

    const views: any = {
      "/dashboard/events/new-event": <NewEvent />,
      // "/dashboard/events/edit-event1": event && <EditEvent event={event} />,
      "/dashboard/events/edit-event": <EditEvent2 />,
      "/dashboard/events/new-aievent": event && <AiEventNew event={event} />,
      "/dashboard/events/view-ticket": event && ticket && (
        <TicketSummary event={event} ticket={ticket} currency={user?.preferredCurrency} />
      ),
      "/dashboard/events/completed": event && <ViewEvent event={{ ...event, completed: true }} setTicket={setTicket} />,
      "/dashboard/events/aievent-planner": event && <AiEventPlanner event={event} />,
      "/dashboard/events/table-arrangement": event && <TableArrangement event={event} />,
      "/dashboard/events/manage-access": event && <ManageAccess event={event} />,
      "/dashboard/events/new-table": event && <NewTable event={event} />,
    };
    return views[pathname] || null;
  };

  const selectedView = renderEventView();
  if (selectedView) return <>{selectedView}</>;

  return (
    <Dashboard className='bg-white'>
      <div className='flex gap-6 justify-between sm:items-center'>
        <div>
          <h3 className='mb-2'>Events</h3>
          <p>See all events on Oyoyo</p>
        </div>

        {/* Mobile menu */}
        <div className='relative sm:hidden'>
          <MoreVertical
            className='hover:text-red-700 cursor-pointer'
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          />
          <div
            className={`${
              isDropdownOpen ? "block" : "hidden"
            } absolute right-0 mt-2 p-4 w-[150px] bg-white rounded-lg shadow-md`}
          >
            {session?.user?.accountType !== "PERSONAL" && (
              <Button onClick={() => navigation.push("new-event")} className='mr-0 max-w-[120px]'>
                Create events
              </Button>
            )}
          </div>
        </div>

        {/* Desktop actions */}
        {session?.user?.accountType !== "PERSONAL" && (
          <div className='hidden sm:flex flex-col sm:flex-row gap-[16px]'>
            <Button className='mr-0'>
              <Link
                href='/dashboard/events/new-event'
                className='flex flex-row text-center justify-start items-center gap-[5px]'
              >
                <Plus className='h-4 w-4' />
                Create events
              </Link>
            </Button>
          </div>
        )}
      </div>

      <Tabs
        defaultValue={
          pathname.includes("my-events") ? "my-events" : pathname.includes("attending") ? "attending" : "all-events"
        }
        className='w-full mt-4'
      >
        <TabsList className='grid max-w-[329px] grid-cols-3 h-9 items-center justify-center rounded-md bg-white p-0 text-gray-500'>
          {eventTabs
            .filter((tab) => session?.user?.accountType !== "PERSONAL" || tab.type === "personal")
            .map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                onClick={() => {
                  setFilters({ page: 1 });
                  navigation.push(tab.value);
                }}
                className='rounded-sm py-2 data-[state=active]:bg-red-50 data-[state=active]:text-red-700 hover:text-red-700'
              >
                {tab.title}
              </TabsTrigger>
            ))}
        </TabsList>

        <div className='border-b border-gray-200 mt-2'></div>

        {eventTabs.map((tab) => (
          <TabsContent value={tab.value} key={tab.value}>
            <>
              {tab.showStats && (
                <div className='grid gap-4 grid-flow-row-dense sm:grid-cols-2 md:grid-cols-4 border-b border-gray-200 pt-5 pb-8 m-0'>
                  <CardWallet title='Total Tickets' header={eventStats?.totalTickets?.toString() || "--"} />
                  <CardWallet title='Active Events' header={eventStats?.activeEvents?.toString() || "--"} />
                  <CardWallet title='Total Unsold' header={eventStats?.totalUnsold?.toString() || "--"} />
                  <CardWallet title='Total Sold' header={eventStats?.totalSold?.toString() || "--"} />
                </div>
              )}
              {tab.showFilter && <FilterMenuEvent item={tab} setFilters={setFilters} />}
              <AllEvents
                status={tab.status}
                currentEvents={tab.currentEvents}
                page={filters.page}
                totalPages={totalPages}
                setPage={(newPage: number) => setFilters((prev: any) => ({ ...prev, page: newPage }))}
                tab={tab.value}
                setEvent={setEvent}
                setFilters={setFilters}
                isFetching={isFetching}
              />
            </>
          </TabsContent>
        ))}
      </Tabs>
    </Dashboard>
  );
};

export default Events;
