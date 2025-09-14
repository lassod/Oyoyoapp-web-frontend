"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettings } from "@/app/components/dashboard/settings/AccountSettings";
import { Security } from "@/app/components/dashboard/settings/Security";
import { Store } from "@/app/components/dashboard/settings/Store";
import { Notifications } from "@/app/components/dashboard/settings/Notifications";
import { Dashboard } from "@/components/ui/containers";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
const Settings = ({ params }: any) => {
  const { tab } = params;
  const { data: session } = useSession();
  const router = useRouter();
  return (
    <Dashboard className="bg-white">
      <div className="settings">
        <div className="flex flex-row justify-between items-center">
          <span>
            <h5 className="mb-2">Settings</h5>
            <p className="my-[5px]">Manage your settings on Oyoyo</p>
          </span>
        </div>
        <div>
          <Tabs defaultValue={tab} className="w-full mt-4">
            <TabsList className="max-w-[879px] rounded-md bg-white text-gray-500">
              {session?.user?.accountType === "PERSONAL" ? (
                <>
                  {settings
                    .filter((setting: any) => setting.type !== "business")
                    .map((setting: any) => (
                      <TabsTrigger
                        onClick={() => router.push(setting.value)}
                        value={setting.value}
                        key={setting.value}
                      >
                        {setting?.title}
                      </TabsTrigger>
                    ))}
                </>
              ) : (
                <>
                  {settings.map((setting: any) => (
                    <TabsTrigger
                      onClick={() => router.push(setting.value)}
                      value={setting?.value}
                      key={setting?.value}
                    >
                      {setting?.title}
                    </TabsTrigger>
                  ))}
                </>
              )}
            </TabsList>
            <div className="border-b border-gray-200 mt-2"></div>
            <div className="max-w-full">
              {settings.map((setting) => (
                <TabsContent
                  value={setting.value}
                  key={setting.title}
                  className="max-w-full mx-auto my-2 md:pb-20 navItems"
                >
                  {setting.component}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </div>
    </Dashboard>
  );
};

export default Settings;

const settings = [
  {
    value: "account",
    title: "Account settings",
    component: <AccountSettings />,
  },

  {
    value: "security",
    title: "Security",
    component: <Security />,
  },
  {
    value: "store",
    title: "Store",
    type: "business",
    component: <Store />,
  },
  {
    value: "notifications",
    title: "Notifications",
    component: <Notifications />,
  },
];
