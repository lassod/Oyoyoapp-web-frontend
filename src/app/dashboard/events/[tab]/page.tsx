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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { data: attending, status: attendingStatus } = useGetUserAttendingEvents();
  const { data: eventStats } = useGetUserEventsStats();
  const [filters, setFilters] = useState<any>({ page: 1 }); // Initialize with page 1
  const [event, setEvent] = useState<any>(null);
  const [ticket, setTicket] = useState<any>(null);
  const { data: allEvents, status: allEventStatus, refetch, isFetching } = useGetAllEvents(filters);
  const { data: myEvents, status: myEventsStatus } = useGetUserEvents(session?.user?.id, filters);
  const [totalPages, setTotalPages] = useState(allEvents?.pagination?.totalPages || 1);
  const pathname = usePathname();

  console.log(myEvents);
  useEffect(() => {
    if (event) sessionStorage.setItem("selectedEvent", JSON.stringify(event));
    if (ticket) sessionStorage.setItem("selectedTicket", JSON.stringify(ticket));
  }, [event, ticket]);

  useEffect(() => {
    refetch();
    const savedEvent = sessionStorage.getItem("selectedEvent");
    const savedTicket = sessionStorage.getItem("selectedTicket");
    if (savedEvent) setEvent(JSON.parse(savedEvent));
    if (savedTicket) setTicket(JSON.parse(savedTicket));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (allEvents) {
      setTotalPages(allEvents?.pagination?.totalPages);
    }
    if (myEvents) {
      setTotalPages(myEvents?.pagination?.totalPages);
    }
  }, [allEvents, myEvents]);

  const events = [
    {
      value: "all-events",
      title: "All events",
      type: "personal",
      component: (
        <AllEvents
          status={allEventStatus}
          currentEvents={allEvents?.data}
          page={filters.page}
          totalPages={totalPages}
          setPage={(newPage: number) => setFilters((prev: any) => ({ ...prev, page: newPage }))} // Update filters.page
          tab={"all-events"}
          setEvent={setEvent}
          setFilters={setFilters}
          isFetching={isFetching}
        />
      ),
    },
    {
      value: "attending",
      title: "Attending",
      type: "personal",
      component: (
        <AllEvents
          status={attendingStatus}
          currentEvents={attending}
          tab={"attending"}
          setEvent={setEvent}
          setFilters={setFilters}
          isFetching={isFetching}
        />
      ),
    },
    {
      value: "my-events",
      title: "My events",
      component: (
        <AllEvents
          status={myEventsStatus}
          currentEvents={myEvents?.data}
          page={filters.page}
          totalPages={totalPages}
          setPage={(newPage: number) => setFilters((prev: any) => ({ ...prev, page: newPage }))} // Update filters.page
          tab={"my-events"}
          setFilters={setFilters}
          setEvent={setEvent}
        />
      ),
    },
  ];

  if (isLoading) return <SkeletonCard2 />;
  return (
    <>
      {pathname === "/dashboard/events/new-event" ? (
        <NewEvent />
      ) : pathname === "/dashboard/events/edit-event" && event ? (
        <EditEvent event={event} />
      ) : pathname === "/dashboard/events/new-aievent" && event ? (
        <AiEventNew event={event} />
      ) : pathname === "/dashboard/events/view" && event ? (
        <ViewEvent event={event} setTicket={setTicket} />
      ) : pathname === "/dashboard/events/view-ticket" && event && ticket ? (
        <TicketSummary event={event} ticket={ticket} currency={user?.preferredCurrency} />
      ) : pathname === "/dashboard/events/completed" && event ? (
        <ViewEvent event={{ ...event, completed: true }} setTicket={setTicket} />
      ) : pathname === "/dashboard/events/aievent-planner" && event ? (
        <AiEventPlanner event={event} />
      ) : pathname === "/dashboard/events/table-arrangement" && event ? (
        <TableArrangement event={event} />
      ) : pathname === "/dashboard/events/manage-access" && event ? (
        <ManageAccess event={event} />
      ) : pathname === "/dashboard/events/new-table" && event ? (
        <NewTable event={event} />
      ) : (
        <Dashboard className='bg-white'>
          <div className='flex gap-6 justify-between sm:items-center'>
            <span>
              <h3 className='mb-2'>Events</h3>
              <p>See all events on Oyoyo</p>
            </span>
            {/* Ellipsis menu for smaller screens */}
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
                  <div className='flex flex-col gap-[16px]'>
                    {/* <Button variant={"secondary"} className='mr-0'>
                  <Link href='allEvents/new' className='flex flex-row text-center justify-start items-center gap-[5px]'>
                    <PenLineIcon className='h-4 w-4' />
                    Drafts
                  </Link>
                </Button> */}
                    <Button onClick={() => navigation.push("new-event")} className='mr-0 max-w-[120px]'>
                      Create events
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* For larger screens, show the buttons inline */}
            {session?.user?.accountType !== "PERSONAL" && (
              <div className='hidden sm:flex flex-col sm:flex-row gap-[16px]'>
                {/* <Button variant={"secondary"} className='mr-0'>
              <Link href='allEvents/new' className='flex flex-row text-center justify-start items-center gap-[5px]'>
                <PenLineIcon className='h-4 w-4' />
                Drafts
              </Link>
            </Button> */}
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
              pathname === "/dashboard/events/my-events"
                ? "my-events"
                : pathname === "/dashboard/events/attending"
                  ? "attending"
                  : "all-events"
            }
            className='w-full mt-4'
          >
            <TabsList className='grid max-w-[329px] grid-cols-3 h-9 items-center justify-center rounded-md bg-white p-0 text-gray-500'>
              {session?.user?.accountType === "PERSONAL" ? (
                <>
                  {events
                    .filter((eventList: any) => eventList.type === "personal")
                    .map((service: any) => (
                      <TabsTrigger
                        value={service?.value}
                        key={service?.value}
                        className='rounded-sm py-2 data-[state=active]:bg-red-50 data-[state=active]:text-red-700 hover:text-red-700'
                        onClick={() => navigation.push(service.value)}
                      >
                        {service?.title}
                      </TabsTrigger>
                    ))}
                </>
              ) : (
                <>
                  {events.map((service: any) => (
                    <TabsTrigger
                      value={service?.value}
                      key={service?.value}
                      onClick={() => {
                        setFilters({ page: 1 });
                        navigation.push(service.value);
                      }}
                      className='rounded-sm py-2 data-[state=active]:bg-red-50 data-[state=active]:text-red-700 hover:text-red-700'
                    >
                      {service?.title}
                    </TabsTrigger>
                  ))}
                </>
              )}
            </TabsList>
            <div className='border-b border-gray-200 mt-2'></div>
            {events.map((item: any) => (
              <TabsContent value={item?.value} key={item?.title}>
                <>
                  {item?.value === "my-events" && (
                    <div className='grid gap-4 grid-flow-row-dense sm:grid-cols-2 md:grid-cols-4 border-b border-gray-200 pt-5 pb-8 m-0'>
                      <CardWallet title='Total Tickets' header={eventStats?.totalTickets.toString() || "--"} />
                      <CardWallet title='Active Events' header={eventStats?.activeEvents.toString() || "--"} />
                      <CardWallet title='Total Unsold' header={eventStats?.totalUnsold.toString() || "--"} />
                      <CardWallet title='Total Sold' header={eventStats?.totalSold.toString() || "--"} />
                    </div>
                  )}
                  {item?.value === "all-events" && <FilterMenuEvent item={item} setFilters={setFilters} />}
                  {item.component}
                </>
              </TabsContent>
            ))}
          </Tabs>
        </Dashboard>
      )}
    </>
  );
};

export default Events;
