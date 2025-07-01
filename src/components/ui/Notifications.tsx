import React, { useEffect, useState } from "react";
import axios from "axios";

interface Notification {
  id: number;
  message: string;
  read: boolean;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get<{ data: Notification[] }>("/users/notifications");
        setNotifications(response.data.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notificationId: number) => {
    try {
      const response = await axios.post<{ data: Notification }>(
        `/users/notifications/${notificationId}/read`
      );
      const updatedNotification = response.data.data;

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === updatedNotification.id ? updatedNotification : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          onClick={() => handleNotificationClick(notification.id)}
          className={`p-4 rounded cursor-pointer border shadow-sm transition-colors duration-200 ${
            notification.read ? "bg-white" : "bg-gray-200"
          }`}
        >
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
