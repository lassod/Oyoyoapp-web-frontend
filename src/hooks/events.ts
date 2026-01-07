import React from "react";
import axiosInstance from "@/lib/axios-instance";
import { useMutation } from "@tanstack/react-query";
import { ErrorProp } from "@/app/components/schema/Types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../lib/useAxiosAuth";
import { useToast } from "@/components/ui/use-toast";
import { fetchFileFromUrl, waitForThreeSeconds } from "@/lib/auth-helper";
import { useSession } from "next-auth/react";
import { TransactionFees } from "./wallet";
import { User } from "./user";

export const eventKeys = {
  attendees: "attendees",
  leaderboard: "leaderboard",
  email: "email",
  tickets: "tickets",
  link: "invites",
};

const queryKeys = {
  root: ["events"] as const,
  all: () => [...queryKeys.root, "all"] as const,
  guest: (currency?: string) =>
    [...queryKeys.root, "guest", currency || "_guest"] as const,
  // promotions: () => [...queryKeys.root, "promotions"] as const,
};

export function useGetAllEvents(
  filters: {
    isActive?: boolean;
  } = {}
) {
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: queryKeys.all(),
    queryFn: async () => {
      const res = await axiosAuth.get<{ data: Event[] }>("/events", {
        params: { pageSize: 700 },
      });

      return res?.data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetAllGuestEvent(currency: string) {
  return useQuery({
    queryKey: queryKeys.guest(currency),
    queryFn: async () => {
      const res = await axiosInstance.get<{ data: Event[] }>("/guest/events", {
        params: { currency, pageSize: 700 },
      });

      return res?.data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

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

export function useGetEventLeaderboard(eventId: any) {
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [eventKeys.leaderboard, eventId],
    queryFn: async () => {
      const res = await axiosAuth.get(
        `/events/${eventId}/spraying/leaderboard`
      );
      return res?.data?.data;
    },
    enabled: !!eventId,
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
      const res = await axiosAuth.get(`/events/${eventName}`, {
        params: { pageSize: 1000 },
      });
      const events = res?.data?.data;
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
    queryKey: [eventKeys.email],
    queryFn: async () => {
      const res = await axiosAuth.get(
        `/events/${eventId}/access/email-invites`
      );
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
    queryKey: [eventKeys.link],
    queryFn: async () => {
      const res = await axiosAuth.get(`/events/${eventId}/access/links`);
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
    queryKey: [eventKeys.attendees, eventId],
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
    retry: 3,
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
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;
      1;
      const res = await axiosAuth.get(`/event-types/${eventTypeId}`);
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
      const formData = await convertToFormData(data);
      return axiosInstance.post("/events", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onError: async (error: ErrorProp) => {
      setResponse(error?.response?.data?.errors[0].message);
      await waitForThreeSeconds();
      if (
        error?.response?.data?.errors[0].message ===
        "Complete your profile verification before you post events"
      )
        window.location.href = "/dashboard/wallet/verification";
    },
    onSuccess: (response) => {},
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

export const useUpdateEvents = (id: number | string | null) => {
  const [response, setResponse] = React.useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = await convertToFormData(data);

      return axiosInstance.put(`/events/${id}`, formData, {
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
      queryClient.invalidateQueries({ queryKey: [eventKeys.email] });
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
      toast({
        variant: "destructive",
        title: "An error occured!.",
        description: error?.response?.data?.errors[0].message,
      });
    },
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: [eventKeys.email] });

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
      queryClient.invalidateQueries({ queryKey: [eventKeys.link] });
      toast({
        variant: "success",
        title: "Successful",
        description: response.data.message,
      });
    },
  });
  return mutation;
};

//For live event stream
export function useGetEventStream(eventId: string | number) {
  const queryClient = useQueryClient();
  const axiosAuth = useAxiosAuth(); // this is what you use everywhere else

  return useQuery({
    queryKey: ["event-stream", eventId],
    queryFn: async () => {
      // Optional: return cached data immediately if exists
      const cached = queryClient.getQueryData<any>(["event-stream", eventId]);
      if (cached) return cached;

      try {
        const res = await axiosAuth.get(`/events/${eventId}/stream`);

        // Successful response with active stream
        if (res?.data?.data?.playbackUrl) {
          return res.data;
        }

        // Stream exists in DB but not live yet, or no playbackUrl → treat as "no stream"
        return null;
      } catch (error: any) {
        // 404 or any error = no stream available right now
        if (error.response?.status === 404 || error.response?.status === 401) {
          return null;
        }
        throw error; // let react-query handle real errors
      }
    },
    enabled: !!eventId,
    refetchInterval: 30_000, // check every 30 seconds (stream might go live)
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 10_000,
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

export type EventStatus = "PAST" | "UPCOMING" | "ONGOING" | "RECENT";
export type EventPrivacy = "Public" | "Private";
export type EventTicketing = "Free" | "Paid";
export type EventLocationType = "Physical" | "Virtual";
export type FrequencyType = "NEVER" | "DAILY" | "WEEKLY" | "MONTHLY";

export interface CountMeta {
  views?: number;
  Event_Attendees?: number;
  followers?: number;
  following?: number;
}

export interface EventPlan {
  id: number;
  name: string;
  price: number;
  currency: string;
  symbol: string;
  status: "Active" | "Inactive";
  EventId: number;
  description: string;
  items: string[];
  ticketCap: number | null;
  createdAt: string;
  updatedAt: string;
  transactionFees: TransactionFees;
  remainingTickets: number | null;
  totalTickets: number | null;
  isAvailable: boolean;
}

export interface EventType {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  eventCategoriesId: number;
}

export interface EventCustomField {
  id: number;
  EventId: number;
  label: string;
  fieldType: "text" | "checkbox" | "radio" | "select";
  options: string[];
  required: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventTicket {
  id: number;
  EventId: number;
  EventPlanId: number;
  ref: string;
  status: "Active" | "Reserved" | "Used";
  isUsed: boolean;
  allowsMultipleEntries: boolean;
  usedDates: string[];
  createdAt: string;
  updatedAt: string;
  orderItemId: number;
}

export interface AttendeeCustomField {
  label: string;
  fieldType: "text" | "checkbox";
  response?: string | string[];
}

export interface EventAttendee {
  id: number;
  status: "Going" | "Not Going";
  UserId: number | null;
  custom_fields: AttendeeCustomField[];
  createdAt: string;
  updatedAt: string;
  EventId: number;
  orderItemId: number;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  organizer: string;
  country: string;
  state: string;
  address: string;
  media: string[];

  date: string;
  end: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;

  status: EventStatus;
  privacy: EventPrivacy;
  event_ticketing: EventTicketing;
  eventLocationType: EventLocationType;
  frequency: FrequencyType;

  capacity: number;
  duration: number;
  isAllDay: boolean;
  is24hours: boolean;
  isRecurring: boolean;
  isActive: boolean;

  latitude: number | null;
  longitude: number | null;
  location_name: string | null;

  popularityScore: number;
  likeCount: number;
  viewCount: number;

  UserId: number;
  externalLink: string | null;

  isSprayingEnabled: boolean;
  isStreamingEnabled: boolean;
  streamAccessType: string | null;
  termsAndConditions: string | null;

  Event_Plans: EventPlan[];
  Event_Types: EventType;
  Event_Custom_Fields: EventCustomField[];
  Event_Tickets: EventTicket[];
  Event_Attendees: EventAttendee[];

  User: User;

  _count: CountMeta;

  isCreator: boolean;
  isFollowingCreator: boolean;
}
