"use client";
import axiosInstance from "@/lib/axios-instance";
import { useSession } from "next-auth/react";

export const useRefreshToken = () => {
  const { data: session } = useSession();
  const refreshToken = async () => {
    console.log(session);

    const response = await axiosInstance.post(`/auth/refresh-token/${session?.refreshToken}`);
    console.log(response);
    const refreshedTokens = response?.data?.data || response.data;
    console.log(refreshedTokens);
    if (session) session.accessToken = refreshedTokens?.access_token || refreshedTokens?.jwt;
  };

  return refreshToken;
};
