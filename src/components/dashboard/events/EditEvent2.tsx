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
import { useGetEvent, useUpdateEvents } from "@/hooks/events";
import {
  AlertDialog,
  AlertDialogAction,
  ErrorModal,
  SuccessModal,
} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";

const EditEvent2 = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [eventData, setEventData] = useState<any>({});
  const { data: session, status } = useSession();
  const navigation = useRouter();
  
  // Get event ID from URL parameters
  const searchParams = new URLSearchParams(window.location.search);
  const eventId = searchParams.get("id");

  const { data: event, status: eventStatus } = useGetEvent(eventId);
  const { mutation, response } = useUpdateEvents(eventId);
  const [isResponse, setIsResponse] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  
  // Check if event has sold tickets (paid events)
  const hasSoldTickets = event?.Event_Plans?.some((plan: any) => 
    plan.price > 0 && plan.soldCount > 0
  );

  // Prefill event data when event is loaded
  useEffect(() => {
    if (event && eventStatus === "success") {
      const regularPlan = event.Event_Plans?.find((plan: any) => plan.name === "Regular") || {};
      const vipPlan = event.Event_Plans?.find((plan: any) => plan.name === "VIP") || {};
      const executivePlan = event.Event_Plans?.find((plan: any) => plan.name === "Executive") || {};

      setEventData({
        title: event.title || "",
        date: new Date(event.date),
        externalLink: event.externalLink || "",
        endTime: new Date(event.endTime),
        regularPrice: regularPlan.price || 0,
        vipPrice: vipPlan.price || 0,
        executivePrice: executivePlan.price || 0,
        country: event.country,
        state: event.state,
        address: event.address === "undefined" ? "Virtual" : event.address,
        capacity: event.capacity,
        event_types: event.event_types,
        description: event.description || "",
        event_ticketing: event.event_ticketing || "",
        latitude: event.latitude || 0,
        longitude: event.longitude || 0,
        UserId: event.UserId,
        media: event.media || [],
        custom_fields: event.Event_Custom_Fields || [],
        termsAndConditions: event.termsAndConditions || "",
        eventLocationType: event.eventLocationType,
        privacy: event.privacy,
        eventCategoriesId: event.eventCategoriesId,
      });
    }
  }, [event, eventStatus]);

  const handleNext = (data: any, submit = false) => {
    if (submit) {
      mutation.mutate(
        { ...eventData, ...data },
        {
          onSuccess: () => {
            navigation.push(`/dashboard/events/view?id=${eventId}`);
          },
        }
      );
    } else {
      setEventData({ ...eventData, ...data });
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };
  
  const handleSaveExit = () => {
    const currentFormData = getCurrentStepData();
    mutation.mutate(
      { ...eventData, ...currentFormData },
      {
        onSuccess: () => {
          navigation.push(`/dashboard/events/view?id=${eventId}`);
        },
      }
    );
  };
  
  const getCurrentStepData = () => {
    // Return current step form data - this would need to be implemented
    // based on which step the user is currently on
    return {};
  };

  const onPrev = (data: any) => {
    setEventData({ ...eventData, ...data });
    setCurrentStep((prevStep: any) => prevStep - 1);
  };

  useEffect(() => {
    if (mutation.isError) setErrorModal(true);
  }, [mutation.isError]);

  if (status === "loading" || eventStatus === "pending") return <SkeletonCard2 />;

  if (!eventId) {
    navigation.push("/dashboard/events/my-events");
    return null;
  }

  if (session?.user?.accountType === "PERSONAL") {
    navigation.back();
    return null;
  }

  return (
    <>
      {currentStep === 1 && (
        <EventsDetailsPage 
          eventData={eventData} 
          onNext={handleNext} 
          isEdit={true}
          onSaveExit={handleSaveExit}
        />
      )}
      {currentStep === 2 && (
        <TimeLocationPage
          isPending={mutation.isPending}
          eventData={eventData}
          setEventData={setEventData}
          onNext={handleNext}
          onPrev={onPrev}
          isEdit={true}
          onSaveExit={handleSaveExit}
        />
      )}
      {currentStep === 3 && !hasSoldTickets && (
        <Tickets
          eventData={eventData}
          onNext={handleNext}
          onPrev={onPrev}
          isPending={mutation.isPending}
          isEdit={true}
          onSaveExit={handleSaveExit}
        />
      )}
      {currentStep === 3 && hasSoldTickets && (
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-4">Cannot Edit Tickets</h3>
          <p className="text-gray-600 mb-4">
            This event has sold tickets and ticket information cannot be modified.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => setCurrentStep(2)} variant="secondary">
              Back
            </Button>
            <Button onClick={() => handleNext({}, true)}>
              Save Event
            </Button>
          </div>
        </div>
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

    </>
  );
};

export default EditEvent2;