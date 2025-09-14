"use client";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import {
  useGetNotificationSettings,
  useUpdateNotificationSettings,
} from "@/hooks/notification";
import { LogoLoader } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar/sidebar";
import { MessageSquareMore, X } from "lucide-react";
import { NotificationBanner } from "@/components/dashboard/stripe/EmbededComponents";

// --- Configuration for Notification Items ---
const notificationConfig = [
  {
    setting: "upcomingEvents",
    label: "Upcoming Events",
    description: "When an event you registered for is approaching.",
  },
  {
    setting: "followUpdates",
    label: "Follow Updates",
    description: "When someone you follow creates a new event.",
  },
  {
    setting: "ticketConfirmations",
    label: "Ticket Confirmations",
    description: "When you successfully purchase a ticket.",
  },
  {
    setting: "eventsNearMe",
    label: "Events Near Me",
    description: "Get notified about new events in your area.",
  },
  {
    setting: "kycUpdates",
    label: "KYC Updates",
    description: "Status updates on your identity verification.",
  },
  {
    setting: "orderUpdates",
    label: "Order Updates",
    description: "Notifications about your marketplace orders.",
  },
  {
    setting: "walletUpdates",
    label: "Wallet Updates",
    description: "When you receive funds or make a withdrawal.",
  },
  {
    setting: "generalUpdates",
    label: "General Updates",
    description: "Receive news and updates about the platform.",
  },
];

// --- Reusable Child Component for a Group of Notifications ---
const NotificationGroup = ({ title, description, settings, onToggle }: any) => {
  return (
    <div className="flex flex-col">
      <div className="justify-self-start my-[15px]">
        <h6>{title}</h6>
        <p className="my-[5px] text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="border-b border-gray-200 dark:border-gray-700 mb-3"></div>
      <div className="flex flex-col gap-[20px] rounded-lg bg-white shadow-sm dark:bg-surface-dark px-4 sm:px-[30px] py-[20px]">
        {notificationConfig.map(({ setting, label, description }) => (
          <div key={setting} className="flex items-center justify-between">
            <div className="pr-4">
              <p className="text-black dark:text-white font-medium">{label}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Switch
              checked={settings ? !!settings[setting] : false}
              onCheckedChange={(value) => onToggle(setting, value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Component ---
export const Notifications = () => {
  const { data: initialNotifications, status } = useGetNotificationSettings();
  const updateSettingsMutation = useUpdateNotificationSettings();

  // Local state to manage the UI optimistically
  const [settings, setSettings] = useState(initialNotifications);

  // Sync local state when fetched data changes
  useEffect(() => {
    if (initialNotifications) {
      setSettings(initialNotifications);
    }
  }, [initialNotifications]);

  const handleToggle = (
    type: "emailSettings" | "bellSettings",
    settingKey: string,
    enabledValue: boolean
  ) => {
    // 1. Optimistically update the local state for a snappy UI
    setSettings((prev: any) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [settingKey]: enabledValue,
      },
    }));

    // 2. Call the mutation with the correct payload structure
    updateSettingsMutation.mutate({
      type: type,
      setting: settingKey,
      enabled: enabledValue,
    });
  };

  if (status !== "success") {
    return <LogoLoader />;
  }

  return (
    <div className="flex justify-center">
      <div className="flex flex-col gap-[30px] w-full max-w-[800px]">
        <NotificationGroup
          title="Email Notifications"
          description="Send me an email when:"
          settings={settings?.emailSettings}
          onToggle={(settingKey: string, enabledValue: boolean) =>
            handleToggle("emailSettings", settingKey, enabledValue)
          }
        />
        <NotificationGroup
          title="In-App Notifications"
          description="Show a notification in the app when:"
          settings={settings?.bellSettings}
          onToggle={(settingKey: string, enabledValue: boolean) =>
            handleToggle("bellSettings", settingKey, enabledValue)
          }
        />
      </div>
    </div>
  );
};

export function StripeNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  return (
    <div className="flex items-center gap-3 text-sm">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            {unread > 0 && (
              <div className="text-white rounded-full absolute top-[-12px] left-[-2px] w-4 flex items-center justify-center text-[11px] h-4 bg-red-600">
                {unread}
              </div>
            )}
            <MessageSquareMore className="text-gray-500 cursor-pointer hover:text-red-700" />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[250px] max-h-[680px] overflow-scroll sm:w-[464px] rounded-lg p-0 sm:p-4"
          align="end"
        >
          <Sidebar collapsible="none" className="bg-transparent">
            <SidebarContent>
              <div className="flex items-center sticky top-0 z-50 bg-white w-full h-10 justify-between">
                <h6 className="font-medium">Stripe Notifications</h6>
                <X
                  onClick={() => setIsOpen(false)}
                  className="w-[16px] mt-1 h-[16px] cursor-pointer hover:text-red-800"
                />
              </div>
              <SidebarMenu className="gap-3">
                {unread > 0 ? (
                  <NotificationBanner setUnread={setUnread} />
                ) : (
                  <SidebarMenuItem>
                    <p>No new notification</p>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        </PopoverContent>
      </Popover>
    </div>
  );
}
