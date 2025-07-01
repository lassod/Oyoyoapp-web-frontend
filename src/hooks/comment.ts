import axiosInstance from "@/lib/axios-instance";
import { useMutation } from "@tanstack/react-query";
import { ErrorProp } from "@/app/components/schema/Types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../lib/useAxiosAuth";
import { useToast } from "@/components/ui/use-toast";
import { queryKeys } from "./guest";

export function useGetComment(id: number) {
  const queryClient = useQueryClient();
  const queryKey = `/comments/${id}`;
  const axiosAuth = useAxiosAuth();
  console.log("first");
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/comments/${id}`);
      const events = res?.data?.data;
      console.log(res?.data);
      return events;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

// export function useGetEventComments(eventId: number) {
//   const queryKey = `guest/events/comments/event/${eventId}`;
//   // const axiosAuth = useAxiosAuth();
//   console.log("first", eventId);
//   return useQuery({
//     queryKey: [queryKey],
//     queryFn: async () => {
//       const res = await axiosInstance.get(`/guest/events/comments/event/${eventId}`);
//       console.log(res?.data);
//       const events = res?.data?.data;
//       if (Array.isArray(events)) {
//         events.sort((a: any, b: any) => {
//           return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
//         });
//       }
//       return events;
//     },
//     enabled: !!eventId,
//     refetchOnMount: "always",
//     refetchOnWindowFocus: true,
//   });
// }

export const usePostComment = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      console.log(data);
      return axiosInstance.post("/events/comments", data);
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
      console.log("Success:", response.data);
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
      console.log(data);
      return axiosInstance.post(`/events/${data.eventId}/stream-comments`, data);
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
      queryClient.invalidateQueries({ queryKey: [queryKeys.streamComment] }), console.log("Success:", response.data);
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
      console.log(data);
      return axiosInstance.post(`/events/${data.eventId}/stream-reactions`, data);
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
      console.log("Success:", response.data);
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
      console.log(data);
      return axiosInstance.delete(`/events/comments/${data.commentId}`, data);
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
      console.log("Success:", response.data);
      toast({
        variant: "success",
        title: "Successful",
        description: response.data.message,
      });
    },
  });

  return mutation;
};
