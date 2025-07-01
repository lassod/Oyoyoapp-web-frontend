import { useRouter } from "next/router";

import axiosInstance from "@/lib/axios-instance";

type SignInResponse = any;

export interface SignInDataType {
  email: string;
  password: string;
}
const sendSignInRequest = async (
  postData: SignInDataType
): Promise<SignInResponse> => {
  try {
    const data = await axiosInstance.post("/auth/login", postData);
    return data;
  } catch (e: any) {
    const response = {
      success: false,
      message: e.response?.data.message || "Login failed",
      ...(e.response.data || {}),
    };
    return response;
  }
};

// const  function useUserSignIn() {
//   const router = useRouter();
//   const handlePersistUser = async (data: any) => {
//     return await sendSignInRequest(data);
//   };
// }

export default sendSignInRequest;
