import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../../lib/useAxiosAuth";
import { useSession } from "next-auth/react";

export function useGetVendors(filters = {}) {
  const queryClient = useQueryClient();
  const queryKey = `/vendors`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey, filters],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey, filters]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/vendors`, {
        params: filters,
      });
      return res?.data?.data || res?.data || res;
    },
    retry: 3,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useGetVendor() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const queryClient = useQueryClient();
  const queryKey = `/users/${userId}/vendor`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/users/${userId}/vendor`);
      return res?.data?.data || res?.data || res;
    },
    enabled: !!userId,
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetVendorById(vendorId: number) {
  const queryClient = useQueryClient();
  const queryKey = `/vendors/${vendorId}`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/vendors/${vendorId}`);
      return res?.data?.data || res?.data || res;
    },
    enabled: !!vendorId,
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetVendorRating(vendorId: number) {
  const queryClient = useQueryClient();
  const queryKey = `/vendors/${vendorId}/ratings`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/vendors/${vendorId}/ratings`);
      return res?.data?.data || res?.data || res;
    },
    enabled: !!vendorId,
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetVendorStats(vendorId: number) {
  const queryClient = useQueryClient();
  const queryKey = `/vendors/${vendorId}/statistics`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/vendors/${vendorId}/statistics`);
      return res?.data?.data || res?.data || res;
    },
    enabled: !!vendorId,
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetVendorReviews(vendorId: number) {
  const queryClient = useQueryClient();
  const queryKey = `/vendors/${vendorId}/reviews`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/vendors/${vendorId}/reviews`);
      const reviews = res?.data?.data;
      if (Array.isArray(reviews)) {
        reviews.sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }
      return reviews;
    },
    enabled: !!vendorId,
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetVendorServices(vendorId: number) {
  const queryClient = useQueryClient();
  const queryKey = `/vendors/${vendorId}/services`;
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/vendors/${vendorId}/services`);
      return res?.data?.data || [];
    },
    enabled: !!vendorId, // Ensure this only runs when vendorId is available
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}
