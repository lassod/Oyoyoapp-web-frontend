"use client";
import React, { useEffect, useState } from "react";
import { PlusCircle, Trash2, Loader } from "lucide-react";
import { useDeleteNotification, useGetNotifications, useUpdateNotification } from "@/hooks/notification";
import { NavDropdown } from "./Modal";
import { formatDatetoTime } from "@/lib/auth-helper";
import { Empty } from "@/components/ui/table";
import { SkeletonDemo } from "@/components/ui/skeleton";
import { FaCircleInfo } from "react-icons/fa6";

interface DropdownProps {
  open: boolean;
  setOpen: any;
  user?: any;
}

export const NotificationDropdown = ({ open, setOpen }: DropdownProps) => {
  const { data: notificationData, status } = useGetNotifications();
  const updateNotification = useUpdateNotification();
  const deleteNotification = useDeleteNotification();
  const [notifications, setNotifications] = useState([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (notificationData) setNotifications(notificationData);
  }, [notificationData]);

  return (
    <NavDropdown title='Notifications' open={open} setOpen={setOpen}>
      {status !== "success" ? (
        <SkeletonDemo number={2} />
      ) : notifications?.length > 0 ? (
        notifications.map((item: any, index: number) => (
          <div
            onClick={() => {
              if (item.read) return;
              else updateNotification.mutate({ id: item.id, read: true });
            }}
            className={`grid p-2 cursor-pointer hover:bg-gray-100 gap-3 items-start grid-cols-[20px,1fr] mb-2 w-full ${
              !item?.read && "bg-gray-100 hover:bg-white"
            }`}
            key={index}
          >
            <FaCircleInfo className='text-white w-5 h-5 fill-gray-600' />

            <div className='flex flex-col'>
              <h6 className='line-clamp-2 max-w-xs sm:max-w-full break-words'>{item?.title}</h6>
              <p className='text-gray-700 line-clamp-3 max-w-xs sm:max-w-full break-words'>{item?.message}</p>

              <div className='flex mt-2 justify-between'>
                <p className='text-xs'>{formatDatetoTime(item?.createdAt)}</p>
                {deletingId === item.id ? (
                  <Loader size={20} className='animate-spin text-red-600' />
                ) : (
                  <Trash2
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(item?.id);
                      deleteNotification.mutate(
                        { id: item?.id },
                        {
                          onSettled: () => setDeletingId(null),
                        }
                      );
                    }}
                    className='w-5 h-5 text-red-700 cursor-pointer hover:text-black'
                  />
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <Empty title='No new Notification' />
      )}
    </NavDropdown>
  );
};
