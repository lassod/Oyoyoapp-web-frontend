import React from "react";
import axiosInstance from "@/lib/axios-instance";
import { useMutation } from "@tanstack/react-query";
import { ErrorProp } from "@/app/components/schema/Types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../../lib/useAxiosAuth";

export function useGetAllWithdrawals() {
  const queryClient = useQueryClient();
  const queryKey = `/withdrawals/user `;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;
      1;
      const res = await axiosAuth.get(`/withdrawals/user`);
      console.log(res?.data?.data);
      return res?.data?.data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}
