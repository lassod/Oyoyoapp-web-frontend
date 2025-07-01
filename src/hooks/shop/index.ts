import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import useAxiosAuth from "../../lib/useAxiosAuth";
import axiosInstance from "@/lib/axios-instance";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const usePostShop = () => {
  const [response, setResponse] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = await convertToFormData(data);
      return axiosInstance.post("/shops/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onError: (error: any) => {
      console.log(error?.response?.data);
      setResponse(
        error?.response?.data?.errors[0].message === "Something went wrong, please try again"
          ? "Shop username cannot have space"
          : error?.response?.data?.errors[0].message
      );
    },
    onSuccess: async (response) => {
      console.log("success", response.data);
      toast({
        variant: "success",
        title: "Successful",
        description: "Your Shop as been created",
      });
    },
  });

  return { mutation, response };
};

export const useUpdateShop = () => {
  const [response, setResponse] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      console.log(data);
      return axiosInstance.put(`/shops/${data.id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onError: (error: any) => {
      console.log(error);
      toast({
        variant: "destructive",
        title: "An error occured",
        description: error?.response?.data?.errors[0].message,
      });
      setResponse(error?.response?.data?.errors[0].message);
    },
    onSuccess: async (response) => {
      console.log("success", response.data);
      toast({
        variant: "success",
        title: "Successful",
        description: "Your shop details as been updated",
      });
    },
  });

  return { mutation, response };
};

export const useDeleteShop = () => {
  const [response, setResponse] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      console.log(data);
      return axiosInstance.delete(`/shops/${data.id}`, data);
    },
    onError: (error: any) => {
      console.log(error);
      setResponse(error?.response?.data?.errors[0].message);
    },
    onSuccess: async (response) => {
      console.log("success", response.data);
      toast({
        variant: "success",
        title: "Successful",
        description: response.data.message,
      });
      window.location.reload();
    },
  });

  return { mutation, response };
};

export const usePostShopLaunch = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      console.log(data);
      return axiosInstance.post(`/shops/${data.id}/launch`, data);
    },
    onError: (error: any) => {
      console.log(error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: error?.response?.data?.errors[0].message,
      });
    },
  });

  return { mutation };
};

export function useGetVendorShop(vendorId: number) {
  const queryClient = useQueryClient();
  const queryKey = `/vendors/${vendorId}/shop`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;
      const res = await axiosAuth.get(`/vendors/${vendorId}/shop`);
      console.log(res?.data);
      return res?.data?.data;
    },
    enabled: !!vendorId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetShop(id: number) {
  const queryClient = useQueryClient();
  const queryKey = `/shops/${id}`;
  const axiosAuth = useAxiosAuth();
  console.log(id);
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;
      const res = await axiosAuth.get(`/shops/${id}`);
      console.log(res?.data);
      return res?.data?.data;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetShops() {
  const queryClient = useQueryClient();
  const queryKey = `/shops`;
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/shops`);
      return res?.data?.data || [];
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

const convertToFormData = async (data: any) => {
  const formData = new FormData();
  console.log(data);

  formData.append("name", data.name);
  formData.append("username", data.username);
  formData.append("description", data.description);
  formData.append("country", data.country);
  formData.append("vendorId", data.vendorId);
  formData.append("currency", data.currency);
  formData.append("image", data.image);

  return formData;
};
