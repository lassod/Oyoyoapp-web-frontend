"use client";
import React, { useEffect, useState } from "react";
import {
  EventsDetailsPage,
  Tickets,
  TimeLocationPage,
} from "@/app/components/dashboard/NewEvent";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePostEvents } from "@/hooks/events";
import {
  AlertDialog,
  AlertDialogAction,
  ErrorModal,
  SuccessModal,
} from "@/components/ui/alert-dialog";

const NewEvent = () => {
  const [currentStep, setCurrentStep] = useState(2);
  const [eventData, setEventData] = useState<any>({});
  const { data: session, status } = useSession();
  const navigation = useRouter();
  const { mutation, response } = usePostEvents();
  const [isResponse, setIsResponse] = useState(false);
  const [errorModal, setErrorModal] = useState(false);

  const handleNext = (data: any, submit = false) => {
    if (submit)
      mutation.mutate(
        { ...eventData, ...data },
        {
          onSuccess: () => setIsResponse(true),
        }
      );
    else {
      setEventData({ ...eventData, ...data });
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  const onPrev = (data: any) => {
    setEventData({ ...eventData, ...data });
    setCurrentStep((prevStep: any) => prevStep - 1);
  };

  useEffect(() => {
    if (mutation.isError) setErrorModal(true);
  }, [mutation.isError]);

  if (status === "loading") return <SkeletonCard2 />;

  if (session?.user?.accountType === "PERSONAL") {
    navigation.back();
    return null;
  }

  return (
    <>
      {currentStep === 1 && (
        <EventsDetailsPage eventData={eventData} onNext={handleNext} />
      )}
      {currentStep === 2 && (
        <TimeLocationPage
          isPending={mutation.isPending}
          eventData={eventData}
          setEventData={setEventData}
          onNext={handleNext}
          onPrev={onPrev}
        />
      )}
      {currentStep === 3 && (
        <Tickets
          eventData={eventData}
          onNext={handleNext}
          onPrev={onPrev}
          isPending={mutation.isPending}
        />
      )}

      {mutation.isError && (
        <AlertDialog open={errorModal}>
          <ErrorModal description={response}>
            <AlertDialogAction onClick={() => setErrorModal(false)}>
              Close
            </AlertDialogAction>
          </ErrorModal>
        </AlertDialog>
      )}
      {isResponse && (
        <AlertDialog open onOpenChange={(open) => setIsResponse(open)}>
          <SuccessModal
            url="/dashboard/events/my-events"
            description="Your event as been created successfully"
            setIsResponse={setIsResponse}
          />
        </AlertDialog>
      )}
    </>
  );
};

export default NewEvent;
