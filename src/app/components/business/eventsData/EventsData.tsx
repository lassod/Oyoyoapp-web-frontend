"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import { DashboardHeader, DashboardHeaderText } from "@/components/ui/containers";
import { StepsProp } from "@/app/components/schema/Types";
import { Loader2 } from "lucide-react";
import { useDeleteEvent } from "@/hooks/events";

export const EventHeader = () => {
  return (
    <DashboardHeader>
      <DashboardHeaderText>Create event</DashboardHeaderText>
      {/* <Button variant={"secondary"} className='m-0'>
        <Link href='/dashboard/events'>Save & Exit</Link>
      </Button> */}
    </DashboardHeader>
  );
};

export const Steps = ({ data }: StepsProp) => {
  return (
    <div className='w-full md:max-w-[438px] xl:max-w-[538px] lg:pr-9 flex flex-col gap-4 justify-center md:fixed'>
      <h3 className='font-semibold mb-5 md:mb-10'>{data.step}</h3>
      <h1 className='text-black text-[22px] md:text-[34px]'>{data.title}</h1>
      <p className='leading-6'>{data.text} </p>
    </div>
  );
};

export const DeleteEvent = ({ id }: any) => {
  const { mutation } = useDeleteEvent();
  return (
    <div>
      <div className='flex mb-4 mt-5 justify-between items-center'>
        <h6>Delete Event</h6>
        <AlertDialogCancel>
          <XCircle className='hover:text-red-600' />
        </AlertDialogCancel>
      </div>

      <p>By choosing delete, this event will be permanently deleted from the platform.</p>
      <Button
        variant={"destructive"}
        onClick={() =>
          mutation.mutate({
            id,
          })
        }
        className='w-full mt-4'
      >
        {mutation.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : "Delete"}
      </Button>
    </div>
  );
};
