"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  Trash2,
  Loader,
  Mail,
  MailOpen,
  Info,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";
import {
  useDeleteNotification,
  useGetNotifications,
  useUpdateNotification,
} from "@/hooks/notification";
import { NavDropdown } from "./Modal";
import { formatDatetoTime } from "@/lib/auth-helper";
import { Empty } from "@/components/ui/table";
import { SkeletonDemo } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Notif = {
  id: string | number;
  title: string;
  message?: string;
  createdAt?: string | number | Date;
  read?: boolean;
  type?: "info" | "warning" | "error" | "success";
};

interface DropdownProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  user?: any;
}

export const NotificationDropdown = ({ open, setOpen }: DropdownProps) => {
  const { data: notificationData, status } = useGetNotifications();
  const updateNotification = useUpdateNotification();
  const deleteNotification = useDeleteNotification();

  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    if (notificationData) setNotifications(notificationData as Notif[]);
  }, [notificationData]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const filtered = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.read);
    if (filter === "read") return notifications.filter((n) => n.read);
    return notifications;
  }, [notifications, filter]);

  const iconFor = (n: Notif) => {
    switch (n.type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "error":
        return <AlertOctagon className="h-5 w-5 text-danger" />;
      default:
        return <Info className="h-5 w-5 text-accent" />;
    }
  };

  const markRead = (id: Notif["id"], read: boolean) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read } : n))
    );
    updateNotification.mutate(
      { id, read },
      {
        onError: () =>
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: !read } : n))
          ),
      }
    );
  };

  const handleDelete = (id: Notif["id"]) => {
    setDeletingId(id);
    const snapshot = notifications;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    deleteNotification.mutate(
      { id },
      {
        onSettled: () => setDeletingId(null),
        onError: () => setNotifications(snapshot),
      }
    );
  };

  const handleMarkAllRead = () => {
    const ids = notifications.filter((n) => !n.read).map((n) => n.id);
    if (!ids.length) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    ids.forEach((id) =>
      updateNotification.mutate(
        { id, read: true },
        {
          onError: () =>
            setNotifications((prev) =>
              prev.map((n) => (n.id === id ? { ...n, read: false } : n))
            ),
        }
      )
    );
  };

  const handleDeleteAll = () => {
    const ids = filtered.map((n) => n.id);
    if (!ids.length) return;
    const snapshot = notifications;
    setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));
    ids.forEach((id) =>
      deleteNotification.mutate(
        { id },
        { onError: () => setNotifications(snapshot) }
      )
    );
  };

  return (
    <NavDropdown open={open} setOpen={setOpen}>
      {status !== "success" ? (
        <SkeletonDemo number={3} />
      ) : (
        <div className="w-full overflow-x-hidden">
          {/* Sticky header inside the ONE scroll container (NavDropdown body) */}
          <div className="sticky top-0 z-10 bg-popover border-b border-border">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative shrink-0">
                  <BellRing className="h-5 w-5 text-primary" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-danger text-[10px] text-danger-foreground grid place-items-center px-1">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <h5 className="font-semibold truncate">Notifications</h5>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-md hover:bg-muted"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between px-4 pb-3 gap-2">
              <div className="flex items-center gap-1">
                {(["all", "unread", "read"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs border transition",
                      filter === t
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-foreground border-border hover:bg-muted/70"
                    )}
                  >
                    {t[0].toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMarkAllRead}
                  className="h-8"
                  disabled={!notifications.some((n) => !n.read)}
                >
                  <MailOpen className="h-4 w-4 mr-2" />
                  Mark all read
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDeleteAll}
                  className="h-8"
                  disabled={filtered.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {filter === "all" ? "all" : filter}
                </Button>
              </div>
            </div>
          </div>

          {/* List – no extra overflow here; parent handles scrolling */}
          {filtered.length > 0 ? (
            <div className="space-y-2 p-2">
              {filtered.map((item) => {
                const isDeleting = deletingId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!item.read) markRead(item.id, true);
                    }}
                    className={cn(
                      "group rounded-xl border border-border bg-card text-card-foreground p-3 transition-all hover:shadow-sm",
                      !item.read && "bg-muted/60"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="mt-0.5 shrink-0">{iconFor(item)}</div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <h6 className="font-medium leading-snug break-words">
                            {item.title}
                          </h6>
                          {/* Read toggle */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markRead(item.id, !item.read);
                            }}
                            className="shrink-0 inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
                            title={
                              item.read ? "Mark as unread" : "Mark as read"
                            }
                          >
                            {item.read ? (
                              <>
                                <Mail className="h-4 w-4 mr-1" />
                                Unread
                              </>
                            ) : (
                              <>
                                <MailOpen className="h-4 w-4 mr-1" />
                                Read
                              </>
                            )}
                          </button>
                        </div>

                        {item.message && (
                          <p className="mt-1 text-sm text-muted-foreground break-words">
                            {item.message}
                          </p>
                        )}

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formatDatetoTime(item.createdAt)}</span>
                          </div>

                          {/* Delete */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                            className="inline-flex items-center text-xs text-danger hover:text-foreground"
                            title="Delete"
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Unread dot */}
                      {!item.read && (
                        <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <Empty
                  title={
                    filter === "unread"
                      ? "No unread notifications"
                      : "No notifications"
                  }
                />
              </div>
            </div>
          )}
        </div>
      )}
    </NavDropdown>
  );
};
