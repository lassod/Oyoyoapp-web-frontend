import axiosInstance from "@/lib/axios-instance";
import { useMutation } from "@tanstack/react-query";
import { ErrorProp } from "@/app/components/schema/Types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../lib/useAxiosAuth";
import { useToast } from "@/components/ui/use-toast";

export function useGetDiscount(id: number) {
  const queryClient = useQueryClient();
  const queryKey = `/discounts/${id}`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/discounts/${id}`);
      const events = res?.data?.data;
      return events;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetDiscounts() {
  const queryClient = useQueryClient();
  const queryKey = `/discounts`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/discounts`);
      const events = res?.data?.data;
      return events;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export const usePostDiscount = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post("/discounts", data);
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
