import React from "react";
import axiosInstance from "@/lib/axios-instance";
import { useMutation } from "@tanstack/react-query";
import { ErrorProp } from "@/app/components/schema/Types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { fetchFileFromUrl, waitForThreeSeconds } from "@/lib/auth-helper";

export const queryKeys = {
  streamComment: "streamComment",
  reactions: "eventReaction",
};

export function useGetAllGuestEvent(filters: any) {
  return useQuery({
    queryKey: ["/guest/events", filters],
    queryFn: async () => {
      const res = await axiosInstance.get("/guest/events", {
        params: filters,
      });

      return res?.data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetGuestEvent(eventId: any, filters: any) {
  const queryKey = `/events/${eventId}`;
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await axiosInstance.get(`/events/${eventId}`, {
        params: filters,
      });
      return res?.data?.data;
    },
    enabled: !!eventId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetTransactionByReference(reference: any) {
  const queryClient = useQueryClient();
  const queryKey = `/transactions/reference/${reference}`;
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData([queryKey]);
      if (previousData) return previousData;
      const res = await axiosInstance.get(`/transactions/reference/${reference}`);
      return res?.data?.data;
    },
    enabled: !!reference,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetSpecificGuestEvent(eventName: string, filters: any) {
  const queryKey = [`/guest/events/${eventName}`, filters.currency]; // Add currency to the query key
  return useQuery({
    queryKey,
    queryFn: async () => {
      const res = await axiosInstance.get(`/guest/events/${eventName}`, {
        // params: filters,
        params: { ...filters, pageSize: 100 },
      });
      return res?.data?.data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetGuestEventCategories() {
  const queryClient = useQueryClient();
  const queryKey = `/guest/event-categories`;
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosInstance.get(`/guest/event-categories/`);
      return res?.data?.data;
    },
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetVendorByUserId(userId: any) {
  const queryClient = useQueryClient();
  const queryKey = `/guest/users/${userId}/vendor`;
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosInstance.get(`/guest/users/${userId}/vendor`);
      return res?.data?.data || res?.data || res;
    },
    enabled: !!userId,
    // retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetEventComments(eventId: number) {
  const queryKey = `guest/events/comments/event/${eventId}`;
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await axiosInstance.get(`/events/comments/event/${eventId}`);
      const events = res?.data?.data;
      if (Array.isArray(events)) {
        events.sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }
      return events;
    },
    enabled: !!eventId,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useGetStreamEventComments(eventId: number) {
  return useQuery({
    queryKey: [queryKeys.streamComment],
    queryFn: async () => {
      const res = await axiosInstance.get(`/events/${eventId}/stream-comments`);
      const events = res?.data?.data;
      if (Array.isArray(events)) {
        events.sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }
      return events;
    },
    enabled: !!eventId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetStreamEventReactions(eventId: number) {
  return useQuery({
    queryKey: [queryKeys.reactions, eventId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/events/${eventId}/stream-reactions`);
      const events = res?.data?.data;
      return events;
    },
    enabled: !!eventId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export const usePostGuestEvent = () => {
  const [response, setResponse] = React.useState("");
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // Create a FormData object
      const formData = await convertToFormData(data);

      return axiosInstance.post("/guestEvent", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onError: async (error: ErrorProp) => {
      setResponse(error?.response?.data?.errors[0].message);
      await waitForThreeSeconds();
      if (error?.response?.data?.errors[0].message === "Complete your profile verification before you post guestEvent")
        window.location.href = "/dashboard/wallet/verification";
    },
    onSuccess: (response) => {},
  });

  return { mutation, response };
};

export const useUpdateGuestEvent = (id: number) => {
  const [response, setResponse] = React.useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = await convertToFormData(data);

      return axiosInstance.put(`/guestEvent/${id}`, formData, {
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
        title: "Successful!.",
        description: "Event update successful",
      });
      window.location.reload();
    },
  });

  return { mutation, response };
};

export const convertToFormData = async (data: any) => {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("description", data.description);
  if (data.eventCategoryId) formData.append("eventCategoryId", data.eventCategoryId);
  formData.append("organizer", data.organizer);
  formData.append("event_types", data.event_types);
  formData.append("event_ticketing", data.event_ticketing);
  formData.append("capacity", data.capacity);
  if (Array.isArray(data.vendors)) data.vendors.forEach((vendor: any) => formData.append("vendors", vendor));
  if (Array.isArray(data.media)) {
    for (const item of data.media) {
      if (typeof item === "string") {
        const file = await fetchFileFromUrl(item);
        if (file) formData.append("media", file);
      } else formData.append("media", item);
    }
  }

  formData.append("date", data.date);
  formData.append("endTime", data.endTime);
  formData.append("state", data.state);
  formData.append("country", data.country);
  formData.append("address", data.address);
  if (data.externalLink) formData.append("externalLink", data.externalLink);
  if (data.frequency) formData.append("frequency", data.frequency);
  // if (Array.isArray(data.customDates))
  //   data.customDates.forEach((customDate: string) =>
  //     formData.append("[customDates]", customDate)
  //   );

  formData.append("UserId", data.UserId);
  formData.append("latitude", data.latitude);
  formData.append("longitude", data.longitude);

  if (Array.isArray(data.custom_fields))
    data.custom_fields.forEach((item: string, index: number) => {
      formData.append(`custom_fields.[${index}][label]`, item);
      formData.append(`custom_fields.[${index}][fieldType]`, item);
    });

  // First check if any plans have the required fields
  if (Array.isArray(data.plans)) {
    const hasValidPlans = data.plans.some(
      (plan: any) => plan && typeof plan === "object" && plan.name && plan.price && plan.description
    );

    if (hasValidPlans) {
      data.plans.forEach((plan: any, index: number) => {
        // Check if plan is valid before accessing its properties
        if (plan && typeof plan === "object") {
          // Append each property to formData only if they exist
          if (plan.name) formData.append(`plans[${index}][name]`, plan.name);
          if (plan.price) formData.append(`plans[${index}][price]`, plan.price);
          if (plan.description) formData.append(`plans[${index}][description]`, plan.description);

          if (Array.isArray(plan.items))
            plan.items.forEach((item: any, itemIndex: number) => {
              formData.append(`plans[${index}][items][${itemIndex}]`, item);
            });
        }
      });
    } else return "No valid plans found with the required fields (name, price, description).";
  }

  // for (const [key, value] of formData.entries()) {
  // }
  return formData;
};

export const useDeleteEvent = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.delete(`/guestEvent/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured!.",
        description: error.response.data.errors[0].message,
      });
    },
    onSuccess: async (response) => {
      toast({
        variant: "success",
        title: "Successful",
        description: response.data.message,
      });
      await waitForThreeSeconds();
      window.location.href = "/dashboard/guestEvent/my-guestEvent";
    },
  });
  return { mutation };
};
