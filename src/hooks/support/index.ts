import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import useAxiosAuth from "../../lib/useAxiosAuth";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios-instance";
import { useState } from "react";
import { fetchFileFromUrl, waitForThreeSeconds } from "@/lib/auth-helper";
import { useToast } from "@/components/ui/use-toast";

export const usePostSupportTicket = () => {
  const [response, setResponse] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      console.log(data);
      const formData = await convertToFormData(data);
      console.log(formData);

      return axiosInstance.post("/support/tickets", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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
        description: "Your Ticket as been created, you'll be contancted shortly",
      });
      await waitForThreeSeconds();

      window.location.reload();
    },
  });

  return { mutation, response };
};

export const useUpdateSupportTicket = () => {
  const [response, setResponse] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      console.log(data);
      const formData = convertToFormData(data);
      console.log(formData);

      return axiosInstance.put(`/support/tickets/${data.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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
        description: "Your Ticket as been created, you'll be contancted shortly",
      });
      await waitForThreeSeconds();

      window.location.reload();
    },
  });

  return { mutation, response };
};

export const useDeleteSupportTicket = () => {
  const [response, setResponse] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (id: any) => {
      return axiosInstance.delete(`/support/tickets/${id}`);
    },
    onError: (error: any) => {
      console.log(error?.response?.data?.errors);
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
        description: "Your Ticket as been deleted",
      });
      await waitForThreeSeconds();

      window.location.reload();
    },
  });

  return { mutation, response };
};

export function useGetSupportTicket(supportId: number) {
  const queryClient = useQueryClient();
  const queryKey = `/supports/${supportId}`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;
      1;
      const res = await axiosAuth.get(`/supports/${supportId}`);
      console.log(res?.data?.data);
      return res?.data?.data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetSupportCategories() {
  const queryClient = useQueryClient();
  const queryKey = `/support/categories`;
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/support/categories`);
      console.log(res.data);
      return res?.data?.categories || [];
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetUserSupportTickets() {
  const { data: session } = useSession();
  const id = session?.user?.id;
  const queryClient = useQueryClient();
  const queryKey = `/users/${id}/support/tickets`;
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`users/${id}/support/tickets`);
      const events = res?.data?.data;
      if (Array.isArray(events)) {
        events.sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }
      const data = events.map((item: any) => {
        return { ...item, ...item.SupportCategory };
      });
      return data;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export const convertToFormData = async (data: any) => {
  const formData = new FormData();
  console.log(data);

  formData.append("subject", data.subject);
  formData.append("categoryId", data.categoryId);
  formData.append("description", data.description);
  formData.append("userId", data.userId);

  if (Array.isArray(data.images)) {
    for (const item of data.images) {
      if (typeof item === "string") {
        const file = await fetchFileFromUrl(item);
        if (file) formData.append("images", file);
      } else formData.append("images", item);
    }
  }
  return formData;
};
