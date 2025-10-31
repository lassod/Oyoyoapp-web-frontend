import axiosInstance from "@/lib/axios-instance";
import { useMutation } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../lib/useAxiosAuth";
import { useToast } from "@/components/ui/use-toast";

export function useGetEventTableArrangements(eventId: number) {
  const queryKey = `/events/${eventId}/seat-arrangement`;
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await axiosAuth.get(`/events/${eventId}/seat-arrangement`);
      return res?.data;
    },
    enabled: !!eventId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export const usePostTableArrangement = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post(`seat-arrangement`, data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occurred!",
        description: error?.response?.data?.errors?.[0]?.message || "Something went wrong!",
      });
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Table Added",
        description: response.data.message,
      });
    },
  });

  return { mutation };
};

export const useUpdateGuest = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.patch(`seat-arrangement/${data.id}/add-guest`, data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occurred!",
        description: error?.response?.data?.errors?.[0]?.message || "Something went wrong!",
      });
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Guest Added",
        description: response.data.message,
      });
      window.location.reload();
    },
  });

  return { mutation };
};

export const useDeleteTable = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.patch(`seat-arrangement/${data.seatArrangementId}/remove-table`, data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occurred!",
        description: error?.response?.data?.errors?.[0]?.message || "Something went wrong!",
      });
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Table Added",
        description: response.data.message,
      });
    },
  });

  return { mutation };
};

export const useAddTable = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.patch(`seat-arrangement/${data.id}/add-table`, data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occurred!",
        description: error?.response?.data?.errors?.[0]?.message || "Something went wrong!",
      });
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Table Added",
        description: response.data.message,
      });
    },
  });

  return { mutation };
};

export const useEditTable = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.patch(`seat-arrangement/${data.id}/edit-table`, data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occurred!",
        description: error?.response?.data?.errors?.[0]?.message || "Something went wrong!",
      });
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Table Updated",
        description: response.data.message,
      });
      window.location.reload();
    },
  });

  return { mutation };
};
