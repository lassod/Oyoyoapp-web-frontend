"use client";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
  timeout: 15000,
});

let isInterceptorSet = false;

export const useAxiosInstance = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.accessToken && !isInterceptorSet) {
      axiosInstance.interceptors.request.use(
        (config) => {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
          return config;
        },
        (error) => Promise.reject(error)
      );

      axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
          const originalRequest = error.config;

          if (error.response?.status === 401 && !originalRequest._retry)
            originalRequest._retry = true;

          return Promise.reject(error);
        }
      );

      isInterceptorSet = true;
    }

    // if (status === "unauthenticated") router.push("/auth/login");
  }, [session?.accessToken, status]);

  return axiosInstance;
};

export default axiosInstance;
