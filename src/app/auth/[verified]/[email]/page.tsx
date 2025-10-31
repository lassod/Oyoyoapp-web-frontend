"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Arrow from "../../../components/assets/images/arrow-left.svg";
import Background from "../../../components/authBackground/Background";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, ErrorModal } from "@/components/ui/alert-dialog";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { formSignUpVerification } from "@/app/components/schema/Forms";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftCircle, Loader2 } from "lucide-react";
import { usePostGenerateOtp, usePostVerifyOtp } from "@/hooks/auth";
import { useRouter } from "next/navigation";

const Verification = ({ params }: { params: { email: string; verified: string } }) => {
  const { email, verified } = params;
  const [errorModal, setErrorModal] = useState(false);
  const navigation = useRouter();
  const { mutation: generate, response: generateRes } = usePostGenerateOtp();
  const { mutation: verify, response: verifyRes } = usePostVerifyOtp();

  const form = useForm<z.infer<typeof formSignUpVerification>>({
    resolver: zodResolver(formSignUpVerification),
  });

  const onSubmit = (values: z.infer<typeof formSignUpVerification>) => {
    const data = {
      verification_code: parseInt(values.verification_code),
    };
    verify.mutate(data);
  };

  const handleGenerateOtp = () => {
    const data = {
      email: decodeURIComponent(email),
    };
    generate.mutate(data);
  };

  return (
    <section className='min-h-screen flex items-center justify-center py-[50px]'>
      <Background />
      {verified === "true" ? (
        <div className='bg-white w-full max-w-[500px] rounded-[20px] px-4 sm:px-[30px] py-[50px]'>
          <div
            className='flex text-sm sm:text-[15px] gap-[7px] cursor-pointer items-center text-red-700 hover:text-black'
            onClick={() => navigation.push("/auth/login")}
          >
            <ArrowLeftCircle className='h-5 w-5' />
            Back to Sign in
          </div>
          <h2 className='font-bold text-[30px] mt-5'>OTP Verification</h2>
          <p className='mb-1 mt-2'>Please enter the 4-digit One-Time Password sent to {decodeURIComponent(email)}</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='grid justify-center items-center '>
              <FormField
                control={form.control}
                name='verification_code'
                render={({ field }) => (
                  <FormItem className='pb-5 flex flex-col items-center gap-2 mt-2'>
                    <FormLabel>One-Time Password</FormLabel>
                    <InputOTP pattern={REGEXP_ONLY_DIGITS} maxLength={4} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button className='w-full' type='submit' disabled={verify.isPending}>
                {verify.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : "Submit"}
              </Button>
            </form>
          </Form>
        </div>
      ) : (
        <div className='bg-white space-y-2 w-full max-w-[500px] rounded-[20px] px-4 sm:px-[30px] py-[50px]'>
          <div
            className='flex text-sm sm:text-[15px] gap-[7px] cursor-pointer items-center text-red-700 hover:text-black'
            onClick={() => navigation.push("/auth/login")}
          >
            <ArrowLeftCircle className='h-5 w-5' />
            Back to Sign in
          </div>
          <h2>Verify your Account!</h2>
          <p>
            The acount registered with <b>{decodeURIComponent(email)}</b> as not been verified
          </p>
          <Button className='w-full' onClick={handleGenerateOtp} type='button'>
            Verify now
          </Button>
        </div>
      )}
      {errorModal && (
        <AlertDialog open onOpenChange={(open) => setErrorModal(open)}>
          <ErrorModal description={verifyRes || generateRes}>
            <AlertDialogAction onClick={() => setErrorModal(false)}>Close</AlertDialogAction>
          </ErrorModal>
        </AlertDialog>
      )}
    </section>
  );
};

export default Verification;
