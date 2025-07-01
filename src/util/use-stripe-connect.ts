import { getOrCreateStripeSession } from "@/lib/stripe-session";
import { loadConnectAndInitialize, StripeConnectInstance } from "@stripe/connect-js";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export const useStripeConnect = () => {
  const { data: session, status } = useSession();
  const [stripeConnectInstance, setStripeConnectInstance] = useState<StripeConnectInstance | null>(null);
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * If session is still loading, do nothing
     */
    if (status === "loading") return;

    /**
     *  If authenticated and stripeConnectId is available, initialize Stripe
     */
    if (status === "authenticated" && session?.stripeConnectId) {
      const initializeStripe = async () => {
        try {
          setLoading(true); // Ensure loading starts before fetching

          const instance = await loadConnectAndInitialize({
            publishableKey:
              "pk_live_51P8Se808P4tFOkILIuGcwOCzUfQrXKcx6uy8ufhmy6HS9gUV0THfuFkFkN2RQaCq4UBm0AgPXXHOhjTjSeQPNgtP008HJS6kpS",
            // publishableKey: `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!}`,
            fetchClientSecret: () => getOrCreateStripeSession(session.stripeConnectId as string),
          });

          if (instance) {
            await instance.update({
              appearance: {
                variables: {
                  buttonPrimaryColorBackground: "#b91c1c",
                  actionPrimaryColorText: "#b91c1c",
                  colorPrimary: "#b91c1c",
                  buttonBorderRadius: "20px",
                },
              },
            });
          }

          setStripeConnectInstance(instance);
        } catch (err) {
          console.error("Failed to initialize Stripe Connect:", err);
          setError("Failed to initialize Stripe Connect.");
        } finally {
          setTimeout(() => setLoading(false), 500); // Ensure all async operations have completed before setting loading to false
        }
      };

      initializeStripe();
    } else if (status === "authenticated" && !session?.stripeConnectId) {
      console.warn("Stripe Connect ID is not available in the session.");
      setError("Stripe Connect ID is missing.");
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [status, session]);

  return { stripeConnectInstance, loading, error };
};
