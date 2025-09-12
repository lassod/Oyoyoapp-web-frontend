import SkeletonTable, { SkeletonDemo } from "@/components/ui/skeleton";
import { useStripeConnect } from "@/util/use-stripe-connect";
import {
  ConnectAccountManagement,
  ConnectBalances,
  ConnectComponentsProvider,
  ConnectNotificationBanner,
  ConnectPayoutsList,
} from "@stripe/react-connect-js";

export const AccountManagement = () => {
  const { stripeConnectInstance, loading, error } = useStripeConnect();

  if (loading) return <SkeletonDemo />;
  if (error) return <div>Error: {error}</div>;

  if (stripeConnectInstance)
    return (
      <div className="flex flex-col w-full">
        <div className="justify-self-start my-[15px]">
          <h6>Stripe settings</h6>
          <p>Update your stripe account information</p>
        </div>
        <div className="border-b border-gray-200 mb-3"></div>
        <div className="flex flex-col font-inter mt-[30px] pb-10 rounded-lg bg-transparent w-full px-4 shadow-md dark:bg-surface-dark">
          <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
            <ConnectAccountManagement
              collectionOptions={{
                fields: "eventually_due",
                futureRequirements: "include",
              }}
            />
          </ConnectComponentsProvider>
        </div>
      </div>
    );
};

export const PayoutSchedules = () => {
  const { stripeConnectInstance, loading, error } = useStripeConnect();

  if (error) return <div>Error: {error}</div>;
  if (stripeConnectInstance)
    return (
      <div className="flex flex-col w-full">
        <div className="flex flex-col gap-1 my-[15px]">
          <h6>Payouts</h6>
          <p>See all withdrawal you have made</p>
        </div>
        <div className="flex font-inter flex-col mt-[30px] pb-10 rounded-lg w-full">
          {loading ? (
            <SkeletonTable />
          ) : (
            <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
              <ConnectBalances />
              <div className="mt-6">
                <ConnectPayoutsList />
              </div>
            </ConnectComponentsProvider>
          )}
        </div>
      </div>
    );
};

export const NotificationBanner = ({ setUnRead }: any) => {
  const { stripeConnectInstance, loading, error } = useStripeConnect();
  console.log(loading);
  const handleNotificationsChange = (response: any) =>
    setUnRead(response.total);

  if (error) return <div>Error: {error}</div>;
  if (stripeConnectInstance)
    return (
      <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
        <ConnectNotificationBanner
          collectionOptions={{
            fields: "eventually_due",
            futureRequirements: "include",
          }}
          onNotificationsChange={handleNotificationsChange}
        />
      </ConnectComponentsProvider>
    );
};
