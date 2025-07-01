import { useQuery, QueryClient, useQueryClient } from "@tanstack/react-query";

import useAxiosAuth from "../../lib/useAxiosAuth";
import { useSession } from "next-auth/react";

type DataResponse = any;
export let queryKey = "/favorites/";

// Define types for your event and query data
type Event = {
  name: string;
  // Add other fields if necessary
};

type QueryData = {
  data: {
    data: Event[];
  };
};

// Filter event by name
const filterEventByName = (events: Event[], name: string) =>
  events?.filter((event: any) => event?.name?.toLowerCase() === name?.toLowerCase());

// Filter by Event type query  {{ToDo  ?? inc }}
const filterByEventTypeQuery = (queryClient: QueryClient, type: string, eventName: string) => {
  const queryTypeKey = `/events.${type}`;
  const favoriteEvents = queryClient.getQueryData<any>([queryTypeKey])?.data?.data || [];
  const event = filterEventByName(favoriteEvents, eventName)?.[0];
  return event;
};

export interface EventDataTypes {
  userId: string;
}
export function useGetFavoriteEvents(requestData?: EventDataTypes, queryOptions = {}) {
  const userData = useSession();
  const userId = requestData?.userId || userData.data?.user.id;
  const queryClient = useQueryClient();
  const queryKey = `/users/${userId}/favorites/`;
  const axiosAuth = useAxiosAuth();

  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const previousData = queryClient.getQueryData<any>([queryKey]);
      if (previousData) return previousData;

      //{{ToDo}}
      // Filter Events by past
      // Filter Events by past
      // Filter Events by past
      const res = await axiosAuth.get(`/users/${userId}/favorites/`, {
        params: requestData,
      });
      return res?.data?.data || res?.data || res;
    },
    // retry: 3,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}
