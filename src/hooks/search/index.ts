import axiosInstance from "@/lib/axios-instance";
import { useMutation } from "@tanstack/react-query";

export const usePostSearch = () => {
  const mutation = useMutation({
    mutationFn: (eventId: number) => {
      return axiosInstance.post(`/search`);
    },
    onError: (error: any) => {},
    onSuccess: (response) => {},
  });

  return mutation;
};
