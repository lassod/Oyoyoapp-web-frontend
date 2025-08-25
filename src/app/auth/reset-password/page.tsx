"use client";
import React, { useState } from "react";
import Background from "../../components/authBackground/Background";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios-instance";
import { ErrorProp } from "@/app/components/schema/Types";
import { AlertDialog, AlertDialogAction, ErrorModal } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

const ResetPwd = () => {
  const [active, setActive] = useState(false);
  const [email, setEmail] = useState("");
  const [errorModal, setErrorrModal] = useState(false);
  const [errorMessage, setErrorrMessage] = useState("");
  const navigation = useRouter();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post("/auth/forgot-password", data);
    },
    onError: (error: ErrorProp) => {
      setErrorrModal(true);
      setErrorrMessage(error?.response?.data?.errors[0]?.message);
      console.log("ERROR", error);
    },
    onSuccess: (response) => {
      setActive(true);
      console.log("success", response.data);
    },
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const data = {
      email: email,
    };
    mutation.mutate(data);
  };

  return (
    <section className='min-h-screen flex items-center justify-center py-[50px]'>
      <Background />
      {active ? (
        <div className='bg-white w-full max-w-[500px] rounded-[20px] px-4 sm:px-[30px] py-[50px]'>
          <p
            className='flex gap-[7px] cursor-pointer items-center text-red-700 hover:text-black'
            onClick={() => navigation.push("login")}
          >
            <ArrowLeftCircle className='h-5 w-5' />
            Back to Sign in
          </p>
          <h2 className='font-bold text-[30px] mt-5 mb-2'>Check your email</h2>
          <p>We sent a verification code to</p>
          <p className='font-semibold'>{email}</p>

          <Button className='w-full mt-5' onClick={() => navigation.push("new-password")}>
            Reset password
          </Button>
          <p className='text-sm mt-5'>
            Didn’t receive the email?{" "}
            <span className='text-red-700 font-medium cursor-pointer hover:text-black' onClick={() => setActive(false)}>
              Click to resend
            </span>
          </p>
        </div>
      ) : (
        <div className='bg-white w-full max-w-[500px] rounded-[20px] px-4 sm:px-[30px] py-[50px]'>
          <p
            className='flex gap-[7px] cursor-pointer items-center text-red-700 hover:text-black'
            onClick={() => navigation.push("login")}
          >
            <ArrowLeftCircle className='h-5 w-5' />
            Back to Sign in
          </p>
          <h2 className='font-bold text-[30px] mt-5'>Reset password</h2>
          <p className='mb-1 mt-2'>No worries, we’ll send you reset instructions.</p>

          <form onSubmit={handleSubmit}>
            <div className='sub_wrapper my-3'>
              <label htmlFor='email'>
                Email
                <Input
                  type='email'
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='email@example.com'
                  required
                />
              </label>
            </div>
            <Button className='w-full mt-8' type='submit' disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : "Send link"}
            </Button>
          </form>
        </div>
      )}
      {errorModal && (
        <AlertDialog open onOpenChange={(open) => setErrorrModal(open)}>
          <ErrorModal description={errorMessage}>
            <AlertDialogAction onClick={() => setErrorrModal(false)}>Close</AlertDialogAction>
          </ErrorModal>
        </AlertDialog>
      )}
    </section>
  );
};
// scsd
export default ResetPwd;
