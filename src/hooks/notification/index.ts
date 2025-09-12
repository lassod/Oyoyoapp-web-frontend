import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "@/lib/useAxiosAuth";
import { useToast } from "@/components/ui/use-toast";

export type NotificationItem = {
  id: number | string;
  type?: string;
  title: string;
  message?: string;
  payload?: any;
  entity?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationListResponse = {
  message: string;
  data: NotificationItem[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};

export const notificationKeys = {
  all: ["notifications", "all"] as const,
  unread: ["notifications", "unread"] as const,
  stats: ["notifications", "stats"] as const,
  // preference: ["notifications", "stats"] as const,
};

function sortByCreatedDesc(items: NotificationItem[]) {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Get ALL notifications (read + unread) */
export function useGetNotificationsAll(params?: {
  type?: string;
  read?: boolean;
  limit?: number;
  offset?: number;
}) {
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [...notificationKeys.all, params ?? {}],
    queryFn: async () => {
      const res = await axiosAuth.get<NotificationListResponse>(
        "/users/notifications/all",
        { params }
      );
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      return sortByCreatedDesc(list);
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}

/** Get UNREAD notifications only (main endpoint) */
export function useGetNotificationsUnread(params?: {
  type?: string;
  limit?: number;
  offset?: number;
}) {
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: [...notificationKeys.unread, params ?? {}],
    queryFn: async () => {
      const res = await axiosAuth.get<NotificationListResponse>(
        "/users/notifications",
        { params }
      );
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      return sortByCreatedDesc(list);
    },
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });
}

/** (Optional) Stats */
export function useGetNotificationStats() {
  const axiosAuth = useAxiosAuth();
  return useQuery({
    queryKey: notificationKeys.stats,
    queryFn: async () => {
      const res = await axiosAuth.get("/users/notifications/stats");
      return res.data?.data ?? res.data;
    },
    refetchOnWindowFocus: false,
  });
}

/** PATCH /users/notifications/:id/read (mark one as read) */
export function useMarkNotificationRead() {
  const axiosAuth = useAxiosAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: number | string) => {
      await axiosAuth.patch(`/users/notifications/${id}/read`);
      return id;
    },
    onMutate: async (id) => {
      // optimistic: ALL → set read=true
      qc.setQueriesData<NotificationItem[]>(
        { queryKey: notificationKeys.all, exact: false },
        (old) =>
          old ? old.map((n) => (n.id === id ? { ...n, read: true } : n)) : old
      );
      // optimistic: UNREAD → remove from list
      qc.setQueriesData<NotificationItem[]>(
        { queryKey: notificationKeys.unread, exact: false },
        (old) => (old ? old.filter((n) => n.id !== id) : old)
      );
    },
    // keep success noop (already updated)
  });
}

/** POST /users/notifications/mark-all-read */
export function useMarkAllNotificationsRead() {
  const axiosAuth = useAxiosAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await axiosAuth.post(`/users/notifications/mark-all-read`);
      return true;
    },
    onMutate: async () => {
      // optimistic: UNREAD → []
      qc.setQueriesData<NotificationItem[]>(
        { queryKey: notificationKeys.unread, exact: false },
        () => []
      );
      // optimistic: ALL → mark every as read
      qc.setQueriesData<NotificationItem[]>(
        { queryKey: notificationKeys.all, exact: false },
        (old) => (old ? old.map((n) => ({ ...n, read: true })) : old)
      );
    },
  });
}

/** DELETE /users/notifications/:id */
export function useDeleteNotification() {
  const axiosAuth = useAxiosAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number | string) => {
      await axiosAuth.delete(`/users/notifications/${id}`);
      return id;
    },
    onMutate: (id) => {
      // optimistic: remove from ALL
      qc.setQueriesData<NotificationItem[]>(
        { queryKey: notificationKeys.all, exact: false },
        (old) => (old ? old.filter((n) => n.id !== id) : old)
      );
      // optimistic: remove from UNREAD (if present)
      qc.setQueriesData<NotificationItem[]>(
        { queryKey: notificationKeys.unread, exact: false },
        (old) => (old ? old.filter((n) => n.id !== id) : old)
      );
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: "Failed to delete",
        description: err?.response?.data?.message || "Please try again.",
      });
    },
  });
}
