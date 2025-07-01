import axiosInstance from "@/lib/axios-instance";
import { useMutation } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../lib/useAxiosAuth";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";

export function useGetUserBookmarks() {
  const session = useSession();
  const id = session?.data?.user?.id;
  const queryKey = `/users/${id}/bookmarks`;
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await axiosAuth.get(`/users/${id}/bookmarks`);
      const events = res?.data?.data;
      if (Array.isArray(events)) {
        events.sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }
      return events;
    },
    enabled: !!id,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export const usePostBookmark = () => {
  const { toast } = useToast();
  const { data: session } = useSession();
  const user = session?.user;

  const mutation = useMutation({
    mutationFn: (eventId: number) => {
      return axiosInstance.post(`/events/${eventId}/bookmark`, { userId: user?.id }); // Passing userId explicitly
    },
    onError: (error: any) => {
      console.log(error);
      toast({
        variant: "destructive",
        title: "An error occurred!",
        description: error?.response?.data?.errors?.[0]?.message || "Something went wrong!",
      });
    },
    onSuccess: (response) => {
      console.log("Success:", response);
      toast({
        variant: "success",
        title: "Bookmark updated!",
        description: response.data.message,
      });
    },
  });

  return mutation; // Return the entire mutation object
};
