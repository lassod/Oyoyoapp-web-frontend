import axiosInstance from "@/lib/axios-instance";
import { useMutation } from "@tanstack/react-query";
import { ErrorProp } from "@/app/components/schema/Types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../../lib/useAxiosAuth";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";

export function useGetFollowers(id: any) {
  const queryKey = `/users/${id}/followers`;
  console.log(id);
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await axiosAuth.get(`/users/${id}/followers`);
      const events = res?.data?.data;
      console.log(res?.data);
      return events;
    },
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useGetUserFollowing() {
  const session = useSession();
  const id = session?.data?.user?.id;
  const queryKey = `/users/${id}/following`;
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await axiosAuth.get(`/users/${id}/following`);
      const events = res?.data?.data;
      console.log(res?.data.data);
      return events;
    },
    enabled: !!id,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export const usePostFollow = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post("/users/follow", data);
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

  return { mutation };
};
