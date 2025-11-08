"use client";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DashboardContainerContent,
  DashboardHeader,
  DashboardHeaderText,
} from "@/components/ui/containers";
import React, { useEffect, useState } from "react";
import { EventSummary } from "@/app/components/dashboard/EventSummary";
import { useSession } from "next-auth/react";
import { useGetEvent, useGetEventAttendees } from "@/hooks/events";
import Logo from "../../../app/components/assets/images/Oyoyo.svg";
import TicketBorder from "../../../app/components/assets/images/ticket.png";
import Image from "next/image";
import {
  formatDate,
  handleShare,
  scrollToTop,
  shortenText,
} from "@/lib/auth-helper";
import { useGetTicket } from "@/hooks/tickets";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import { useGetGuestEventCategories } from "@/hooks/guest";
import QRCode from "react-qr-code";

const ViewEvent = ({ event, setTicket }: any) => {
  const navigation = useRouter();
  const { data: session } = useSession();
  const { data: eventCategories } = useGetGuestEventCategories();
  const { data: fetchedEvent, status } = useGetEvent(event?.id);
  const { data: attendees } = useGetEventAttendees(event?.id);
  const [orderId, setOrderId] = useState<any>(null);
  const category = eventCategories?.find(
    (item: any) => event?.eventCategoriesId === item.id
  );
  const { data: ticket } = useGetTicket(orderId);
  const [ticketCounts, setTicketCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToTop();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchedEvent]);

  const handleCountClick = (adjustment: number, itemName: string) => {
    setTicketCounts((prev) => {
      const currentTotal = Object.values(prev).reduce(
        (sum, count) => sum + count,
        0
      );
      const newCount = (prev[itemName] || 0) + adjustment;
      if (adjustment > 0 && currentTotal >= event.capacity) return prev;

      return {
        ...prev,
        [itemName]: Math.max(0, newCount),
      };
    });
  };

  let ticketsWithPlans = [];
  let eventPlans = [];
  eventPlans = event?.Event_Plans
    ? event?.Event_Plans
    : fetchedEvent?.Event_Plans;

  if (event?.completed) {
    ticketsWithPlans = attendees
      ?.filter(
        (ticket: any) =>
          ticket?.UserId?.toString() === session?.user?.id.toString()
      )
      ?.flatMap((ticket: any) => {
        const matchingPlan = eventPlans?.find(
          (plan: any) =>
            plan?.id?.toString() === ticket?.orderItem?.eventPlanId?.toString()
        );

        const eventTickets = ticket?.orderItem?.Event_Tickets || [];

        // Populate each ticket with EventPlan and source info
        return eventTickets.map((et: any) => ({
          ...et,
          EventPlan: matchingPlan,
          attendeeId: ticket.id,
          attendeeUser: ticket.User,
          status: ticket.status,
          fullName: ticket?.orderItem?.fullName,
          email: ticket?.orderItem?.email,
          phoneNumber: ticket?.orderItem?.phoneNumber,
        }));
      });
  }

  const handleProceed = () => {
    setTicket(ticketCounts);
    navigation.push("/dashboard/events/view-ticket");
  };

  if (status !== "success") return <SkeletonCard2 />;
  return (
    <>
      <div className="relative mx-auto pb-5 mt-[115px] sm:mt-36">
        <DashboardHeader>
          <DashboardHeaderText>View Event</DashboardHeaderText>

          <span>
            <Button
              type="button"
              onClick={() => handleShare(event)}
              className="flex max-w-[100px] w-full sm:max-w-[150px] items-center gap-[8px]"
            >
              Invite
            </Button>
          </span>
        </DashboardHeader>

        <DashboardContainerContent type={1}>
          <EventSummary
            event={{ ...event, Event_Plans: eventPlans }}
            category={category}
            guest={false}
          />

          {orderId && ticket ? (
            <div className="bg-white p-4 md:p-5 flex flex-col gap-4">
              <div>
                <h6>Event Ticket</h6>
                <p>This determines what you have access to</p>
              </div>
              <div className="relative mt-3 pt-6 pb-[50px] sm:pb-[80px] px-4 sm:px-6 border border-gray-200 rounded-lg">
                <div className="redBorder absolute top-0 left-0 bg-red-700 h-[6px] w-full"></div>
                <div className="flex flex-col gap-[10px] pt-2">
                  <Image src={Logo} alt="Logo" className="mx-auto" />

                  <div className="flex justify-between mt-3 gap-6">
                    <div className="flex flex-col gap-3">
                      <div>
                        <p>Event:</p>
                        <p className="text-black mt-[6px] font-medium">
                          {shortenText(event?.title, 15)}
                        </p>
                      </div>
                      <div>
                        <p>Reference:</p>
                        <p className="text-black mt-[6px] font-medium">
                          {ticket?.ref}
                        </p>
                      </div>
                      <div>
                        <p>Date:</p>
                        <p className="text-black mt-[6px] font-medium mb-10">
                          {formatDate(event?.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div>
                        <p>Ticket Type:</p>
                        <p className="text-black mt-[6px] font-medium">
                          {ticket?.Event_Plans?.name}{" "}
                        </p>
                      </div>
                      <div>
                        <p>Amount:</p>
                        <p className="text-red-600 mt-[6px] font-medium mb-10">
                          {ticket?.OrderItems?.Order?.settlementCurrencySymbol}{" "}
                          {ticket?.OrderItems?.Order?.settlementAmount?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  {ticket?.OrderItems?.Order?.orderStatus == "PENDING" && (
                    <div className="flex gap-2 items-center mb-16 sm:mb-10">
                      <span className="text-gray-700">
                        Payment is <b>PENDING</b>
                      </span>
                      <button
                        onClick={() =>
                          (window.location.href = `/dashboard/orders/placed-orders/${ticket?.OrderItems?.Order?.id}`)
                        }
                        className="px-4 text-sm py-1 hover:bg-black hover:text-white bg-red-700 text-white rounded-lg"
                      >
                        Pay now
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex mb-4 flex-col items-center mx-auto max-w-[110px] p-0">
                  <QRCode
                    value={ticket?.ref}
                    // value={JSON.stringify(qrData)}
                    size={128}
                    level="H" // High error correction
                  />
                  <p className="text-xs text-center">
                    Scan QR Code to validate the ticket
                  </p>
                </div>

                <Image
                  src={TicketBorder}
                  alt="TicketBorder"
                  className="absolute h-[50px] bottom-0 left-0 right-0 w-full mx-auto"
                />
              </div>
            </div>
          ) : eventPlans?.length ? (
            event?.completed ? (
              <div className="bg-white p-4 md:p-5 flex flex-col gap-4">
                <div>
                  <h6>Ticket type</h6>
                  <p>This determines what you have access to</p>
                </div>

                {ticketsWithPlans &&
                  ticketsWithPlans?.map((item: any) => (
                    <div
                      key={item.EventPlan.name}
                      className="flex justify-between items-start border rounded-lg border-gray-200 p-3 bg-white"
                    >
                      <div className="flex flex-col">
                        <div>
                          <p>Ticket type: {item.EventPlan.name} </p>
                          <span className="text-red-700 font-semibold text-lg">
                            {item.EventPlan.symbol}{" "}
                            {item.EventPlan.price.toLocaleString()}
                          </span>
                        </div>
                        <ul className="ml-6 mt-2 list-disc text-sm text-gray-500 font-[400] flex flex-col gap-2">
                          {item.EventPlan.items
                            .filter((item: string) => item.trim() !== "")
                            .map((option: string) => (
                              <li key={option}>{option}</li>
                            ))}
                        </ul>
                      </div>
                      <div className="flex items-center gap-3 mt-4">
                        <p
                          onClick={() => setOrderId(item.id)}
                          className="text-green-700 font-[500] cursor-pointer"
                        >
                          View ticket
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-white p-4 md:p-5 flex flex-col gap-4">
                <div>
                  <h6>Ticket type</h6>
                  <p>This determines what you have access to</p>
                </div>
                {event?.Event_Plans.map((item: any) => (
                  <div
                    key={item.name}
                    className="flex justify-between items-start border rounded-lg border-gray-200 p-3 bg-white"
                  >
                    <div className="flex flex-col">
                      <div>
                        <p>Ticket type: {item.name} </p>
                        <span className="text-red-700 font-semibold text-lg">
                          {item.symbol} {item.price}
                        </span>
                      </div>
                      <ul className="ml-6 mt-2 list-disc text-sm text-gray-500 font-[400] flex flex-col gap-2">
                        {item.items.map((option: string) => (
                          <li key={option}>{option}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                      <button
                        className="h-6 p-[2px] flex justify-center border hover:border-red-700 border-gray-700 items-center w-6 shrink-0 rounded-full"
                        onClick={() => handleCountClick(-1, item.name)}
                        disabled={
                          ticketCounts[item.name] >=
                          event.capacity -
                            Object.values(ticketCounts).reduce(
                              (sum, count) => sum + count,
                              0
                            )
                        }
                      >
                        <Minus className="w-[24px] h-[24px] text-gray-600" />
                      </button>
                      <h6>{ticketCounts[item.name] || 0}</h6>
                      <button
                        className="h-6 p-[2px] flex justify-center border hover:border-red-700 border-gray-700 items-center w-6 shrink-0 rounded-full"
                        onClick={() => handleCountClick(1, item.name)}
                        disabled={
                          ticketCounts[item.name] >=
                          event.capacity -
                            Object.values(ticketCounts).reduce(
                              (sum, count) => sum + count,
                              0
                            )
                        }
                      >
                        <Plus className="w-[24px] h-[24px] text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}

                <Button
                  onClick={handleProceed}
                  className="mt-5"
                  disabled={
                    event?.status === "PAST" ||
                    Object.values(ticketCounts).every((count) => count < 1) ||
                    Object.values(ticketCounts).reduce(
                      (sum, count) => sum + count,
                      0
                    ) > event.capacity
                  }
                >
                  Proceed
                </Button>
              </div>
            )
          ) : null}
        </DashboardContainerContent>
      </div>
    </>
  );
};

export default ViewEvent;
