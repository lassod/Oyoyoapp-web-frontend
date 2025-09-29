"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BellRing,
  Trash2,
  Loader,
  MailOpen,
  Info,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Bell,
  X,
} from "lucide-react";
import { NavDropdown } from "./Modal";
import { formatDatetoTime } from "@/lib/auth-helper";
import { Empty } from "@/components/ui/table";
import { LogoLoader, SkeletonDemo } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  NotificationItem,
  useDeleteNotification,
  useGetNotificationsAll,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/hooks/notification";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { enUS } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";

type NotifType = "info" | "success" | "warning";
type NotifId = number | string;

interface Notif {
  id: NotifId;
  title: string;
  message: string; // supports rich/templated server text
  createdAt: string; // ISO string from Prisma
  read: boolean;
  type?: NotifType | string; // tolerate legacy values
}

/* ──────────────────────────────────────────────────────────────────────────── */
/* Utilities                                                                    */
/* ──────────────────────────────────────────────────────────────────────────── */

const getTypeColor = (type?: string) => {
  const t = (type ?? "info").toLowerCase();
  if (t.includes("success")) return "bg-green-500";
  if (t.includes("warn")) return "bg-yellow-500";
  return "bg-blue-500";
};

const customEn = {
  ...enUS,
  // friendlier, compact distances in the dropdown
  // NOTE: keeps backend untouched; only affects client display text
  formatDistance: (token: any, count: any, options: any) => {
    const map: Record<string, string> = {
      lessThanXMinutes: `${count} min ago`,
      xMinutes: `${count} mins ago`,
      aboutXHours: `${count} hr`,
      xHours: `${count} hr ago`,
      xDays: `${count}d ago`,
      xMonths: `${count} months ago`,
      xYears: `${count} yr ago`,
    };
    if (map[token]) return map[token];
    // @ts-ignore - enUS type uses optional formatDistance signature
    return enUS.formatDistance!(token, count, options);
  },
};

/* ──────────────────────────────────────────────────────────────────────────── */
/* Component: Old backend + New visual design                                   */
/* ──────────────────────────────────────────────────────────────────────────── */

interface DropdownProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  user?: any;
}

/**
 * ✅ Uses the *existing* hooks & handlers (old backend).
 * 🎨 Renders with the new NotificationNew dropdown design.
 * Nothing about data flow/mutations changed — only UI.
 */
export const NotificationDropdown: React.FC<DropdownProps> = ({
  open,
  setOpen,
}) => {
  // --- DATA (unchanged) ---
  const { data: all = [], isLoading, status } = useGetNotificationsAll();
  const markOneRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteOne = useDeleteNotification();

  // local mirror for optimistic UX (unchanged behavior)
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [deletingId, setDeletingId] = useState<NotifId | null>(null);

  useEffect(() => {
    if (Array.isArray(all)) setNotifications(all as Notif[]);
  }, [all]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // --- HANDLERS (preserved) ---
  const handleMarkAsRead = useCallback(
    (id: NotifId) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      markOneRead.mutate(id, {
        onError: () =>
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: false } : n))
          ),
      });
    },
    [markOneRead]
  );

  const handleMarkAllAsRead = useCallback(() => {
    if (!notifications.some((n) => !n.read)) return;
    const snapshot = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    markAllRead.mutate(undefined, {
      onError: () => setNotifications(snapshot),
    });
  }, [markAllRead, notifications]);

  const handleRemoveNotification = useCallback(
    (id: NotifId) => {
      setDeletingId(id);
      const snapshot = notifications;
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      deleteOne.mutate(id, {
        onSettled: () => setDeletingId(null),
        onError: () => setNotifications(snapshot),
      });
    },
    [deleteOne, notifications]
  );

  // --- NEW DESIGN WRAPPER (visual only) ---
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div className="relative cursor-pointer">
          <Bell className="w-5 h-5 md:h-6 md:w-6 text-gray-500 hover:text-red-700" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white">
              {unreadCount}
            </Badge>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="max-w-80 max-h-500px w-full bg-card backdrop-blur-xl !border-gray-200"
        align="end"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllRead.isPending}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        {/* Body */}
        <div className="max-h-96 overflow-y-auto custom-scrollbar">
          {/* Loading (preserved logic, new visuals) */}
          {isLoading || status !== "success" ? (
            <div className="p-8 flex justify-center items-center">
              <LogoLoader />
            </div>
          ) : !notifications || notifications.length === 0 ? (
            // Empty (preserved logic, new visuals)
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>You're all caught up!</p>
            </div>
          ) : (
            // List (preserved mapping & handlers)
            notifications.map((n: Notif) => (
              <div
                key={n.id}
                className={cn(
                  "p-4 border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors",
                  !n.read && "bg-blue-50/50 dark:bg-blue-900/20"
                )}
              >
                <div className="flex items-start gap-3">
                  {!n.read && (
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                        getTypeColor(n.type)
                      )}
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{n.title}</p>

                        {n.message && (
                          <p className="text-sm mt-1">{n.message}</p>
                        )}

                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(n.createdAt), {
                              addSuffix: true,
                              locale: customEn as any,
                            })}
                          </span>

                          {!n.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(n.id)}
                              disabled={markOneRead.isPending}
                              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-0 h-auto"
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveNotification(n.id)}
                        disabled={deletingId === n.id || deleteOne.isPending}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        aria-label="Remove notification"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
