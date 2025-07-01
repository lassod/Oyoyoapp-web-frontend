"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { loadConnectAndInitialize, StripeConnectInstance } from "@stripe/connect-js";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";

interface StripeConnectContextProps {
  stripeConnectInstance: StripeConnectInstance | null;
  accountType: any | null;
}

const StripeConnectContext = createContext<StripeConnectContextProps | undefined>(undefined);
interface StripeConnectProviderProps {
  // session?: Session | null;
  children: React.ReactNode;
}

export const StripeConnectProvider = ({ children }: StripeConnectProviderProps) => {
  const { data: session } = useSession();

  const [stripeConnectInstance, setStripeConnectInstance] = useState<StripeConnectInstance | null>(null);
  const [accountType, setAccountType] = useState<any | null>(null);

  useEffect(() => {
    if (!session) return;

    const initializeStripeConnect = async () => {
      const instance = await loadConnectAndInitialize({
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        fetchClientSecret: async () => session.stripeSecret as string,
        appearance: {
          overlays: "dialog",
          variables: {
            colorBackground: "#FFFFFF",
          },
        },
      });
      setStripeConnectInstance(instance);
    };

    const fetchAccountType = async () => {
      const accountType = session?.user?.accountType;
      setAccountType(accountType);
      if (accountType === "INDIVIDUAL" || accountType === "BUSINESS") await initializeStripeConnect();
    };

    fetchAccountType();
  }, [session]);

  return (
    <StripeConnectContext.Provider value={{ stripeConnectInstance, accountType }}>
      {children}
    </StripeConnectContext.Provider>
  );
};

export const useStripeConnect = (): StripeConnectContextProps => {
  const context = useContext(StripeConnectContext);
  if (!context) throw new Error("useStripeConnect must be used within a StripeConnectProvider");
  return context;
};
