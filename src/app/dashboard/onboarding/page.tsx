'use client';

import React from 'react';

import {
  ConnectComponentsProvider,
  ConnectAccountOnboarding,
} from '@stripe/react-connect-js';
import { useStripeConnect } from '@/context/stripe-connect-context';
import { collectionOptions } from '@/lib/stripe-session';

export default function Page() {
  const { stripeConnectInstance } = useStripeConnect();

  if (!stripeConnectInstance) return <div>Loading ...</div>;
  return (
    <div className="container">
      <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
        <ConnectAccountOnboarding
          collectionOptions={collectionOptions}
          onExit={() => console.log('exist')}
        />
      </ConnectComponentsProvider>
    </div>
  );
}
