"use client";
import React, { useState } from "react";
import { ServiceHeader, Steps } from "@/app/components/business/serviceData/ServiceData";
import { DashboardContainer, FormsContainer, StepsContainer } from "@/components/ui/containers";
import { useSession } from "next-auth/react";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftCircleIcon, ArrowRightCircleIcon, Loader2, XCircle } from "lucide-react";
import { formSchemaLaunch } from "@/app/components/schema/Forms";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import Hourglass from "../../../components/assets/images/hourglass.svg";
import { useGetVendorShop, usePostShopLaunch } from "@/hooks/shop";
import { useGetVendorByUserId } from "@/hooks/guest";

import { useToast } from "@/components/ui/use-toast";

const Launch = () => {
  const [isResponse, setIsResponse] = useState<any>(null);
  const router = useRouter();
  const { data: session, status } = useSession();
  const { mutation } = usePostShopLaunch();
  const { data: vendor } = useGetVendorByUserId(session?.user?.id);
  const { data: shop } = useGetVendorShop(vendor?.id);
  const { toast } = useToast();

  const launchStoreData = {
    step: "Step 5 of 5",
    title: "Launch Online Store",
    text: "You are almost ready to launch! Review all the details, make any final adjustments, and then hit the launch button. Once live, your store will be accessible to customers, and you can start making sales.",
  };

  const form = useForm<z.infer<typeof formSchemaLaunch>>({
    resolver: zodResolver(formSchemaLaunch),
  });

  const onSubmit = () => {
    if (shop)
      mutation.mutate(shop, {
        onSuccess: () => setIsResponse(true),
      });
    else
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "You don't have a shop, Please create one",
      });
  };

  if (status === "loading") return <SkeletonCard2 />;
  if (session?.user?.accountType === "PERSONAL") {
    router.back(); // Redirect user back but don't render void
    return null; // Return null to render nothing while navigating
  }
  return (
    <div>
      <div className='dashBG'></div>
      <div className='relative mx-auto'>
        <ServiceHeader />
        <FormsContainer>
          <StepsContainer>
            <Steps data={launchStoreData} />
          </StepsContainer>
          <DashboardContainer>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className='flex flex-col gap-4 py-5'>
                  <h6>Terms of Use</h6>
                  <p>
                    By accessing and using Oyoyo Events, you agree to adhere to all applicable laws and regulations and
                    to use the platform solely for its intended purpose of event planning, management, and
                    participation. Misuse of the platform for fraudulent or unauthorized activities is strictly
                    prohibited. Users are responsible for the accuracy and appropriateness of all event details,
                    layouts, and content they customize or upload. Oyoyo Events reserves the right to remove or modify
                    content that violates community standards or legal requirements.{" "}
                  </p>
                  <p>
                    Oyoyo Events acts as a facilitation platform for smooth vendor-client communication. However, the
                    platform is not liable for any disputes, miscommunications, or unsatisfactory experiences between
                    users and vendors. Oyoyo Events ensures a seamless registration process for attendees. While the
                    platform strives to create engaging experiences, users are responsible for verifying event details
                    and complying with any specific event requirements or policies.
                  </p>
                  <div className='flex flex-col gap-3 mt-6'>
                    <FormField
                      control={form.control}
                      name='terms'
                      render={({ field }) => (
                        <FormItem>
                          <div className='max-w-full flex flex-row gap-[8px] items-center'>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            <Label className='label'>
                              I accept Oyoyo’s{" "}
                              <Link href='/terms' className='text-red-600 hover:underline'>
                                terms of use
                              </Link>
                            </Label>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='sellerPolicies'
                      render={({ field }) => (
                        <FormItem>
                          <div className='max-w-full flex flex-row gap-[8px] items-center'>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            <Label className='label'>
                              I accept Oyoyo’s{" "}
                              <Link className='text-red-600 hover:underline' href='/terms'>
                                seller policies
                              </Link>
                            </Label>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='intellectualPolicies'
                      render={({ field }) => (
                        <FormItem>
                          <div className='max-w-full flex flex-row gap-[8px] items-center'>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            <Label className='label'>
                              I accept Oyoyo’s{" "}
                              <Link href='/privacy' className='text-red-600 hover:underline'>
                                intellectual property policies.
                              </Link>
                            </Label>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className='flex mt-4 w-[350px] mx-auto gap-[16px]'>
                  <Button type='button' className='mr-0' variant={"secondary"}>
                    <Link href='/dashboard/service/verification' className='flex justify-center items-center'>
                      <ArrowLeftCircleIcon className='mr-2 h-4 w-4' />
                      Back
                    </Link>
                  </Button>
                  <Button disabled={mutation.isPending} type='submit' className='ml-0'>
                    {mutation.isPending ? (
                      <Loader2 className='w-4 h-4 animate-spin' />
                    ) : (
                      <div className='flex items-center'>
                        Next
                        <ArrowRightCircleIcon className='ml-2 h-4 w-4' />
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DashboardContainer>
        </FormsContainer>
      </div>

      {isResponse && (
        <AlertDialog open onOpenChange={(open) => setIsResponse(open)}>
          <AlertDialogContent className='bg-transparent w-full max-w-[800px] shadow-none'>
            <div className='rounded-lg px-4 pb-10 sm:px-6 bg-white'>
              <div className='flex sticky top-0 pt-4 z-50 bg-white justify-end items-end'>
                <XCircle onClick={() => setIsResponse(null)} className='hover:text-red-700 cursor-pointer' />
              </div>
              <div className='flex flex-col items-center gap-[10px]'>
                <Image src={Hourglass} alt='Hourglass' className='mx-auto' />
                <h6>Verification Pending</h6>
                <p className='text-center mb-4'>
                  We have received your documents and are currently verifying your account. While your account is
                  pending verification, you will still be able to access your dashboard. However, your stores will not
                  be live until the verification process is complete which usually takes 2-3 business days.
                </p>
                <Button
                  className='flex justify-center items-center'
                  onClick={() => (window.location.href = "/dashboard/overview")}
                >
                  Go to Dashboard
                  <ArrowRightCircleIcon className='ml-2 h-4 w-4' />
                </Button>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default Launch;
