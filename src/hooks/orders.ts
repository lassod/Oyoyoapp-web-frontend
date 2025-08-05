import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import useAxiosAuth from "../lib/useAxiosAuth";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios-instance";
import { waitForThreeSeconds } from "@/lib/auth-helper";
import { useToast } from "@/components/ui/use-toast";

export const orderKeys = {
  order: "order",
};

export function useGetOrder(orderId: number) {
  const axiosAuth = useAxiosAuth();
  console.log("first");
  return useQuery({
    queryKey: [orderKeys.order, orderId],
    queryFn: async () => {
      const res = await axiosAuth.get(`/orders/exact/${orderId}`);
      console.log(res?.data?.data);
      return res?.data?.data;
    },
    enabled: !!orderId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetAllVendorOrders(vendorId: number) {
  const queryClient = useQueryClient();
  const queryKey = `/vendors/${vendorId}/orders/`;
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/vendors/${vendorId}/orders/`);
      const events = res?.data?.data;
      if (Array.isArray(events)) {
        events.sort((a: any, b: any) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      }
      console.log(events);
      return events;
    },
    enabled: !!vendorId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetVendorOrderStats(vendorId: number) {
  const queryClient = useQueryClient();
  const queryKey = `/vendors/${vendorId}/statistics`;
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/vendors/${vendorId}/statistics`);
      return res?.data?.data;
    },
    enabled: !!vendorId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetAllOrders() {
  const userData = useSession();
  const userId = userData?.data?.user?.id;

  const queryClient = useQueryClient();
  const queryKey = `/users/${userId}/orders/`;
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/users/${userId}/orders/`);
      const events = res?.data?.data;
      if (Array.isArray(events)) {
        events.sort((a: any, b: any) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      }
      console.log(events);
      return events;
    },

    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetTransactions() {
  const queryClient = useQueryClient();
  const queryKey = `/auth/transactions`;
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/auth/transactions`);
      const events = res?.data?.data;
      if (Array.isArray(events)) {
        events.sort((a: any, b: any) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      }
      console.log(events);
      return events;
    },

    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetVendorTransactions() {
  const queryClient = useQueryClient();
  const queryKey = `/auth/vendor-transactions`;
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/auth/vendor-transactions`);
      const events = res?.data?.data;
      if (Array.isArray(events)) {
        events.sort((a: any, b: any) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      }
      console.log(events);
      return events;
    },

    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

interface GetOrdersParams {
  select?: string;
  sort?: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  status?: string[];
  start?: string;
  end?: string;
  search?: string;
}

export function useGetOrders(params: GetOrdersParams = {}, queryOptions = {}) {
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: ["/orders", params],
    queryFn: async () => {
      const res = await axiosAuth.get("/orders", { params });
      return res?.data?.data || res?.data || res;
    },
    ...queryOptions,
  });
}

export function useGetUserOrder() {
  const userData = useSession();
  const userId = userData?.data?.user?.id;

  const queryClient = useQueryClient();
  const queryKey = `/users/${userId}/orders`;
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/users/${userId}/orders`);
      const events = res?.data?.data;
      if (Array.isArray(events)) {
        events.sort((a: any, b: any) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      }
      console.log(events);

      return events;
    },
    enabled: !!userId, // Ensure this only runs when userId is available
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetVendorOrders(vendorId: any) {
  const queryClient = useQueryClient();
  const queryKey = `/vendors/${vendorId}`;
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/vendors/${vendorId}`);
      const events = res?.data?.data;
      if (Array.isArray(events)) {
        events.sort((a: any, b: any) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      }
      console.log(events);

      return events;
    },
    enabled: !!vendorId, // Ensure this only runs when userId is available
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export const useDeleteOrder = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (orderId: number) => {
      console.log(orderId);
      return axiosInstance.delete(`/orders/${orderId}`);
    },
    onError: (error: any) => {
      console.log(error.response.data);
      toast({
        variant: "destructive",
        title: "An error occurred!.",
        description: "Please try again",
      });
    },
    onSuccess: async (response) => {
      console.log("success", response);
      toast({
        variant: "success",
        title: "Successful",
        description: "Order as been deleted",
      });
      await waitForThreeSeconds();

      window.location.reload();
    },
  });

  return { mutation };
};

export const useAcceptOrder = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (orderId: number) => {
      return axiosInstance.patch(`/orders/approve/${orderId}`);
    },
    onError: (error: any) => {
      console.log(error.response.data);
      toast({
        variant: "destructive",
        title: "An error occurred!.",
        description: "Please try again",
      });
    },
    onSuccess: async (response) => {
      console.log("success", response.data);
      toast({
        variant: "success",
        title: "Successful",
        description: "Order as been accepted",
      });
      await waitForThreeSeconds();

      window.location.reload();
    },
  });

  return { mutation };
};

export const useCompletedOrderUser = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (orderId: number) => {
      return axiosInstance.patch(`/orders/complete/${orderId}`);
    },
    onError: (error: any) => {
      console.log(error.response.data);
      toast({
        variant: "destructive",
        title: "An error occurred!.",
        description: error.response.data.errors[0].message,
      });
    },
    onSuccess: async (response) => {
      console.log("success", response.data);
      toast({
        variant: "success",
        title: "Successful",
        description: "Order as been accepted",
      });
      await waitForThreeSeconds();

      window.location.reload();
    },
  });

  return { mutation };
};

export const usePostOrder = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.post(`/orders`, data);
    },
    onError: (error: any) => {
      console.log(error.response.data);
      toast({
        variant: "destructive",
        title: "An error occurred!.",
        description: error.response.data.errors[0].message,
      });
    },
    onSuccess: async () => {
      toast({
        variant: "success",
        title: "Order sent successfully",
        description: "Awaiting confirmation from the vendor",
      });
    },
  });

  return { mutation };
};

export const useRejectOrder = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (orderId: number) => {
      console.log(orderId);
      return axiosInstance.patch(`/orders/reject/${orderId}`);
    },
    onError: (error: any) => {
      console.log(error.response.data);
      toast({
        variant: "destructive",
        title: "An error occurred!.",
        description: "Please try again",
      });
    },
    onSuccess: async (response) => {
      console.log("success", response.data);
      toast({
        variant: "success",
        title: "Successful",
        description: "Order as been rejected",
      });
      await waitForThreeSeconds();

      window.location.reload();
    },
  });

  return { mutation };
};
