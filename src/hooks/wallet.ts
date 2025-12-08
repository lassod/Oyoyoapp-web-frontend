import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios-instance";
import { useToast } from "@/components/ui/use-toast";
import useAxiosAuth from "../lib/useAxiosAuth";
import axios from "axios";
import { notificationKeys } from "./notification";
import { useSession } from "next-auth/react";
import { sprayKeys } from "./spray";

const walletKeys = {
  onboardings: "onboardings",
  withdrawals: "withdrawals",
};

export function useGetOnboardingStatus() {
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [walletKeys.onboardings],
    queryFn: async () => {
      const res = await axiosAuth.get(`/onboarding/status`);
      return res?.data?.data || res?.data || res;
    },
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetAllWithdrawals(filters = {}) {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [walletKeys.withdrawals],
    queryFn: async () => {
      const res = await axiosAuth.get(`/users/${session?.user?.id}/payouts`, {
        params: filters,
      });
      return res?.data;
    },
    enabled: !!session?.user?.id,
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetBanks() {
  const queryClient = useQueryClient();
  const queryKey = `/bank`;
  return useQuery({
    queryKey: ["/bank"],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axios.get(`https://api.paystack.co/bank`);
      return res?.data?.data || res?.data || res;
    },
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export const usePostOnboarding = () => {
  const { toast } = useToast();

  const axiosAuth = useAxiosAuth();
  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosAuth.post(`/onboarding/`, data);
    },
    onError: (error: any) => {
      // toast({
      //   variant: "destructive",
      //   title: "An error occurred!.",
      //   description: error.response.data.errors[0].message,
      // });
    },
  });

  return { mutation };
};

export const usePostKycType = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post(`/kyc/document-type/`, data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occurred!.",
        description: error.response.data.errors[0].message,
      });
    },
    onSuccess: async (response) => {},
  });

  return { mutation };
};

export const usePostKycFront = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post(`/kyc/document-front/`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occurred!.",
        description: error.response.data.errors[0].message,
      });
    },
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: [walletKeys.onboardings] }),
        queryClient.invalidateQueries({
          queryKey: [notificationKeys.all],
        }),
        toast({
          variant: "success",
          title: "Successful",
          description: "Document has been Uploaded",
        });
    },
  });

  return { mutation };
};

export const usePostKycSelfie = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post(`/kyc/selfie/`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onError: (error: any) => {
      if (
        error.response.data.errors[0].message ===
        "Invalid action. You have already completed this step. Current step: SELFIE_UPLOAD"
      )
        toast({
          variant: "success",
          title: "Success",
          description: "You image as been succesfully captured",
        });
      else
        toast({
          variant: "destructive",
          title: "An error occurred!.",
          description: error.response.data.errors[0].message,
        });
    },
    onSuccess: async () =>
      queryClient.invalidateQueries({
        queryKey: [notificationKeys.all],
      }),
  });

  return mutation;
};

export const usePostKycSubmit = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post(`/kyc/submit/`);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occurred!.",
        description: error.response.data.errors[0].message,
      });
    },
  });

  return { mutation };
};

export const usePostWithdrawal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post(`/payouts`, data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occurred!.",
        description: error.response.data.errors[0].message,
      });
    },
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: [walletKeys.withdrawals] }),
        queryClient.invalidateQueries({ queryKey: [sprayKeys.balance] }),
        toast({
          variant: "success",
          title: "Successful",
          description: response.data.message,
        });
    },
  });

  return { mutation };
};
