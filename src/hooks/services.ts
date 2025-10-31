import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import useAxiosAuth from "../lib/useAxiosAuth";
import axiosInstance from "@/lib/axios-instance";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ErrorProp } from "@/app/components/schema/Types";
import { fetchFileFromUrl } from "@/lib/auth-helper";

export const serviceKeys = {
  service: "service",
};

export function useGetService(serviceId: number) {
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [serviceKeys.service, serviceId],
    queryFn: async () => {
      const res = await axiosAuth.get(`/services/${serviceId}`);
      return res?.data?.data;
    },
    enabled: !!serviceId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetAllServices(filters = {}) {
  const queryClient = useQueryClient();
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: ["services", filters],
    queryFn: async () => {
      const previousData = queryClient.getQueryData(["services", filters]);
      if (previousData) return previousData;
      const res = await axiosAuth.get(`/services`, {
        params: filters,
      });

      return res.data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export const usePostServices = () => {
  const { toast } = useToast();
  const [response, setResponse] = useState("");
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = await convertToFormData(data);

      return axiosInstance.post("/services", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onError: (error: ErrorProp) => {
      setResponse(error?.response?.data?.errors[0].message);
    },
    onSuccess: async (response) => {
      toast({
        variant: "success",
        title: "Successful",
        description: response.data.message,
      });
    },
  });

  return { mutation, response };
};

export const useUpdateServices = (id: number) => {
  const [response, setResponse] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // Create a FormData object
      const formData = await convertToFormData(data);

      return axiosInstance.put(`/services/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onError: (error: ErrorProp) => {
      setResponse(error?.response?.data?.errors[0].message);
      toast({
        variant: "destructive",
        title: "An error occured!.",
        description: error?.response?.data?.errors[0].message,
      });
    },
    onSuccess: async (response) => {
      toast({
        variant: "success",
        title: "Successful",
        description: "Service update successful",
      });
      // await waitForThreeSeconds();
      // window.location.reload();
    },
  });

  return { mutation, response };
};

const convertToFormData = async (data: any) => {
  const formData = new FormData();

  // Append basic fields
  formData.append("tagline", data.tagline);
  formData.append("description", data.description);
  formData.append("VendorId", data.vendorId);
  formData.append("shopId", data.shopId);
  formData.append("serviceTypeId", data.serviceTypeId);
  formData.append("serviceCategoryId", data.serviceCategoryId);

  // Append media files
  if (Array.isArray(data.media)) {
    for (const item of data.media) {
      if (typeof item === "string") {
        const file = await fetchFileFromUrl(item);
        if (file) formData.append("media", file);
      } else {
        formData.append("media", item);
      }
    }
  }

  // Append plans
  if (Array.isArray(data.plans)) {
    const stringifiedPlans = JSON.stringify(data.plans);
    formData.append("plans", stringifiedPlans);
  }

  return formData;
};

export const usePostServiceReview = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post(`/services/${data.id}/reviews`, data);
    },
    onError: (error: ErrorProp) => {
      toast({
        variant: "destructive",
        title: "An error occured!.",
        description: error?.response?.data?.errors[0].message,
      });
    },
    onSuccess: async (response) => {
      toast({
        variant: "success",
        title: "Successful",
        description: response.data.message,
      });
    },
  });

  return { mutation };
};

export function useGetServiceReview(serviceId: number) {
  const queryClient = useQueryClient();
  const queryKey = `/services/${serviceId}/ratings`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;
      1;
      const res = await axiosAuth.get(`/services/${serviceId}/ratings`);
      return res?.data?.data;
    },
    enabled: !!serviceId, // Ensure this only runs when vendorId is available
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}
