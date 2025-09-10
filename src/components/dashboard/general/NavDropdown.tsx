"use client";
import React, { useEffect, useMemo, useState } from "react";
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
  X,
} from "lucide-react";
import { NavDropdown } from "./Modal";
import { formatDatetoTime } from "@/lib/auth-helper";
import { Empty } from "@/components/ui/table";
import { SkeletonDemo } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  NotificationItem,
  useDeleteNotification,
  useGetNotificationsAll,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/hooks/notification";

type Notif = NotificationItem;

interface DropdownProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  user?: any;
}

export const NotificationDropdown = ({ open, setOpen }: DropdownProps) => {
  const { data: all = [], status } = useGetNotificationsAll();
  const markOneRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteOne = useDeleteNotification();

  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    if (Array.isArray(all)) setNotifications(all);
  }, [all]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const filtered = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.read);
    if (filter === "read") return notifications.filter((n) => n.read);
    return notifications;
  }, [notifications, filter]);

  const iconFor = (n: Notif) => {
    // map unknown -> info
    const t = (n.type || "info").toLowerCase();
    if (t.includes("success")) return <CheckCircle2 className='h-5 w-5 text-green-600' />;
    if (t.includes("warn")) return <AlertTriangle className='h-5 w-5 text-yellow-600' />;
    if (t.includes("error") || t.includes("fail")) return <AlertOctagon className='h-5 w-5 text-red-600' />;
    return <Info className='h-5 w-5 text-blue-600' />;
  };

  const handleMarkOneRead = (id: Notif["id"]) => {
    // optimistic local mirror (UI stays instant)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    // server + query caches via hook
    markOneRead.mutate(id);
  };

  const handleDelete = (id: Notif["id"]) => {
    setDeletingId(id);
    // optimistic local
    const snapshot = notifications;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    deleteOne.mutate(id, {
      onSettled: () => setDeletingId(null),
      onError: () => setNotifications(snapshot),
    });
  };

  const handleMarkAllRead = () => {
    if (!notifications.some((n) => !n.read)) return;
    // optimistic local
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    markAllRead.mutate();
  };

  return (
    <NavDropdown open={open} setOpen={setOpen}>
      {status !== "success" ? (
        <SkeletonDemo number={3} />
      ) : (
        <div className='w-full overflow-x-hidden'>
          {/* Header */}
          <div className='sticky top-0 z-10 bg-popover border-b border-border'>
            <div className='flex items-center justify-between px-4 py-3'>
              <div className='flex items-center gap-2 min-w-0'>
                <div className='relative shrink-0'>
                  <BellRing className='h-5 w-5 text-primary' />
                  {unreadCount > 0 && (
                    <span className='absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground grid place-items-center px-1'>
                      {unreadCount}
                    </span>
                  )}
                </div>
                <h5 className='font-semibold truncate'>Notifications</h5>
              </div>

              <button onClick={() => setOpen(false)} className='p-2 rounded-md hover:bg-muted' aria-label='Close'>
                <X className='h-4 w-4' />
              </button>
            </div>

            <div className='flex items-center justify-between px-4 pb-3 gap-2'>
              <div className='flex items-center gap-1'>
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

              <div className='flex items-center gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handleMarkAllRead}
                  className='h-8'
                  disabled={!notifications.some((n) => !n.read) || markAllRead.isPending}
                >
                  <MailOpen className='h-4 w-4 mr-2' />
                  Mark all read
                </Button>
              </div>
            </div>
          </div>

          {/* List */}
          {filtered.length > 0 ? (
            <div className='space-y-2 p-2'>
              {filtered.map((item) => {
                const isDeleting = deletingId === item.id;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "group rounded-xl border border-border bg-card text-card-foreground p-3 transition-all hover:shadow-sm",
                      !item.read && "bg-muted/60"
                    )}
                  >
                    <div className='flex items-start gap-3'>
                      {/* Icon */}
                      <div className='mt-0.5 shrink-0'>{iconFor(item)}</div>

                      {/* Content */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-start justify-between gap-3'>
                          <h6 className='font-medium leading-snug break-words'>{item.title}</h6>

                          {/* Mark read (no "unread" toggle in API) */}
                          {!item.read && (
                            <button
                              onClick={() => handleMarkOneRead(item.id)}
                              className='shrink-0 inline-flex items-center text-xs text-muted-foreground hover:text-foreground'
                              title='Mark as read'
                              disabled={markOneRead.isPending}
                            >
                              <MailOpen className='h-4 w-4 mr-1' />
                              Read
                            </button>
                          )}
                        </div>

                        {item.message && (
                          <p className='mt-1 text-sm text-muted-foreground break-words'>{item.message}</p>
                        )}

                        <div className='mt-2 flex items-center justify-between'>
                          <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                            <Clock className='h-3.5 w-3.5' />
                            <span>{formatDatetoTime(item.createdAt)}</span>
                          </div>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(item.id)}
                            className='inline-flex items-center text-xs text-destructive hover:opacity-80'
                            title='Delete'
                            disabled={isDeleting}
                          >
                            {isDeleting ? <Loader className='h-4 w-4 animate-spin' /> : <Trash2 className='h-4 w-4' />}
                          </button>
                        </div>
                      </div>

                      {/* Unread dot */}
                      {!item.read && <span className='mt-1.5 h-2.5 w-2.5 rounded-full bg-primary shrink-0' />}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='p-8'>
              <div className='flex flex-col items-center justify-center text-center'>
                <Empty title={filter === "unread" ? "No unread notifications" : "No notifications"} />
              </div>
            </div>
          )}
        </div>
      )}
    </NavDropdown>
  );
};
