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

  console.log(id);
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
  console.log("first");
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/tickets/${id}`);
      const events = res?.data?.data;
      console.log(res?.data);
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
      console.log(res?.data.data);
      if (Array.isArray(events)) {
        events.sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }
      console.log(events);
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
      console.log(data);
      setEventId(data?.eventId);
      return axiosInstance.post("/orders/ticket", data);
    },
    onError: async (error: any) => {
      console.log(error.response);
      setResponse(error?.response?.data?.errors[0].message);
      if (eventId && error?.response?.data?.errors[0].message === "You have already registered for this event")
        window.location.href = `/dashboard/orders/placed-orders`;
    },
    onSuccess: async (response) => {
      console.log("success", response.data);
    },
  });

  return { mutation, response };
};

export const useValidateTickets = () => {
  const { toast } = useToast();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      console.log(data);
      return axiosAuth.post(`/events/${data.EventId}/validate-ticket`, data);
    },
    onError: (error: ErrorProp) => {
      console.log(error);
      toast({
        variant: "destructive",
        title: "An error occured!.",
        description: error?.response?.data?.errors[0].message,
      });
    },
    onSuccess: async (response, variable) => {
      console.log(variable);
      queryClient.invalidateQueries({
        queryKey: [queryKeys.stats, variable.EventId],
      }),
        console.log("Success:", response.data);
      // toast({
      //   variant: "success",
      //   title: "Message",
      //   description: response.data.message,
      // });
    },
  });

  return mutation;
};

export const useVerifyTickets = () => {
  const axiosAuth = useAxiosAuth();
  const { toast } = useToast();
  const mutation = useMutation({
    mutationFn: (data: any) => {
      console.log(data);
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
      console.log(err);
      toast({
        variant: "destructive",
        title: "An error occured!.",
        description: err?.response?.data?.errors[0].message,
      });
    },
  });

  return mutation;
};
