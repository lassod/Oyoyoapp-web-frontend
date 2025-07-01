import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios-instance";
import { useToast } from "@/components/ui/use-toast";
import useAxiosAuth from "@/lib/useAxiosAuth";

export const notificationKeys = {
  notifications: "notifications",
};

export function useGetNotifications() {
  console.log("first");
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [notificationKeys.notifications],
    queryFn: async () => {
      const res = await axiosAuth.get(`/users/notifications/all`);
      console.log("first");
      const data = res?.data?.data;
      if (Array.isArray(data)) {
        data.sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }
      console.log("first");
      return data;
    },
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.delete(`/users/notifications/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured.",
        description: error.response.data.message,
      });
    },
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: [notificationKeys.notifications] }),
  });

  return mutation;
};

export const useUpdateNotification = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: any) => {
      console.log(data);
      return axiosInstance.post(`/users/notifications/${data.id}/read`);
    },
    onError: async (error) => {
      console.log(error);
    },
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: [notificationKeys.notifications] }),
  });

  return mutation;
};

export function useGetNotificationsUnread() {
  const queryKey = `/users/notifications`;
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await axiosAuth.get(`/users/notifications`);
      const data = res?.data?.data;
      if (Array.isArray(data)) {
        data.sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }
      return data;
    },
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}
