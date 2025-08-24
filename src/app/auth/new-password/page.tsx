"use client";
import React, { useState } from "react";
import Background from "../../components/authBackground/Background";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios-instance";
import { ErrorProp } from "@/app/components/schema/Types";
import {
  AlertDialog,
  AlertDialogAction,
  SuccessModal,
  ErrorModal,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { formResetPassword } from "@/app/components/schema/Forms";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const Password = () => {
  const [hide, setHide] = useState(true);
  const [hide2, setHide2] = useState(true);
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorrMessage] = useState("");
  const navigation = useRouter();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      console.log(data);
      return axiosInstance.post(`/auth/reset-password/${data.token}`, data);
    },
    onError: (error: ErrorProp) => {
      setErrorModal(true);
      setErrorrMessage(error?.response?.data?.errors[0]?.message);
      console.log("ERROR", error.response);
    },
    onSuccess: (response) => {
      setSuccessModal(true);
      console.log("success", response.data);
    },
  });

  const form = useForm<z.infer<typeof formResetPassword>>({
    resolver: zodResolver(formResetPassword),
  });

  const onSubmit = (values: z.infer<typeof formResetPassword>) => {
    if (values.password !== values.confirmPassword) {
      setErrorModal(true);
      setErrorrMessage("Passwords do not match!");
      return;
    }
    const data = {
      password: values.password,
      token: parseInt(values.token),
    };
    mutation.mutate(data);
  };

  return (
    <section className="min-h-screen flex items-center justify-center py-[50px]">
      <Background />

      <div className="bg-white w-full max-w-[500px] rounded-[20px] px-4 sm:px-[30px] py-[50px]">
        <p
          className="flex mb-3 gap-[7px] cursor-pointer items-center text-red-700 hover:text-black"
          onClick={() => navigation.push("login")}
        >
          <ArrowLeftCircle className="h-5 w-5" />
          Back to Sign in
        </p>
        <h2 className="font-bold text-[30px] mt-5">Set new password</h2>
        <p className="mb-2">
          Your new password must be different to previously used passwords.
        </p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col mt-3 gap-4"
          >
            <FormField
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative top-1">
                    Verification code
                  </FormLabel>
                  <Input
                    type="text"
                    placeholder="Enter verification code"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative top-1">Password</FormLabel>
                  <div className="relative flex justify-between w-full">
                    <Input
                      type={`${hide ? "password" : "text"}`}
                      placeholder="Choose password (Ex. 1234)"
                      {...field}
                    />
                    {hide ? (
                      <EyeOff
                        className="absolute right-3 text-gray-600 top-2 bg-white pl-1"
                        onClick={() => setHide(!hide)}
                      />
                    ) : (
                      <Eye
                        className="absolute right-3 text-gray-600 top-2 bg-white pl-1"
                        onClick={() => setHide(!hide)}
                      />
                    )}
                  </div>
                  <FormMessage className="top-1" />
                </FormItem>
              )}
            />
            <FormField
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="relative top-1">
                    Comfirm password
                  </FormLabel>
                  <div className="relative flex justify-between w-full">
                    <Input
                      type={`${hide2 ? "password" : "text"}`}
                      placeholder="Repeat password"
                      {...field}
                    />
                    {hide2 ? (
                      <EyeOff
                        className="absolute right-3 text-gray-600 top-2 bg-white pl-1"
                        onClick={() => setHide2(!hide2)}
                      />
                    ) : (
                      <Eye
                        className="absolute right-3 text-gray-600 top-2 bg-white pl-1"
                        onClick={() => setHide2(!hide2)}
                      />
                    )}
                  </div>
                  <FormMessage className="top-1" />
                </FormItem>
              )}
            />
            <Button
              className="w-full mt-5"
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Reset password"
              )}
            </Button>
          </form>
        </Form>
      </div>
      {successModal && (
        <AlertDialog open onOpenChange={(open) => setSuccessModal(open)}>
          <SuccessModal
            setIsResponse={setSuccessModal}
            title="Password Updated Successfully!"
            description="Your password as successfully been updated"
          >
            <AlertDialogAction
              className="mt-4 mx-auto"
              onClick={() => navigation.push("login")}
            >
              Close
            </AlertDialogAction>
          </SuccessModal>
        </AlertDialog>
      )}
      {errorModal && (
        <AlertDialog open onOpenChange={(open) => setErrorModal(open)}>
          <ErrorModal description={errorMessage}>
            <AlertDialogAction onClick={() => setErrorModal(false)}>
              Close
            </AlertDialogAction>
          </ErrorModal>
        </AlertDialog>
      )}
    </section>
  );
};

export default Password;
