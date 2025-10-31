import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios-instance";
import { useState } from "react";
import { ErrorProp } from "@/app/components/schema/Types";
import { useToast } from "@/components/ui/use-toast";
import { signIn } from "next-auth/react";

export const usePostSignup = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (signupData: any) => {
      if (signupData.personal) return axiosInstance.post("/auth/signup/personal", signupData);
      else return axiosInstance.post("/auth/signup/business", signupData);
    },
    onError: (error: ErrorProp) => {
      toast({
        variant: "destructive",
        title: "An error occurred.",
        description: error?.response?.data?.errors[0].message,
      });
    },
    onSuccess: async (response, variables) => {
      await signIn("credentials", {
        redirect: false,
        email: variables.email,
        password: variables.password,
      });
      toast({
        variant: "success",
        title: "Successful!",
        description: "Thank you for creating an account, proceed to verify your account",
      });
      window.location.href = `/auth/${true}/${variables.email}`;
    },
  });

  return { mutation };
};

export const usePostLogin = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post(`/auth/login`, data);
    },
    onError: async (error: ErrorProp) => {
      toast({
        variant: "destructive",
        title: "An erorr occurred",
        description: error?.response?.data?.errors[0].message,
      });
    },
    onSuccess: async () => {
      toast({
        variant: "success",
        title: "Successful",
        description: "Welcome to Oyoyo Events web app.",
      });
    },
  });

  return mutation;
};

export const usePostVerifyOtp = () => {
  const [response, setResponse] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: { verification_code: number }) => {
      return axiosInstance.post("/auth/verifyOtp", data);
    },
    onError: (error: ErrorProp) => {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: error?.response?.data?.errors[0]?.message,
      });
      setResponse(error?.response?.data?.errors[0]?.message);
    },
    onSuccess: () => (window.location.href = `/auth/login`),
  });

  return { mutation, response };
};

export const usePostGenerateOtp = () => {
  const [response, setResponse] = useState("");
  const [email, setEmail] = useState("");

  const mutation = useMutation({
    mutationFn: (data: { email: string }) => {
      setEmail(data.email);
      return axiosInstance.post("/auth/generateOtp", data);
    },
    onError: (error: ErrorProp) => {
      setResponse(error?.response?.data?.errors[0].message);
    },
    onSuccess: (response) => {
      window.location.href = `/auth/${true}/${email}`;
    },
  });

  return { mutation, response };
};

export const useResetPassword = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post(`/auth/reset-password/${data.token}`, {
        token: parseInt(data.token),
        password: parseInt(data.password),
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured!.",
        description: error.response.data.errors[0].message,
      });
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Successful",
        description: response.data.message,
      });
    },
  });
  return { mutation };
};

export const useForgotPassword = () => {
  const { toast } = useToast();
  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post("/auth/forgot-password", data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured!.",
        description: "Please try again",
      });
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Successful",
        description: `Verification code has been sent to ${response.data.data.email}`,
      });
    },
  });
  return { mutation };
};
