import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../../lib/useAxiosAuth";

export let queryKey = "/events";

export interface EventDataTypes {
  name?: string;
}

export function useGetEvents(requestData: EventDataTypes = {}) {
  const eventName = requestData?.name || "";
  const queryClient = useQueryClient();
  const queryKey = `/events/${eventName}`;
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      const res = await axiosAuth.get(`/events/`, {
        params: requestData,
      });
      return res?.data?.data || res?.data || res;
    },
    retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}
