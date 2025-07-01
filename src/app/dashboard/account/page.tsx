"use client";
import React from "react";
import { ConnectAccountManagement, ConnectComponentsProvider } from "@stripe/react-connect-js";
import { useStripeConnect } from "@/context/stripe-connect-context";
import { collectionOptions } from "@/lib/stripe-session";

const StripAccount = () => {
  const { stripeConnectInstance } = useStripeConnect();

  if (!stripeConnectInstance) return <div>Loading ...</div>;
  return (
    <div className='container'>
      <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
        <ConnectAccountManagement collectionOptions={collectionOptions} />
      </ConnectComponentsProvider>
    </div>
  );
};

export default StripAccount;
