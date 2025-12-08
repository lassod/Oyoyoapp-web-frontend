"use client";

import { CircleCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useGetOnboardingStatus, usePostOnboarding } from "@/hooks/wallet";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { ApprovedBlock } from "./VerifyKyc";

type Props = {
  cta?: string; // button label (default: "Complete Stripe Verification")
};

export default function StripeKyc({ cta = "Complete Stripe Verification" }: Props) {
  const { mutation } = usePostOnboarding();
  const { toast } = useToast();
  const [onboardCompleted, setOnboardCompleted] = useState(false);
  const [isModal, setIsModal] = useState<any>(null);
  const { data: onboardStatus } = useGetOnboardingStatus();

  useEffect(() => {
    if (onboardStatus) if (onboardStatus.onboardingStatus?.STRIPE) setOnboardCompleted(true);
  }, [onboardStatus]);

  const handleStripe = () => {
    mutation.mutate(
      { onboardingType: "STRIPE", platform: "web" },
      {
        onSuccess: (response: any) => {
          toast({
            variant: "success",
            title: "Redirecting…",
            description: response?.data?.message || "Proceed to Stripe",
          });
          if (response?.data?.url) window.location.href = response.data.url;
        },
      }
    );
  };

  return (
    <div className='flex flex-col gap-4 mt-10 mx-auto max-w-[480px]'>
      <h5 className='text-xl font-semibold'>Stripe Verification</h5>
      <p className='text-sm text-muted-foreground'>Verify your identity to withdraw your funds.</p>

      {onboardCompleted ? (
        <ApprovedBlock />
      ) : (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type='button' className='ml-0'>
              {cta}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className='left-[50%] top-[50%]'>
            <AlertDialogHeader className='flex-row gap-4'>
              <div className='h-10 w-10 flex items-center justify-center rounded-full mt-2 bg-[#EDFDF4]'>
                <CircleCheck className='text-green-500' />
              </div>
              <div className='flex flex-col gap-2 w-full'>
                <h6 className='text-left'>Stripe Verification</h6>
                <p className='text-left text-sm text-muted-foreground'>
                  You’ll be redirected to stripe.com to complete your verification.
                </p>
              </div>
            </AlertDialogHeader>

            <div className='flex justify-end mt-2'>
              <div className='flex max-w-[260px] gap-2'>
                <AlertDialogCancel asChild>
                  <Button variant='secondary'>Close</Button>
                </AlertDialogCancel>
                <Button onClick={handleStripe} className='ml-0 w-[116px]' disabled={mutation.isPending}>
                  {mutation.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : "Continue"}
                </Button>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
