"use client";
import { Button } from "@/components/ui/button";
import {
  Dashboard,
  DashboardHeader,
  DashboardHeaderText,
} from "@/components/ui/containers";
import Logo from "../../../../../components/assets/images/Oyoyo.svg";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useValidateTickets, useVerifyTickets } from "@/hooks/tickets";
import Image from "next/image";
import { formatDate, formatTime, shortenText } from "@/lib/auth-helper";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const Ticket = ({ params }: any) => {
  const { id, ref } = params;
  const mutation = useValidateTickets();
  const verifyTickets = useVerifyTickets();
  const [ticket, setTicket] = useState<any>(null);
  const router = useRouter();

  console.log(ticket);
  const handleVerify = useCallback(() => {
    verifyTickets.mutate(
      { EventId: id, ticketRef: ref },
      {
        onSuccess: (res) => {
          console.log(res);
          setTicket(res?.data);
        },
      }
    );
  }, [verifyTickets, id, ref]);

  // Keeps track of the last route key we verified, to avoid double calls
  const firedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!id || !ref) return;
    const key = `${id}:${ref}`;

    // if we've already fired for this (id, ref), do nothing
    if (firedKeyRef.current === key) return;

    firedKeyRef.current = key; // mark as fired for this key
    handleVerify(); // 🔥 call it once
  }, [id, ref, handleVerify]);

  const handleValidate = () => {
    mutation.mutate({
      EventId: id,
      ticketRef: ref,
    });
  };

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

              <div>
                <Image
                  src={ticket?.data?.avatar || "/noavatar.png"}
                  alt="Event"
                  width={500}
                  height={300}
                  className="h-[100px] mb-4 max-w-[100px] object-cover rounded-full shadow-lg"
                />
                <div>
                  <p>Event:</p>
                  <p className="text-black font-medium">
                    {shortenText(ticket?.data?.Events?.title, 19)}
                  </p>
                </div>
                <div className="flex justify-between gap-6">
                  <div className="flex flex-col gap-3 pt-5">
                    <div>
                      <p>Ticket Ref:</p>
                      <p className="text-red-700 font-medium">
                        {ticket?.data?.ref?.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p>Phone Number:</p>
                      <p className="text-black font-medium">
                        {ticket?.data?.Users?.phone}
                      </p>
                    </div>
                    <div>
                      <p>Ticket Type:</p>
                      <p className="text-black font-medium">
                        {ticket?.data?.Event_Plans?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 pt-5">
                    <div>
                      <p>Name:</p>
                      <p className="text-black font-medium">
                        {ticket?.data?.Users?.first_name}{" "}
                        {ticket?.data?.Users?.last_name ||
                          ticket?.data?.Users?.username}
                      </p>
                    </div>

                    <div>
                      <p>Date:</p>
                      <p className="text-black font-medium">
                        {formatDate(ticket?.data?.Events?.createdAt)},{" "}
                        {formatTime(ticket?.data?.Events?.createdAt)}
                      </p>
                    </div>

                    <div>
                      <p>Email:</p>
                      <p className="text-black font-medium">
                        {shortenText(ticket?.data?.Users?.email, 19)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                disabled={ticket?.data?.isUsed}
                className="max-w-[350px] mx-auto w-full mt-10"
                onClick={handleValidate}
              >
                {mutation.isPending ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  "Approve Ticket"
                )}
              </Button>
              <Button
                className="max-w-[350px] w-full  mx-auto"
                variant={"secondary"}
                onClick={() =>
                  router.push(
                    `/dashboard/check-in/event/validation?id=${ticket?.data?.EventId}`
                  )
                }
              >
                Decline
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  );
};

export default Ticket;
