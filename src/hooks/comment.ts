import axiosInstance from "@/lib/axios-instance";
import { useMutation } from "@tanstack/react-query";
import { ErrorProp } from "@/app/components/schema/Types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../lib/useAxiosAuth";
import { useToast } from "@/components/ui/use-toast";
import { queryKeys } from "./guest";

const commentKeys = {
  reactions: "eventReaction",
};

export function useGetReactions(id: number) {
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [commentKeys.reactions, id],
    queryFn: async () => {
      const res = await axiosAuth.get(`/events/reactions/event/${id}`);
      return res?.data?.data;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetComment(id: number) {
  const queryClient = useQueryClient();
  const queryKey = `/comments/${id}`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/comments/${id}`);
      const events = res?.data?.data;
      return events;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export const usePostReaction = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: { userId: number; eventId?: number; reaction: "Sparkling_Heart" }) => {
      return axiosInstance.post(`/events/reaction/${data?.eventId}`, data);
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

  return mutation;
};

export const useDeleteReaction = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (reactionId?: number) => {
      return axiosInstance.delete(`/events/reaction/${reactionId}`);
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

  return mutation;
};

export const usePostComment = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post("/events/comments", data);
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

  return mutation;
};

export const usePostStreamComment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post(`/events/${data.eventId}/stream-comments`, data);
    },
    onError: (error: ErrorProp) => {
      toast({
        variant: "destructive",
        title: "An error occured!.",
        description: error?.response?.data?.errors[0].message,
      });
    },
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.streamComment] }),
        toast({
          variant: "success",
          title: "Successful",
          description: "Thanks for your comment",
        });
    },
  });

  return mutation;
};

export const usePostStreamReaction = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post(`/events/${data.eventId}/stream-reactions`, data);
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
        description: "You've reacted to this event",
      });
    },
  });

  return mutation;
};

export const useDeleteComment = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.delete(`/events/comments/${data.commentId}`, data);
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

  return mutation;
};
