"use client";
import { Button } from "@/components/ui/button";
import {
  Dashboard,
  DashboardHeader,
  DashboardHeaderText,
} from "@/components/ui/containers";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import { useGetEvent } from "@/hooks/events";
import Logo from "../../../../../components/assets/images/Oyoyo.svg";
import React, { useEffect, useState } from "react";
import { useValidateTickets, useVerifyTickets } from "@/hooks/tickets";
import Image from "next/image";
import { formatDate, formatTime, shortenText } from "@/lib/auth-helper";
import { useGetUserById } from "@/hooks/user";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const Ticket = ({ params }: any) => {
  const { id, ref } = params;
  const mutation = useValidateTickets();
  const verifyTickets = useVerifyTickets();
  const { data: event, status: eventStatus } = useGetEvent(id);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  const router = useRouter();

  console.log(event);
  const ticketWithMatchingRef = event?.Event_Tickets?.find((ticket: any) => {
    const matchingTicket = ticket.ref === ref;
    const matchingPlan = event?.Event_Plans?.find(
      (plan: any) => plan.id === ticket.EventPlanId
    );

    if (matchingTicket && matchingPlan) {
      console.log({ ...ticket, EventPlan: matchingPlan });
      return true; // Explicitly return true for find to consider this as a match
    }

    return false; // Return false for non-matching tickets
  });

  // Now, you can combine the ticket with its EventPlan after find
  if (ticketWithMatchingRef) {
    ticketWithMatchingRef.EventPlan = event?.Event_Plans?.find(
      (plan: any) => plan.id === ticketWithMatchingRef.EventPlanId
    );
  }

  useEffect(() => {
    // Only set loading or error after the event data is fetched
    if (eventStatus === "success") {
      if (ticketWithMatchingRef) {
        setLoading(false); // Data found, stop loading
        setError(false); // No error since the ticket was found
      } else {
        setLoading(false); // Data fetched but no ticket found, stop loading
        setError(true); // Error because no matching ticket was found
      }
    }
  }, [eventStatus, ticketWithMatchingRef]);

  const handleVerify = () => {
    verifyTickets.mutate(
      {
        EventId: id,
        ticketRef: ref,
      },
      {
        onSuccess: (res) => {
          console.log(res);
          setTicket(res);
        },
      }
    );
  };

  const handleValidate = () => {
    mutation.mutate({
      EventId: id,
      ticketRef: ref,
    });
  };

  console.log(ticketWithMatchingRef);

  if (loading) return <SkeletonCard2 />;

  return (
    <Dashboard className="relative bg-white mx-auto mt-10">
      <DashboardHeader>
        <DashboardHeaderText>View transaction</DashboardHeaderText>

        <span className="flex w-[109px] gap-[10px]">
          <Button className="flex justify-center items-center gap-[8px]">
            Invite
          </Button>
        </span>
      </DashboardHeader>

      <div className="flex flex-col gap-4 mt-10">
        <h3>Ticket Information</h3>
        <div className="max-w-[500px] mt-10 w-full mx-auto">
          <div className="relative pt-6 pb-[10px] px-6 border border-gray-200 rounded-lg">
            <div className="redBorder absolute top-0 left-0 bg-red-700 h-[6px] w-full"></div>
            <div className="flex flex-col gap-[10px] pt-2 pb-6">
              <Image src={Logo} alt="Logo" className="mx-auto" />

              {error ? (
                <p className="mt-14 text-center">
                  No Ticket Found with reference:{" "}
                  <b className="text-black">{ref}</b>
                </p>
              ) : (
                <>
                  <div>
                    <div>
                      <p>Event:</p>
                      <p className="text-black font-medium">
                        {event && shortenText(event?.title, 19)}
                      </p>
                    </div>
                    <div className="flex justify-between gap-6">
                      <div className="flex flex-col gap-3 pt-5">
                        <div>
                          <p>Ticket Ref:</p>
                          <p className="text-red-700 font-medium">
                            {ticketWithMatchingRef?.ref?.toUpperCase()}
                          </p>
                        </div>
                        {/* <div>
                        <p>Phone Number:</p>
                        <p className="text-black font-medium">{user?.phone}</p>
                      </div> */}
                        <div>
                          <p>Ticket Type:</p>
                          <p className="text-black font-medium">
                            {ticketWithMatchingRef?.EventPlan?.name}
                          </p>
                        </div>
                        <div>
                          <p>Time:</p>
                          <p className="text-black font-medium">
                            {formatTime(ticketWithMatchingRef?.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 pt-5">
                        {/* <div>
                        <p>Name:</p>
                        <p className="text-black font-medium">
                          {user?.first_name} {user?.last_name || user?.username}
                        </p>
                      </div> */}

                        <div>
                          <p>Date:</p>
                          <p className="text-black font-medium">
                            {formatDate(ticketWithMatchingRef?.createdAt)}
                          </p>
                        </div>

                        {/* <div>
                        <p>Email:</p>
                        <p className="text-black font-medium">
                          {userStatus === "success" &&
                            shortenText(user?.email, 19)}
                        </p>
                      </div> */}
                      </div>
                    </div>
                  </div>
                  <Button
                    className="max-w-[350px] mx-auto w-full mt-10"
                    onClick={handleValidate}
                  >
                    {mutation.isPending ? <Loader2 /> : "Approve Ticket"}
                  </Button>
                  <Button
                    className="max-w-[350px] w-full  mx-auto"
                    variant={"secondary"}
                    onClick={() =>
                      router.push(
                        `/dashboard/check-in/event/validation?id=${event?.id}`
                      )
                    }
                  >
                    Decline
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  );
};

export default Ticket;
