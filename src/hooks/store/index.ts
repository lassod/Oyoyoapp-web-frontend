import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios-instance";
import { useToast } from "@/components/ui/use-toast";

export const usePostStore = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post("/users/avatar", data);
    },
    onError: (error: any) => {
      console.log(error);
      toast({
        variant: "destructive",
        title: "An error occured!.",
        description: "Please try again",
      });
    },
    onSuccess: (response) => {
      console.log("Success:", response.data);
      toast({
        variant: "success",
        title: "Successful",
        description: "Avatar upload successful",
      });
    },
  });
  return { mutation };
};
