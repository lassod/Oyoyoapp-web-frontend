"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import Success from "../../app/components/assets/images/success.png";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowLeftCircle,
  Check,
  LogOut,
  Trash2,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useRouter } from "next/navigation";

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed mx-auto inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed mx-auto max-h-[80vh] border-none outline-none overflow-scroll rounded-lg left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 bg-background px-6 pb-10 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-left text-muted-foreground", className)}
    {...props}
  />
));
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName;

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogAction2 = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(
      "bg-white absolute right-0 w-[30px] h-[30px] p-0 m-0 hover:bg-transparent",
      className
    )}
    {...props}
  />
));
AlertDialogAction2.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogContainer = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-lg overflow-auto relative p-4 sm:p-6 bg-background border",
      className
    )}
    {...props}
  />
);
AlertDialogContainer.displayName = "AlertDialogContainer";

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn("outline-none", className)}
    {...props}
  />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

const SuccessModal = ({
  title,
  description,
  children,
  setIsResponse,
  url,
  guest,
}: any) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    if (url) window.location.href = url;
    setIsResponse(null);
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AlertDialogContent className="bg-transparent left-[50%] top-[50%] px-4">
      <AnimatePresence>
        {showConfetti && (
          <Confetti width={window.innerWidth} height={window.innerHeight} />
        )}
      </AnimatePresence>
      <div className="div rounded-lg px-4 pb-10 sm:px-6 bg-white">
        {guest ? (
          <div
            onClick={() => router.push("/guest/events")}
            className="flex gap-2 sticky hover:text-red-700 top-0 pt-4 cursor-pointer z-50 bg-white justify-start items-start"
          >
            <ArrowLeftCircle />
            Browse more events
          </div>
        ) : (
          <div className="flex sticky top-0 pt-4 z-50 bg-white justify-end items-end">
            <XCircle
              onClick={handleClose}
              className="hover:text-red-700 cursor-pointer"
            />
          </div>
        )}
        <AlertDialogHeader className="flex items-center mt-4 w-full">
          <Image
            src={Success}
            alt="Success"
            className="h-[200px] object-cover"
          />
          <AlertDialogTitle className="text-black pt-2">
            {!title ? "Successful!" : title}
          </AlertDialogTitle>
          {description && (
            <p className="text-gray-600 text-center">{description}</p>
          )}
        </AlertDialogHeader>
        <div className="flex gap-[10px] max-w-[500px]">{children}</div>
      </div>
    </AlertDialogContent>
  );
};

const ErrorModal = ({ title, description, children }: any) => {
  return (
    <AlertDialogContent className="bg-transparent left-[50%] top-[50%] px-4">
      <div className="rounded-lg p-4 sm:px-6 py-5 bg-white">
        <AlertDialogHeader className="flex-row gap-4">
          <div className="rounded-full w-[48px] h-[48px] p-[10px] flex items-center justify-center bg-[#FFFAEB]">
            <div className="rounded-full w-[32px] h-[32px] p-[5px] flex items-center justify-center bg-yellow-100">
              <AlertTriangle className="text-red-700" />
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <div>
              <h6 className="text-left text-black pb-2 leading-[1.3]">
                {title ? title : "An error occured"}
              </h6>
              <p className="text-left text-gray-600 mb-2">{description}</p>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex mt-[10px]">
          <div className="flex gap-[10px] max-w-[500px]">{children}</div>
        </AlertDialogFooter>
      </div>
    </AlertDialogContent>
  );
};

const DeleteModal = ({ title, description, children }: any) => {
  return (
    <AlertDialogContent className="bg-transparent left-[50%] top-[50%] px-4">
      <div className="rounded-lg p-4 sm:px-6 py-5 bg-white">
        <AlertDialogHeader className="flex-row gap-4">
          <div className="rounded-full w-[48px] h-[48px] p-[10px] flex items-center justify-center bg-[#FFFAEB]">
            <div className="rounded-full w-[32px] h-[32px] p-[5px] flex items-center justify-center bg-yellow-100">
              <Trash2 className="text-red-700" />
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <div>
              <h6 className="text-left text-black pb-2 leading-[1.3]">
                {title}
              </h6>
              <p className="text-left text-gray-600 mb-2">{description}</p>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex mt-[10px]">
          <div className="flex gap-[10px] max-w-[500px]">{children}</div>
        </AlertDialogFooter>
      </div>
    </AlertDialogContent>
  );
};

const TicketSuccessModal = ({ setIsResponse, guest, event }: any) => {
  console.log(event);
  const router = useRouter();
  return (
    <AlertDialog open onOpenChange={(open) => setIsResponse(open)}>
      <SuccessModal
        title={`${guest ? "Congratulations" : "Transaction successfully"}`}
        description={`${
          guest
            ? `Receipt and ticket have been sent to the email address of the ticket owner provided during registration.`
            : "Your ticket purchase was successful"
        }`}
        setIsResponse={setIsResponse}
        url="/dashboard/events/attending"
        guest={guest}
      >
        {!guest ? (
          <AlertDialogAction
            // onClick={() =>
            //   (window.location.href = `/dashboard/orders/placed-orders/${event?.orderId}`)
            // }
            onClick={() =>
              router.push(`/dashboard/orders/placed-orders/${event?.orderId}`)
            }
            className="mt-4 w-full"
          >
            View transaction
          </AlertDialogAction>
        ) : (
          <div className="flex w-full gap-2">
            {event?.reference && (
              <AlertDialogAction
                onClick={() => router.push(`/reference/${event?.reference}`)}
                className="mt-4 w-full"
              >
                View transaction
              </AlertDialogAction>
            )}
            <AlertDialogAction
              onClick={() => {
                if (event?.inviteUrl) window.location.href = event?.inviteUrl;
                else window.location.href = `/guest/view-ticket`;
              }}
              className="mt-4 w-full"
            >
              Buy more tickets
            </AlertDialogAction>
          </div>
        )}
      </SuccessModal>
    </AlertDialog>
  );
};

interface Modal1Prop {
  title?: string;
  description: string;
  children: any;
  icon?: any;
  variant?: "Success" | "Delete" | "Logout" | "Hide" | "Reset";
}

const Modal1 = ({ title, variant, description, children }: Modal1Prop) => {
  return (
    <AlertDialogContent className="bg-transparent left-[50%] top-[50%] max-w-lg px-4">
      <AlertDialogContainer>
        <AlertDialogHeader className="flex-row gap-4">
          <div
            className={`rounded-full w-[48px] h-[48px] p-[10px] flex items-center justify-center ${
              variant === "Success" ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <div
              className={`rounded-full w-[32px] h-[32px] p-[5px] flex items-center justify-center ${
                variant === "Success" ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {variant === "Success" ? (
                <Check className="text-green-500" />
              ) : variant === "Logout" ? (
                <LogOut className="text-red-700" />
              ) : variant === "Delete" ? (
                <Trash2 className="text-red-700" />
              ) : (
                <AlertTriangle className="text-red-700" />
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <div>
              <AlertDialogTitle className="text-left pb-2">
                {title ? title : "An error occured"}
              </AlertDialogTitle>
              <AlertDialogDescription>{description}</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex mt-[20px]">
          <div className="flex gap-[10px] max-w-[500px]">{children}</div>
        </AlertDialogFooter>
      </AlertDialogContainer>
    </AlertDialogContent>
  );
};

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  ErrorModal,
  DeleteModal,
  SuccessModal,
  TicketSuccessModal,
  Modal1,
};
