"use client";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar/sidebar";
import { MessageSquareMore, X } from "lucide-react";
import { NotificationBanner } from "@/components/dashboard/stripe/EmbededComponents";

export const Notifications = () => {
  return (
    <div className='flex  justify-center'>
      <div className=' flex flex-col gap-[30px] bg-[#]    '>
        <div className='flex flex-col'>
          <div className='justify-self-start my-[15px]'>
            <h6>Your Notifications</h6>
            <p className='my-[5px] text-sm '>Send me email when:</p>
          </div>
          <div className='border-b border-gray-200 mb-3'></div>
          <div className='flex flex-col gap-[15px]  rounded-lg bg-white shadow-sm dark:bg-surface-dark sm:px-[30px] py-[15px]'>
            <div className='flex gap-[10px] '>
              <Switch id='airplane-mode' />
              <p className='text-black'>Someone sends me a Message</p>
            </div>
            <div className='flex gap-[10px] '>
              <Switch id='airplane-mode' />
              <p className='text-black'>Someone follows me</p>
            </div>
            <div className='flex gap-[10px] '>
              <Switch id='airplane-mode' />
              <p className='text-black'>My listings are about to expire</p>
            </div>
          </div>
        </div>
        {/* Your Notifications */}
        <div className='flex flex-col max-w-[640px]'>
          <div className='justify-self-start my-4 sm:my-[15px]'>
            <h6>Your Notifications</h6>
            <p className='my-[5px] text-sm '>Send me email when:</p>
          </div>
          <div className='border-b border-gray-200 mb-3'></div>
          <div className='flex flex-col gap-[15px]  rounded-lg bg-white shadow-sm dark:bg-surface-dark sm:px-[30px] py-[15px]'>
            <div className='flex gap-[10px] '>
              <Switch id='airplane-mode' />
              <div>
                <p className='text-black'>My Seller Activity</p>
                <p>
                  Get up-to-date shop and Oyoyo insights—comprehensive reports
                  <br /> and guides to push your business further. Plus, <br /> learn about our upcoming marketplace
                  plans.
                </p>
              </div>
            </div>
            <div className='flex gap-[10px] '>
              <Switch id='airplane-mode' />
              <div>
                <p className='text-black'>News and Features</p>
                <p>Receive regular updates on how Oyoyo is doing—and how we’re growing.</p>
              </div>
            </div>
            <div className='flex gap-[10px] '>
              <Switch id='airplane-mode' />
              <div>
                <p className='text-black'>Tips for Improving My Shop</p>
                <p>Learn from other sellers to share stories and advice on running an Oyoyo shop.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function StripeNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  return (
    <div className='flex items-center gap-3 text-sm'>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className='relative'>
            {unread > 0 && (
              <div className='text-white rounded-full absolute top-[-12px] left-[-2px] w-4 flex items-center justify-center text-[11px] h-4 bg-red-600'>
                {unread}
              </div>
            )}
            <MessageSquareMore className='text-gray-500 cursor-pointer hover:text-red-700' />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className='w-[250px] max-h-[680px] overflow-scroll sm:w-[464px] rounded-lg p-0 sm:p-4'
          align='end'
        >
          <Sidebar collapsible='none' className='bg-transparent'>
            <SidebarContent>
              <div className='flex items-center sticky top-0 z-50 bg-white w-full h-10 justify-between'>
                <h6 className='font-medium'>Stripe Notifications</h6>
                <X
                  onClick={() => setIsOpen(false)}
                  className='w-[16px] mt-1 h-[16px] cursor-pointer hover:text-red-800'
                />
              </div>
              <SidebarMenu className='gap-3'>
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
