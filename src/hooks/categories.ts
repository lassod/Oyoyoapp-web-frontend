import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../lib/useAxiosAuth";
import axiosInstance from "@/lib/axios-instance";

export function useGetCategories() {
  const queryClient = useQueryClient();
  const queryKey = `/categories`;
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosInstance.get(`/categories`);
      return res?.data?.data;
    },
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetServiceCategories() {
  const queryClient = useQueryClient();
  const queryKey = `/service-categories`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/service-categories`);
      return res?.data?.categories;
    },
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetCategory(categoryId: number) {
  const queryClient = useQueryClient();
  const queryKey = `/categorys/exact/${categoryId}`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;
      const res = await axiosAuth.get(`/categorys/exact/${categoryId}`);
      console.log(res?.data?.data);
      return res?.data?.data;
    },
    enabled: !!categoryId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetServiceCategoryById(categoryId: number) {
  const queryClient = useQueryClient();
  const queryKey = `/service-categories/${categoryId}`;
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;
      const res = await axiosAuth.get(`/service-categories/${categoryId}`);
      console.log(res?.data?.data);
      return res?.data?.data;
    },
    enabled: !!categoryId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetServiceTypeById(typeId: number) {
  const queryClient = useQueryClient();
  const queryKey = `/service-types/${typeId}`;
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;
      const res = await axiosAuth.get(`/service-types/${typeId}`);
      console.log(res?.data?.data);
      return res?.data?.data;
    },
    enabled: !!typeId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}
