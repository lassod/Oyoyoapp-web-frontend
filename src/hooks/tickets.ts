import axiosInstance from "@/lib/axios-instance";
import { useMutation } from "@tanstack/react-query";
import { ErrorProp } from "@/app/components/schema/Types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../lib/useAxiosAuth";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const queryKeys = {
  stats: "stats",
};

export function useGetTicketStats(id: any) {
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: [queryKeys.stats, id],
    queryFn: async () => {
      const res = await axiosAuth.get(`/events/${id}/ticket-summary`);
      return res?.data?.data;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetTicket(id: number) {
  const queryClient = useQueryClient();
  const queryKey = `/tickets/${id}`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/tickets/${id}`);
      const events = res?.data?.data;
      return events;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetUserTickets(id: number) {
  const queryClient = useQueryClient();
  const queryKey = `/events/${id}/ticket-activities`;
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/events/${id}/ticket-activities`);
      const events = res?.data?.data;
      if (Array.isArray(events)) {
        events.sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }
      return events;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export const usePostTickets = () => {
  const [response, setResponse] = useState("");
  const [eventId, setEventId] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      setEventId(data?.eventId);
      return axiosInstance.post("/orders/ticket", data);
    },
    onError: async (error: any) => {
      setResponse(error?.response?.data?.errors[0].message);
      if (eventId && error?.response?.data?.errors[0].message === "You have already registered for this event")
        window.location.href = `/dashboard/orders/placed-orders`;
    },
    onSuccess: async (response) => {},
  });

  return { mutation, response };
};

export const useValidateTickets = () => {
  const { toast } = useToast();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosAuth.post(`/events/${data.EventId}/validate-ticket`, data);
    },
    onError: (error: ErrorProp) => {
      toast({
        variant: "destructive",
        title: "An error occured!.",
        description: error?.response?.data?.errors[0].message,
      });
    },
    onSuccess: async (response, variable) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.stats, variable.EventId],
      });
    },
  });

  return mutation;
};

export const useVerifyTickets = () => {
  const axiosAuth = useAxiosAuth();
  const { toast } = useToast();
  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosAuth.post(`/tickets/verify`, data);
    },

    onSuccess: (res) => {
      toast({
        variant: "success",
        title: "Message",
        description: res.data.message,
      });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: "An error occured!.",
        description: err?.response?.data?.errors[0].message,
      });
    },
  });

  return mutation;
};
