import { useMutation } from "@tanstack/react-query";
import useAxiosAuth from "@/lib/useAxiosAuth";
import axiosInstance from "@/lib/axios-instance";
import { useRouter } from "next/router";

// "Register a New User (Personal) (POST)"

interface PersonalSignupData {
  email: string;
  password: string | number;
  country: string;
  username: string;
  first_name: string;
  last_name: string;
  gender: string;
}

export function useSignupPersonal() {
  // const axiosAuth = useAxiosAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async (signupData: PersonalSignupData) => {
      const res = await axiosInstance.post("/auth/signup/personal", signupData);
      return res?.data;
    },
    onSuccess: () => {
      // Handle success
      // Lets use the window object to ensure previous auth query state is cleared
      window.location.href = `${window.location.origin}/auth/login`;
    },
    onError: (e) => {
      // Handle error

      const msg = e.message;
      const response =
        typeof msg === "object"
          ? msg
          : {
              success: false,
              message: e.message,
            };
      return response;
    },
  });
}

//"Register a New User (Business) (POST)"

interface BusinessSignupData {
  email: string;
  password: string | number;
  country: string;
  username: string;
  first_name: string;
  last_name: string;
  gender: string;
  accountType: string;
}

export function useSignupBusiness() {
  //const axiosAuth = useAxiosAuth();

  // INDIVIDUAL
  // BUSINESS
  // PERSONAL

  return useMutation({
    mutationFn: async (signupData: BusinessSignupData) => {
      const res = await axiosInstance.post("/auth/signup/business", {
        body: signupData,
      });
      return res?.data;
    },
    onSuccess: (data) => {
      // Handle success
      // Lets use the window object to ensure previous auth query state is cleared
      window.location.href = `${window.location.origin}/auth/login`;
    },
    onError: (e) => {
      // Handle error

      const msg = e.message;
      const response =
        typeof msg === "object"
          ? msg
          : {
              success: false,
              message: e.message,
            };

      return response;
    },
  });
}

// "Log in a User (POST)"
interface LoginData {
  email: string;
  password: string | number;
}

export function useLogin() {
  // const axiosAuth = useAxiosAuth();

  return useMutation({
    mutationFn: async (loginData: LoginData) => {
      const res = await axiosInstance.post("/auth/login", loginData);
      return res?.data;
    },
    onSuccess: () => {
      // Handle success
    },
    onError: (error) => {
      // Handle error
    },
  });
}
