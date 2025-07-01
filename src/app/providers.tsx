"use client";
import { SessionProvider } from "next-auth/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "./get-query-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense } from "react";
import { StripeConnectProvider } from "@/context/stripe-connect-context";
import { Dashboard } from "@/components/ui/containers";
import { SkeletonCard1 } from "@/components/ui/skeleton";

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <Suspense
          fallback={
            <Dashboard>
              <SkeletonCard1 />
            </Dashboard>
          }
        >
          <StripeConnectProvider>{children}</StripeConnectProvider>
        </Suspense>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
