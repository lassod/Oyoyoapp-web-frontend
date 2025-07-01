import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
  timeout: 15000,
});

export const useAxiosInstance = (token: string) => {
  axiosInstance.interceptors.request.use(
    async (config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

export default axiosInstance;
