import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import useAxiosAuth from "../lib/useAxiosAuth";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios-instance";
import { useState } from "react";
import { waitForThreeSeconds } from "@/lib/auth-helper";
import { useToast } from "@/components/ui/use-toast";

export function useGetAiEvent(eventId: number) {
  const queryKey = `/events/${eventId}/prompt`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await axiosAuth.get(`/events/${eventId}/prompt`);
      return res?.data?.data;
    },
    enabled: !!eventId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export const usePostAiEvent = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post(`/events/${data.id}/prompt`, data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured",
        description: error?.response?.data?.errors[0].message,
      });
    },
    onSuccess: async (response) => {
      toast({
        variant: "success",
        title: "Successful",
        description: "Event Planner has been created Successfully",
      });
      await waitForThreeSeconds();
    },
  });

  return { mutation };
};

export const usePostTask = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post(`/tasks`, data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured",
        description: error?.response?.data?.errors[0].message,
      });
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Successful",
        description: response.data.message,
      });
    },
  });

  return { mutation };
};

export const usePostTaskVendor = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post(`/tasks/${data.taskId}/vendor`, data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured",
        description: error?.response?.data?.errors[0].message,
      });
    },
    onSuccess: async (response) => {
      toast({
        variant: "success",
        title: "Successful",
        description: response.data.message,
      });
      await waitForThreeSeconds();

      window.location.reload();
    },
  });

  return { mutation };
};

export const usePostTaskNote = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post(`/tasks/${data.taskId}/add-note`, data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured",
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

export const useUpdateTaskNote = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.put(`/tasks/${data.taskId}/notes/${data.noteId}`, data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured",
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

export const useDeleteTaskNote = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.delete(`/tasks/${data.taskId}/notes/${data.noteId}`, data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured",
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

export const useUpdateTask = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.put(`/tasks/${data.taskId}`, data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured",
        description: error?.response?.data?.errors[0].message,
      });
    },
    onSuccess: async (response) => {
      toast({
        variant: "success",
        title: "Successful",
        description: response.data.message,
      });
      // await waitForThreeSeconds();

      // window.location.reload();
    },
  });

  return { mutation };
};

export const useDeleteTask = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.delete(`/tasks/${data.taskId}`, data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured",
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

export const useUpdateAiEvent = () => {
  const [response, setResponse] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.put(`/support/tickets/${data.id}`, data);
    },
    onError: (error: any) => {
      setResponse(error?.response?.data?.errors[0].message);
    },
    onSuccess: async (response) => {
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

export const useDeleteAiEvent = () => {
  const [response, setResponse] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.delete(`support/tickets/${data.id}`);
    },
    onError: (error: any) => {
      setResponse(error?.response?.data?.errors[0].message);
    },
    onSuccess: async (response) => {
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
      return res?.data?.categories || [];
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetUserAiEvents() {
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
      return events;
    },
    enabled: !!id,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
