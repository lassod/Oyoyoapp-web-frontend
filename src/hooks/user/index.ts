import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import useAxiosAuth from "../../lib/useAxiosAuth";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios-instance";
import { AxiosError } from "axios";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { waitForThreeSeconds } from "@/lib/auth-helper";

export function useGetUser() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const id = session?.user?.id;
  const queryKey = `/users/${id}`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/users/${id}`);
      return res?.data?.data;
    },
    enabled: !!id,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useGetUserDashSetup(id: any) {
  const queryClient = useQueryClient();
  const queryKey = `/users/${id}/dashboard-setup`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/users/${id}/dashboard-setup`);
      return res?.data?.data;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetUserDisputes() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const id = session?.user?.id;
  const queryKey = `/users/${id}/disputes`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/users/${id}/disputes`);
      return res?.data?.data;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetUserWalletStats() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const id = session?.user?.id;
  const queryKey = `/users/${id}/wallet`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/users/${id}/wallet`);
      return res?.data?.data;
    },
    enabled: !!id,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useGetUserLog() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const id = session?.user?.id;
  const queryKey = `/users/${id}/logs`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;
      const res = await axiosAuth.get(`/users/${id}/logs`);
      const data = res?.data?.data;
      if (Array.isArray(data)) {
        data.sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }
      return data || [];
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetAllUsers() {
  const queryKey = `/users`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      let users: any[] = [];
      let page = 1;
      let totalPages = 1;
      const pageSize = 10;

      do {
        const res = await axiosAuth.get(`/users`, {
          params: { page, pageSize },
        });

        const data = res?.data?.data;
        const pagination = res?.data?.pagination;

        if (Array.isArray(data)) users = [...users, ...data];

        totalPages = pagination?.totalPages || 1;
        page += 1;
      } while (page <= totalPages);

      users.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return users;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetUserById(id: number) {
  const queryClient = useQueryClient();
  const queryKey = `/users/${id}`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;
      const res = await axiosAuth.get(`/users/${id}`);
      return res?.data?.data;
    },
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetAllOrders() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const queryKey = `/users/${userId}/orders`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;
      const res = await axiosAuth.get(`/users/${userId}/orders`);
      return res?.data?.data;
    },
    enabled: !!userId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export const useDeleteOrder = (orderId: number) => {
  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.delete(`/orders/${orderId}`);
    },
    onError: (error: AxiosError) => {},
    onSuccess: (response) => {},
  });

  return { mutation };
};

export const usePostUpload = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post("/users/avatar", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured!.",
        description: "Please try again",
      });
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Successful",
        description: "Avatar upload successful",
      });
    },
  });
  return { mutation };
};

export const useUpdateUser = () => {
  const { toast } = useToast();
  const userData = useSession();
  const id = userData?.data?.user?.id;

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.put(`/users/${id}`, data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured!.",
        description: "Please try again",
      });
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Successful",
        description: "Profile update successful",
      });
    },
  });
  return { mutation };
};

export const useUpdateCurrency = () => {
  const { toast } = useToast();
  const userData = useSession();
  const id = userData?.data?.user?.id;

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.patch(`/users/${id}/preferred-currency`, data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured!.",
        description: "Please try again",
      });
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Successful",
        description: "Profile update successful",
      });
    },
  });
  return { mutation };
};

export const useDeleteUser = () => {
  const { toast } = useToast();
  const userData = useSession();
  const id = userData?.data?.user?.id;

  const mutation = useMutation({
    mutationFn: () => {
      return axiosInstance.delete(`/users/${id}`);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured!.",
        description: error.response.data.errors[0].message,
      });
    },
    onSuccess: async (response) => {
      toast({
        variant: "success",
        title: "Successful",
        description: response.data.message,
      });
      await waitForThreeSeconds();

      window.location.href = "/auth/login";
    },
  });
  return { mutation };
};

export const usePostPaymentMethod = () => {
  const { toast } = useToast();
  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post(`/users/payment-method/paystack`, data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured!.",
        description: error.response.data.errors[0].message,
      });
    },
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Successful",
        description: response.data.message,
      });
      window.location.href = "/dashboard/service/verification";
    },
  });
  return { mutation };
};

export const usePostAvatar = () => {
  const [response, setResponse] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      const formData = convertToFormData(data);

      return axiosInstance.post("/users/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onError: (error: any) => {
      setResponse(error?.response?.data?.errors[0].message);
    },
    onSuccess: async (response) => {
      toast({
        variant: "success",
        title: "Successful",
        description: "Profile picture updated successfully",
      });
      await waitForThreeSeconds();

      window.location.reload();
    },
  });

  return { mutation, response };
};

export const usePostUserVerification = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      const formData = convertToFormData2(data);
      return axiosInstance.post(`/users/${data.userId}/verification`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured",
        description: "Upload Attachments",
      });
    },
    onSuccess: () => {
      toast({
        variant: "success",
        title: "Successful",
        description: "Your verification is being processed",
      });
      window.location.href = "/dashboard/service/launch";
    },
  });

  return { mutation };
};

const convertToFormData = (data: any) => {
  const formData = new FormData();
  formData.append("avatar", data);

  return formData;
};

const convertToFormData2 = (data: any) => {
  const formData = new FormData();
  formData.append("accountType", data.accountType);
  formData.append("nationality", data.nationality);
  formData.append("firstName", data.firstName);
  formData.append("lastName", data.lastName);
  formData.append("contactAddress", data.contactAddress);
  formData.append("dateOfBirth", data.dateOfBirth);
  formData.append("refereeName", data.refereeName);
  formData.append("refereePhoneNumber", data.refereePhoneNumber);
  formData.append("passportPhoto", data.passportPhoto);
  formData.append("ninOrDriversLicense", data.ninOrDriversLicense);
  formData.append("evidenceOfExperience", data.evidenceOfExperience);

  return formData;
};
