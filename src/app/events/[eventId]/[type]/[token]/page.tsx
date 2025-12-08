"use client";
import { AlertDialog, Modal1 } from "@/components/ui/alert-dialog";
import { SkeletonCard1 } from "@/components/ui/skeleton";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGetAcceptInvite } from "@/hooks/events";
import { usePathname, useRouter } from "next/navigation";
import { Dashboard } from "@/components/ui/containers";
import Download from "@/app/components/oyoyoLandingPage/download/Download";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import ViewEvent from "@/components/dashboard/events/guest/ViewEvent";

const AcceptInvite = ({ params }: any) => {
  const { eventId, type, token } = params;
  const { data: invite, error, isFetching, status } = useGetAcceptInvite(eventId, type, token);
  const [isError, setIsError] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [, setTicket] = useState<any>(null);
  const router = useRouter();
  const inviteUrl = usePathname();

  useEffect(() => {
    if (status !== "success" && !isFetching) setIsError(true);
    else if (invite?.event?.id) setEvent(invite.event);
  }, [status, invite]);

  if (isFetching || !event)
    return (
      <Dashboard>
        <SkeletonCard1 />
      </Dashboard>
    );

  return (
    <>
      {isError ? (
        <AlertDialog open={isError} onOpenChange={setIsError}>
          <Modal1 description='Access link has expired'>
            <Button className='w-fit' onClick={() => router.push("/guest/events")}>
              Back to home
            </Button>
          </Modal1>
        </AlertDialog>
      ) : (
        <>
          <Header guest={true} />
          <ViewEvent event={{ ...event, inviteUrl }} setEvent={setEvent} setTicket={setTicket} name='invite' />
          <Download className='top-0 md:top-0' />
          <Footer className='top-[50px] md:top-[100px]' />
        </>
      )}
    </>
  );
};

export default AcceptInvite;
