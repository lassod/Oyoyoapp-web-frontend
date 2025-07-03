import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios-instance";
import { waitForThreeSeconds } from "@/lib/auth-helper";
import { useToast } from "@/components/ui/use-toast";
import useAxiosAuth from "../../lib/useAxiosAuth";
import axios from "axios";
import { notificationKeys } from "../notification";

const onboardingKeys = {
  onboardings: "onboardings",
};

export function useGetOnboardingStatus() {
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [onboardingKeys.onboardings],
    queryFn: async () => {
      const res = await axiosAuth.get(`/onboarding/status`);
      return res?.data?.data || res?.data || res;
    },
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetPayout() {
  const queryClient = useQueryClient();
  const queryKey = `/users/payouts`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/users/payouts`);
      console.log(res.data);
      return res?.data?.data || res?.data || res;
    },
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

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post(`/onboarding/`, data);
    },
    onError: (error: any) => {
      console.log(error.response.data);
      toast({
        variant: "destructive",
        title: "An error occurred!.",
        description: error.response.data.errors[0].message,
      });
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
      console.log(error.response.data);
      toast({
        variant: "destructive",
        title: "An error occurred!.",
        description: error.response.data.errors[0].message,
      });
    },
    onSuccess: async (response) => {
      console.log("success", response.data);
    },
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
      console.log(error.response.data);
      toast({
        variant: "destructive",
        title: "An error occurred!.",
        description: error.response.data.errors[0].message,
      });
    },
    onSuccess: async (response) => {
      console.log("success", response.data);
      queryClient.invalidateQueries({ queryKey: [onboardingKeys.onboardings] }),
        queryClient.invalidateQueries({ queryKey: [notificationKeys.notifications] }),
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
      console.log(error.response.data);
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
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: [notificationKeys.notifications] }),
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
      console.log(error.response.data);
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
  const { toast } = useToast();
  console.log("first");
  const mutation = useMutation({
    mutationFn: (data: any) => {
      console.log("first");
      console.log(data);
      return axiosInstance.post(`/payouts`, data);
    },
    onError: (error: any) => {
      console.log(error.response);
      toast({
        variant: "destructive",
        title: "An error occurred!.",
        description: error.response.data.errors[0].message,
      });
    },
    onSuccess: async (response) => {
      console.log("success", response.data);
      toast({
        variant: "success",
        title: "Successful",
        description: response.data.message,
      });
      await waitForThreeSeconds();

      window.location.href = "/dashboard/wallet/payouts";
    },
  });

  return { mutation };
};
