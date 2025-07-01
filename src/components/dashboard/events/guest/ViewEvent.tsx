"use client";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/ui/containers";
import React, { useEffect, useState } from "react";
import { EventSummary } from "@/app/components/dashboard/EventSummary";
import { detectCurrency, scrollToTop } from "@/lib/auth-helper";
import { useGetGuestEvent, useGetGuestEventCategories } from "@/hooks/guest";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import TicketSummary from "../TicketSummary";

const ViewEvent = ({ event = null, setEvent, setTicket, name }: any) => {
  console.log(event);
  const [currency, setCurrency] = useState<any>(null);
  const navigation = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [eventData, setEventData] = useState<any>(null);
  const { data: eventCategories } = useGetGuestEventCategories();
  const {
    data: fetchedEvent,
    refetch,
    isFetching,
  } = useGetGuestEvent(currency ? event?.id || parseInt(name) : null, currency ? { currency } : undefined);
  const category = eventCategories?.find((item: any) => event?.eventCategoriesId === item.id);
  const [ticketCounts, setTicketCounts] = useState<Record<string, number>>({});
  const [inviteTicket, setInviteTicket] = useState<any>(null);

  useEffect(() => {
    if (name !== "view" || name !== "view-ticket" || name !== "events") detectCurrency(setCurrency);
  }, [name]);

  useEffect(() => {
    if (currency) refetch();
  }, [currency]);

  useEffect(() => {
    if (currency && fetchedEvent && !isFetching && !event) {
      setEventData(fetchedEvent);
      setEvent(fetchedEvent);
      setIsLoading(false);
    }
  }, [fetchedEvent, currency, isFetching, event]);

  const handleCountClick = (adjustment: number, itemName: string) => {
    setTicketCounts((prev) => {
      const currentTotal = Object.values(prev).reduce((sum, count) => sum + count, 0);
      const newCount = (prev[itemName] || 0) + adjustment;
      if (adjustment > 0 && currentTotal >= eventData.capacity) return prev;

      return {
        ...prev,
        [itemName]: Math.max(0, newCount),
      };
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToTop();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchedEvent]);

  useEffect(() => {
    if (event) {
      setEventData(event);
      setIsLoading(false);
    }
  }, [event]);

  let eventPlans = [];
  eventPlans = event?.Event_Plans ? event?.Event_Plans : fetchedEvent?.Event_Plans;

  const handleProceed = () => {
    if (name === "invite") setInviteTicket(ticketCounts);
    else {
      setTicket(ticketCounts);
      navigation.push("/guest/view-ticket");
    }
  };

  if (isLoading) return <SkeletonCard2 />;
  return (
    <>
      {inviteTicket ? (
        <TicketSummary event={event} ticket={inviteTicket} guest={true} currency={currency} />
      ) : (
        <Dashboard className='grid grid-cols-1 md:grid-cols-[1fr,40%] gap-14 sm:gap-6 md:gap-10 relative mt-4 bg-white max-w-screen-xl'>
          <EventSummary
            event={{ ...eventData, Event_Plans: eventPlans }}
            category={category}
            guest={true}
            name={name}
          />
          {eventPlans?.length ? (
            <div className='flex flex-col gap-3'>
              <div className='mb-2'>
                <h3>Ticket type</h3>
                <p>This determines what you have access to</p>
              </div>
              {eventData?.Event_Plans.map((item: any) => (
                <div
                  key={item.name}
                  className='flex justify-between items-start border rounded-lg border-gray-200 p-3 bg-white'
                >
                  <div className='flex flex-col'>
                    <div>
                      <p>Ticket type: {item.name} </p>
                      <span className='text-red-700 font-semibold text-lg'>
                        {item.symbol} {item.price.toLocaleString()}
                      </span>
                    </div>
                    <ul className='ml-6 mt-2 list-disc text-sm text-gray-500 font-[400] flex flex-col gap-2'>
                      {item.items
                        .filter((option: string) => option.trim() !== "") // Remove empty or whitespace-only strings
                        .map((option: string) => (
                          <li key={option}>{option}</li>
                        ))}
                    </ul>
                  </div>
                  <div className='flex items-center gap-3 mt-4'>
                    <button
                      className='h-6 p-[2px] flex justify-center border hover:border-red-700 border-gray-700 items-center w-6 shrink-0 rounded-full'
                      onClick={() => handleCountClick(-1, item.name)}
                      disabled={
                        ticketCounts[item.name] >=
                        eventData.capacity - Object.values(ticketCounts).reduce((sum, count) => sum + count, 0)
                      }
                    >
                      <Minus className='w-[24px] h-[24px] text-gray-600' />
                    </button>
                    <h6>{ticketCounts[item.name] || 0}</h6>
                    <button
                      className='h-6 p-[2px] flex justify-center border hover:border-red-700 border-gray-700 items-center w-6 shrink-0 rounded-full'
                      onClick={() => handleCountClick(1, item.name)}
                      disabled={
                        ticketCounts[item.name] >=
                        eventData.capacity - Object.values(ticketCounts).reduce((sum, count) => sum + count, 0)
                      }
                    >
                      <Plus className='w-[24px] h-[24px] text-gray-600' />
                    </button>
                  </div>
                </div>
              ))}

              <Button
                onClick={handleProceed}
                className='mt-5'
                disabled={
                  event?.status === "PAST" ||
                  Object.values(ticketCounts).every((count) => count < 1) ||
                  Object.values(ticketCounts).reduce((sum, count) => sum + count, 0) > eventData.capacity
                }
              >
                Proceed
              </Button>
            </div>
          ) : null}
        </Dashboard>
      )}
    </>
  );
};

export default ViewEvent;
