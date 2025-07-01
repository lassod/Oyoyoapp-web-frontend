import { useQuery, useMutation } from "@tanstack/react-query";
import useAxiosAuth from "../lib/useAxiosAuth";
import axiosInstance from "@/lib/axios-instance";
import { waitForThreeSeconds } from "@/lib/auth-helper";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";

const sprayKeys = ["spray-statistics", "spray-dashboard", "spraying/leaderboard"] as const;
type keys = (typeof sprayKeys)[number];

export function useGetUserSpray(endpoint: keys) {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [endpoint],
    queryFn: async () => {
      const res = await axiosAuth.get(`/users/${session?.user?.id}/${endpoint}`);
      return res?.data?.data;
    },
    enabled: !!session?.user?.id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetEventSpray(endpoint: keys, eventId: string) {
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [endpoint],
    queryFn: async () => {
      const res = await axiosAuth.get(`/events/${eventId}/${endpoint}`);
      return res?.data?.data;
    },
    enabled: !!eventId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export const usePostSpray = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      console.log(data);
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
      console.log("success", response.data);
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
