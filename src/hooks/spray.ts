import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance, { useAxiosInstance } from "@/lib/axios-instance";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";

const sprayKey = ["spray-statistics", "spraying/leaderboard", "spray-dashboard"] as const;
type keys = (typeof sprayKey)[number];

export function useGetUserSpray(endpoint: keys) {
  const { data: session } = useSession();
  const axios = useAxiosInstance();
  return useQuery({
    queryKey: [endpoint],
    queryFn: async () => {
      const res = await axios.get(`/users/${session?.user?.id}/${endpoint}`);
      return res?.data?.data;
    },
    enabled: !!session?.user?.id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetEventSpray(endpoint: keys, eventId: string) {
  const axios = useAxiosInstance();
  return useQuery({
    queryKey: [endpoint],
    queryFn: async () => {
      const res = await axios.get(`/events/${eventId}/${endpoint}`);
      return res?.data?.data;
    },
    enabled: !!eventId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export const sprayKeys = {
  room: "room",
  balance: "balance",
  history: "history",
  transactions: "transactions",
  userStats: "userStats",

  rates: "rates",
  leaderboard: "leaderboard",
};

export function useGetCowrieRates(symbol = "₦") {
  const axios = useAxiosInstance();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [sprayKeys.rates, symbol],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([sprayKeys.rates, symbol]);
      if (previousData) return previousData;

      const res = await axios.get(`/wallet/cowries/rates`, {
        params: { amount: 1 },
      });
      console.log(res?.data?.data);
      if (!res?.data?.data?.rates) return 1530.48;

      const symbolToCurrency: Record<string, string> = {
        "₦": "NGN",
        $: "USD",
        "£": "GBP",
        "€": "EUR",
      };

      const currencyCode = symbolToCurrency[symbol];
      if (!currencyCode) return 1530.48;

      return res?.data?.data?.rates[currencyCode]?.amount ?? null;
    },
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetWalletBalance() {
  const axios = useAxiosInstance();
  return useQuery({
    queryKey: [sprayKeys.balance],
    queryFn: async () => {
      const res = await axios.get(`/wallet/balance`);
      return res?.data?.data;
    },
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetSprayRoom(id: string) {
  const axios = useAxiosInstance();
  return useQuery({
    queryKey: [sprayKeys.balance],
    queryFn: async () => {
      const res = await axios.get(`/event/${id}/spray-room`);
      return res?.data?.data;
    },
    enabled: !!id,
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetSprayLeaderboard(id: string) {
  const axios = useAxiosInstance();
  return useQuery({
    queryKey: [sprayKeys.leaderboard, id],
    queryFn: async () => {
      const res = await axios.get(`/events/${id}/spraying/leaderboard`);
      return res?.data?.data;
    },
    enabled: !!id,
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetSprayDashboard() {
  const { data: session } = useSession();
  const axios = useAxiosInstance();
  return useQuery({
    queryKey: [sprayKeys.userStats],
    queryFn: async () => {
      const res = await axios.get(`/users/${session?.user?.id}/spray-statistics`);
      return res?.data?.data;
    },
    enabled: !!session?.user?.id,
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetSprayHistory() {
  const { data: session } = useSession();
  const axios = useAxiosInstance();
  return useQuery({
    queryKey: [sprayKeys.history],
    queryFn: async () => {
      const res = await axios.get(`/users/${session?.user?.id}/spray-history`);
      return res?.data?.data;
    },
    enabled: !!session?.user?.id,
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useGetWalletTransaction() {
  const { data: session } = useSession();
  const axios = useAxiosInstance();
  return useQuery({
    queryKey: [sprayKeys.transactions],
    queryFn: async () => {
      const res = await axios.get(`/users/${session?.user?.id}/wallet-transactions`);
      return res?.data?.data;
    },
    enabled: !!session?.user?.id,
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export const usePostFundWallet = () => {
  const { toast } = useToast();
  const axios = useAxiosInstance();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      console.log(data);
      return axios.post(`/wallet/deposit`, data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured",
        description: error?.response?.data?.errors[0].message,
      });
    },
  });

  return mutation;
};

export const usePostBuyCowrie = () => {
  const { toast } = useToast();
  const axios = useAxiosInstance();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      console.log(data);
      return axios.post(`/wallet/cowries/purchase`, data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured",
        description: error?.response?.data?.errors[0].message,
      });
    },
    onSuccess: async (response) => {
      console.log("success", response.data);
      toast({
        variant: "success",
        title: "Successful",
        description: response?.data?.message,
      });
    },
  });

  return mutation;
};

export const usePostJoinSprayRoom = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      console.log(data);
      return axiosInstance.post(`/events/${data?.id}/spray-room/join`, data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured",
        description: error?.response?.data?.errors[0].message,
      });
    },
    onSuccess: async (response) => {
      console.log("success", response.data);
      toast({
        variant: "success",
        title: "Successful",
        description: "Event Planner has been created Successfully",
      });
    },
  });

  return { mutation };
};

export const usePostSpray = () => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: any) => {
      console.log(data);
      return axiosInstance.post(`/events/${data.id}/spray`, data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "An error occured",
        description: error?.response?.data?.errors[0].message,
      });
    },
    onSuccess: async (response) => {
      console.log("success", response.data);
      toast({
        variant: "success",
        title: "Successful",
        description: response?.data?.message,
      });
    },
  });

  return mutation;
};
