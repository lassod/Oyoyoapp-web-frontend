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
import { Loader2, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

type LabelValueItem = {
  label: string;
  value?: React.ReactNode;
  /** If true, blank values render as "--" instead of "—" */
  isFee?: boolean;
};

const FallbackText = ({
  value,
  isFee,
}: {
  value?: React.ReactNode;
  isFee?: boolean;
}) => {
  const isBlank =
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "");
  if (isBlank) return <>{isFee ? "--" : "—"}</>;
  return <>{value}</>;
};

const FieldRow = ({ item }: { item: LabelValueItem }) => (
  <div>
    <p>{item.label}</p>
    <p className="text-black font-medium">
      <FallbackText value={item.value} isFee={item.isFee} />
    </p>
  </div>
);

const Ticket = ({ params }: any) => {
  const { id, ref } = params;
  const mutation = useValidateTickets();
  const verifyTickets = useVerifyTickets();
  const [ticket, setTicket] = useState<any>(null);
  const router = useRouter();

  // createdAt: '2025-08-28T18:41:09.457Z',
  // updatedAt: '2025-08-28T19:39:16.129Z',
  // dateOfUsage: '2025-08-28T19:39:16.128Z',

  // createdAt: '2025-08-28T18:41:09.457Z',
  // updatedAt: '2025-08-28T19:39:16.129Z',
  // dateOfUsage: '2025-08-28T19:39:16.128Z',
  console.log(ticket);
  // Verify once per (id, ref)
  const firedKeyRef = useRef<string | null>(null);
  const handleVerify = useCallback(() => {
    verifyTickets.mutate(
      { EventId: id, ticketRef: ref },
      {
        onSuccess: (res) => {
          setTicket(res?.data);
        },
      }
    );
  }, [verifyTickets, id, ref]);

  useEffect(() => {
    if (!id || !ref) return;
    const key = `${id}:${ref}`;
    if (firedKeyRef.current === key) return;
    firedKeyRef.current = key;
    handleVerify();
  }, [id, ref, handleVerify]);

  const handleValidate = () => {
    mutation.mutate({
      EventId: id,
      ticketRef: ref,
    });
  };

  // Safe data handle (works if API returns {data:{...}} or just {...})
  const eventTitle = shortenText(ticket?.data?.Events?.title, 19);
  const eventDateTime = ticket?.data?.Events?.createdAt
    ? `${formatDate(ticket?.data?.Events.createdAt)}, ${formatTime(
        ticket?.data?.Events.createdAt
      )}`
    : "—";
  const ticketRefUpper = ticket?.data?.ref
    ? String(ticket?.data?.ref).toUpperCase()
    : "";
  const fullName = [
    ticket?.Users?.first_name,
    ticket?.data?.Users?.last_name ?? ticket?.data?.Users?.username,
  ]
    .filter(Boolean)
    .join(" ");

  // Map-configured fields (DRY)
  const leftCol: LabelValueItem[] = [
    { label: "Ticket Ref:", value: ticketRefUpper },
    { label: "Phone Number:", value: ticket?.data?.Users?.phone },
    { label: "Ticket Type:", value: ticket?.data?.Event_Plans?.name },
    // {
    //   label: "Ticket Fee:",
    //   value: ticket?.data?.Event_Plans?.fee ?? ticket?.data?.fee,
    //   isFee: true,
    // },
  ];

  const rightCol: LabelValueItem[] = [
    { label: "Name:", value: fullName },
    { label: "Date:", value: eventDateTime },
    { label: "Email:", value: shortenText(ticket?.data?.Users?.email, 19) },
  ];

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
            <div className="redBorder absolute top-0 left-0 bg-red-700 h-[6px] w-full" />

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
                    <FallbackText value={eventTitle} />
                  </p>
                </div>

                <div className="flex justify-between gap-6">
                  <div className="flex flex-col gap-3 pt-5">
                    {leftCol.map((item) => (
                      <FieldRow key={item.label} item={item} />
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 pt-5">
                    {rightCol.map((item) => (
                      <FieldRow key={item.label} item={item} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-8">
                <Button
                  // disabled={!!ticket?.data?.isUsed || mutation.isPending}
                  className="max-w-[350px] mx-auto w-full"
                  onClick={handleValidate}
                >
                  {mutation.isPending ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    "Approve Ticket"
                  )}
                </Button>

                <Button
                  className="max-w-[350px] w-full mx-auto"
                  variant="secondary"
                  onClick={() =>
                    router.push(
                      `/dashboard/check-in/event/validation?id=${
                        ticket?.data?.EventId ?? id
                      }`
                    )
                  }
                >
                  Decline
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  );
};

export default Ticket;
