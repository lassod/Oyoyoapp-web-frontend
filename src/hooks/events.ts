import React from "react";
import axiosInstance from "@/lib/axios-instance";
import { useMutation } from "@tanstack/react-query";
import { ErrorProp } from "@/app/components/schema/Types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../lib/useAxiosAuth";
import { useToast } from "@/components/ui/use-toast";
import { fetchFileFromUrl, waitForThreeSeconds } from "@/lib/auth-helper";
import { useSession } from "next-auth/react";

const queryKeys = {
  attendees: "attendees",
  email: "email",
  link: "invites",
};

export function useGetAcceptInvite(
  eventId: string,
  type: string,
  token: string
) {
  return useQuery({
    queryKey: ["/invite"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/events/${eventId}/${type}/${token}`
      );
      return res?.data?.data || res?.data;
    },
    enabled: !!token,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useGetCountries() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const previousData = queryClient.getQueryData(["countries"]);
      if (previousData) return previousData;

      const response = await fetch("/countries.json");
      const data = await response.json();

      return data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetAllEvents(filters = {}) {
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: ["events", filters],
    queryFn: async () => {
      // console.log(filters);

      const res = await axiosAuth.get("/events", {
        params: filters,
      });

      return res?.data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetEvent(eventId: any) {
  const queryKey = `/events/${eventId}`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await axiosAuth.get(`/events/${eventId}`);
      return res?.data?.data;
    },
    enabled: !!eventId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetEventAnalytics(eventId: string) {
  const id = parseInt(eventId);
  const queryClient = useQueryClient();
  const queryKey = `/events/${id}/analytics`;
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/events/${id}/analytics`);
      return res?.data?.data;
    },
    retry: 3,
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetUserEvents(filters = {}) {
  const { data: session } = useSession();
  const userId = session?.user.id;

  const queryClient = useQueryClient();
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [`/users/${userId}/events/`, filters],
    queryFn: async () => {
      const previousData = queryClient.getQueryData([
        `/users/${userId}/events/`,
        filters,
      ]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/users/${userId}/events/`, {
        params: filters,
      });

      return res?.data;
    },
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetUserEventsStats() {
  const userData = useSession();
  const userId = userData.data?.user.id;
  const queryClient = useQueryClient();
  const queryKey = `/users/${userId}/events/statistics`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/users/${userId}/events/statistics`);
      return res?.data?.data || res?.data || res;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetSpecificEvents(eventName: string) {
  const queryKey = `/events/${eventName}/`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await axiosAuth.get(`/events/${eventName}`);
      const events = res?.data?.data;
      if (Array.isArray(events)) {
        events.sort((a: any, b: any) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
      }
      return events;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetEventCustomFields(eventId: number) {
  const queryClient = useQueryClient();
  const queryKey = `/events/${eventId}/`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/events/${eventId}/custom-fields`);
      const events = res?.data?.data;
      // console.log(events?.length);
      return events;
    },
    enabled: !!eventId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetEmailInvitees(eventId: number) {
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKeys.email],
    queryFn: async () => {
      console.log(eventId);
      const res = await axiosAuth.get(
        `/events/${eventId}/access/email-invites`
      );
      console.log(res);
      const data = res?.data?.data;
      return data;
    },
    enabled: !!eventId,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useGetLinkInvitees(eventId: number) {
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKeys.link],
    queryFn: async () => {
      console.log(eventId);
      const res = await axiosAuth.get(`/events/${eventId}/access/links`);
      console.log(res);
      const data = res?.data?.data;
      return data;
    },
    enabled: !!eventId,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useGetEventAttendees(eventId: number) {
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKeys.attendees],
    queryFn: async () => {
      const res = await axiosAuth.get(`/events/${eventId}/attendees`);
      const data = res?.data?.data;
      if (Array.isArray(data)) {
        data.sort((a: any, b: any) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      }
      return data;
    },
    enabled: !!eventId,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useGetUserAttendingEvents() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const queryKey = `/users/${userId}/`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/users/${userId}/attending/`);
      const events = res?.data?.data;
      // console.log(events);
      if (Array.isArray(events)) {
        events.sort((a: any, b: any) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
      }
      return events;
    },
    enabled: !!userId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetAllEventsTypes() {
  const queryClient = useQueryClient();
  const queryKey = `/event-types`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;
      const res = await axiosAuth.get(`/event-types`);
      return res?.data?.data;
    },
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetEventType(eventTypeId: number) {
  const queryClient = useQueryClient();
  const queryKey = `/event-types/${eventTypeId}`;
  const axiosAuth = useAxiosAuth();
  // console.log("first");
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;
      1;
      const res = await axiosAuth.get(`/event-types/${eventTypeId}`);
      // console.log(res?.data?.data);
      return res?.data?.data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetEventTypesinCategory(categoryId: number) {
  const queryClient = useQueryClient();
  const queryKey = `/event-categories/${categoryId}/event-types`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;
      const res = await axiosAuth.get(
        `/event-categories/${categoryId}/event-types`
      );
      // console.log(res?.data?.data);
      return res?.data?.data;
    },
    enabled: !!categoryId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export const usePostEvents = () => {
  const [response, setResponse] = React.useState("");
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      console.log(data);
      const formData = await convertToFormData(data);
      return axiosInstance.post("/events", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onError: async (error: ErrorProp) => {
      console.log(error?.response);
      console.log(error?.response?.data?.errors[0].message);
      setResponse(error?.response?.data?.errors[0].message);
      await waitForThreeSeconds();
      if (
        error?.response?.data?.errors[0].message ===
        "Complete your profile verification before you post events"
      )
        window.location.href = "/dashboard/wallet/verification";
    },
    onSuccess: (response) => {
      console.log("success", response.data);
    },
  });

  return { mutation, response };
};

export const usePostEventViews = () => {
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return axiosInstance.post(`/events/${data.eventId}/views`, {
        guestId: data.guestId,
      });
    },
  });

  return { mutation };
};

export const useUpdateEvents = (id: number) => {
  const [response, setResponse] = React.useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // console.log(data);
      const formData = await convertToFormData(data);
      // console.log(formData);

      return axiosInstance.put(`/events/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onError: (error: ErrorProp) => {
      // console.log(error);
      setResponse(error?.response?.data?.errors[0].message);
      toast({
        variant: "destructive",
        title: "An error occured!.",
        description: error?.response?.data?.errors[0].message,
      });
    },
    onSuccess: async (response) => {
      // console.log("Success:", response.data);
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

export const usePostEmailInvite = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return axiosInstance.post(
        `/events/${data.id}/access/email-invites`,
        data
      );
    },
    onError: (error: ErrorProp) => {
      toast({
        variant: "destructive",
        title: "An error occured!.",
        description: error?.response?.data?.errors[0].message,
      });
    },
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.email] });
      toast({
        variant: "success",
        title: "Successful!.",
        description: response.data.message,
      });
    },
  });
  return mutation;
};

export const useResendEmailInvite = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return axiosInstance.post(
        `/events/${data.id}/access/email-invites/${data.inviteId}/resend`,
        data
      );
    },
    onError: (error: ErrorProp) => {
      console.log(error);
      toast({
        variant: "destructive",
        title: "An error occured!.",
        description: error?.response?.data?.errors[0].message,
      });
    },
    onSuccess: async (response) => {
      console.log(response.data);
      queryClient.invalidateQueries({ queryKey: [queryKeys.email] });

      toast({
        variant: "success",
        title: "Successful!.",
        description: response.data.message,
      });
    },
  });
  return mutation;
};

export const convertToFormData = async (data: any) => {
  const formData = new FormData();
  console.log(data);

  formData.append("title", data.title);
  formData.append("description", data.description);
  if (data.eventCategoryId)
    formData.append("eventCategoryId", data.eventCategoryId);
  formData.append("organizer", data.organizer);
  formData.append("event_types", data.event_types);
  formData.append("event_ticketing", data.event_ticketing);
  formData.append("capacity", data.capacity);
  if (Array.isArray(data.vendors))
    data.vendors.forEach((vendor: any) => formData.append("vendors", vendor));
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
  if (data.termsAndConditions)
    formData.append("termsAndConditions", data.termsAndConditions);
  formData.append("UserId", data.UserId);
  formData.append("latitude", data.latitude);
  formData.append("longitude", data.longitude);
  if (data.isSprayingEnabled)
    formData.append(
      "isSprayingEnabled",
      data.isSprayingEnabled ? "true" : "false"
    );

  if (data.custom_fields?.length > 0) {
    const hasValidFields = data.custom_fields.some(
      (field: any) =>
        field && typeof field === "object" && field.label && field.fieldType
    );
    console.log("first");
    if (hasValidFields) {
      data.custom_fields.forEach((field: any, index: number) => {
        if (field && typeof field === "object") {
          if (field.id)
            formData.append(`custom_fields[${index}][id]`, field.id);
          if (field.label)
            formData.append(`custom_fields[${index}][label]`, field.label);
          if (field.fieldType)
            formData.append(
              `custom_fields[${index}][fieldType]`,
              field.fieldType
            );
          if (field.required !== undefined)
            formData.append(
              `custom_fields[${index}][required]`,
              field.required ? "true" : "false"
            );

          if (Array.isArray(field.options) && field.options.length > 0)
            field.options.forEach((item: any, itemIndex: number) => {
              formData.append(
                `custom_fields[${index}][options][${itemIndex}]`,
                item
              );
            });
        }
      });
    } else return "No valid fields.";
  }

  if (Array.isArray(data.plans)) {
    const hasValidPlans = data.plans.some(
      (plan: any) =>
        plan &&
        typeof plan === "object" &&
        plan.name &&
        plan.price &&
        plan.description
    );

    if (hasValidPlans) {
      data.plans.forEach((plan: any, index: number) => {
        if (plan && typeof plan === "object") {
          if (plan.name) formData.append(`plans[${index}][name]`, plan.name);
          if (plan.price) formData.append(`plans[${index}][price]`, plan.price);
          if (plan.description)
            formData.append(`plans[${index}][description]`, plan.description);

          if (Array.isArray(plan.items))
            plan.items.forEach((item: any, itemIndex: number) => {
              formData.append(`plans[${index}][items][${itemIndex}]`, item);
            });
        }
      });
    } else
      return "No valid plans found with the required fields (name, price, description).";
  }

  if (data.privacy) formData.append("privacy", data.privacy);
  if (data.is24Hours)
    formData.append("is24Hours", data.is24Hours ? "true" : "false");

  return formData;
};

export const useDeleteEvent = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.delete(`/events/${data.id}`);
    },
    onError: (error: any) => {
      // console.log(error);
      toast({
        variant: "destructive",
        title: "An error occured!.",
        description: error.response.data.errors[0].message,
      });
    },
    onSuccess: async (response) => {
      // console.log("Success:", response.data);
      toast({
        variant: "success",
        title: "Successful",
        description: response.data.message,
      });
      await waitForThreeSeconds();
      window.location.href = "/dashboard/events/my-events";
    },
  });
  return { mutation };
};

export const useGenerateAccessLink = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post(`/events/${data.id}/access/generate-link`);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured!.",
        description: error.response.data.errors[0].message,
      });
    },
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.link] });
      toast({
        variant: "success",
        title: "Successful",
        description: response.data.message,
      });
    },
  });
  return mutation;
};
