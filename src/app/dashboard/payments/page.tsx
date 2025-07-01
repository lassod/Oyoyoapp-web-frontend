"use client";

import React from "react";

import { ConnectComponentsProvider, ConnectPayments } from "@stripe/react-connect-js";
import { useStripeConnect } from "@/context/stripe-connect-context";

export default function Page() {
  const { stripeConnectInstance } = useStripeConnect();

  if (!stripeConnectInstance) return <div>Loading ...</div>;
  return (
    <div className='container'>
      <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
        <ConnectPayments />
      </ConnectComponentsProvider>
    </div>
  );
}
