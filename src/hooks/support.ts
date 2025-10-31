import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import useAxiosAuth from "../lib/useAxiosAuth";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios-instance";
import { useState } from "react";
import { fetchFileFromUrl, waitForThreeSeconds } from "@/lib/auth-helper";
import { useToast } from "@/components/ui/use-toast";

const queryKeys = {
  categories: "categories",
  supports: "supports",
  support: "support",
};

export const usePostSupportTicket = () => {
  const queryClient = useQueryClient();
  const [response, setResponse] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = await convertToFormData(data);

      return axiosInstance.post("/support/tickets", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onError: (error: any) => {
      setResponse(error?.response?.data?.errors[0].message);
    },
    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.supports] }),
        toast({
          variant: "success",
          title: "Successful",
          description: "Your Support ticket has been created, you'll be contacted shortly",
        });
    },
  });

  return { mutation, response };
};

export const useUpdateSupportTicket = () => {
  const queryClient = useQueryClient();
  const [response, setResponse] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      // const formData = convertToFormData(data);

      return axiosInstance.put(`/support/tickets/1`, data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured",
        description: error?.response?.data?.errors[0].message,
      });
    },
    onSuccess: async (response, variable) => {
      toast({
        variant: "success",
        title: "Successful",
        description: "Your Support ticket has been created, you'll be contacted shortly",
      });
    },
  });

  return { mutation, response };
};

export const useDeleteSupportTicket = () => {
  const queryClient = useQueryClient();
  const [response, setResponse] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (id: any) => {
      return axiosInstance.delete(`/support/tickets/${id}`);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured",
        description: error?.response?.data?.errors[0].message,
      });
      setResponse(error?.response?.data?.errors[0].message);
    },
    onSuccess: async (response) => {
      toast({
        variant: "success",
        title: "Successful",
        description: "Your Ticket as been deleted",
      });
    },
  });

  return { mutation, response };
};

export function useGetSupportTicket(id: number) {
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKeys.support, id],
    queryFn: async () => {
      const res = await axiosAuth.get(`/supports/${id}`);
      return res?.data?.data;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetSupportCategories() {
  const queryClient = useQueryClient();
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: [queryKeys.categories],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKeys.categories]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/support/categories`);
      return res?.data?.categories || [];
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetUserSupportTickets() {
  const { data: session } = useSession();
  const id = session?.user?.id;
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: [queryKeys.supports],
    queryFn: async () => {
      const res = await axiosAuth.get(`users/${id}/support/tickets`);
      return res?.data?.data;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export const convertToFormData = async (data: any) => {
  const formData = new FormData();

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
