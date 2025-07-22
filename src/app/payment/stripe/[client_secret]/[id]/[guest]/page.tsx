"use client";

import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { TicketSuccessModal } from "@/components/ui/alert-dialog";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_xxx_replace_for_dev" // Use a test key while debugging
);

export default function StripePage({ params, searchParams }: any) {
  // Adjust depending on how you actually pass them:
  const client_secret =
    params?.client_secret || searchParams?.client_secret || "";
  const id = params?.id || searchParams?.id;
  const guestRaw = params?.guest || searchParams?.guest || "user";
  const guest = decodeURIComponent(guestRaw);

  if (!client_secret) {
    console.warn("No client_secret provided to Stripe Elements.");
    return <div className="p-8 text-center">Preparing payment...</div>;
  }

  return (
    <Elements
      key={client_secret}
      stripe={stripePromise}
      options={{
        clientSecret: client_secret,
        // appearance: { /* optional styling */ }
      }}
    >
      <Checkout id={id} guest={guest} />
    </Elements>
  );
}

function Checkout({ id, guest }: { id: string; guest: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const [isResponse, setIsResponse] = useState(false);
  const [intentStatus, setIntentStatus] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) {
        console.warn("Submit blocked: stripe or elements not ready.");
        return;
      }
      setLoading(true);
      setIntentStatus(null);

      try {
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            // Always include a return_url as a fallback (good practice)
            return_url: `${window.location.origin}/payments/complete?order=${id}`,
          },
          redirect: "if_required",
        });

        if (error) {
          console.error("Stripe confirmation error:", error);
          toast({
            variant: "destructive",
            title: "Payment failed",
            description: error.message || "Unexpected payment error.",
          });
        } else if (paymentIntent) {
          setIntentStatus(paymentIntent.status);
          switch (paymentIntent.status) {
            case "succeeded":
              toast({
                title: "Payment successful",
                description: "Your payment was confirmed.",
              });
              setIsResponse(true);
              break;
            case "processing":
              toast({
                title: "Payment processing",
                description:
                  "Your payment is processing. You’ll receive confirmation shortly.",
              });
              break;
            case "requires_action":
              toast({
                title: "Additional action required",
                description:
                  "If you were not prompted for authentication, please retry.",
              });
              break;
            default:
              toast({
                title: "Payment status",
                description: `Status: ${paymentIntent.status}`,
              });
          }
        } else {
          console.warn("Neither error nor paymentIntent returned.");
          toast({
            variant: "destructive",
            title: "Unknown state",
            description: "No response from payment confirmation.",
          });
        }
      } catch (err: any) {
        console.error("Exception during confirmPayment:", err);
        toast({
          variant: "destructive",
          title: "Exception",
          description: err?.message || "Unexpected exception occurred.",
        });
      } finally {
        setLoading(false);
      }
    },
    [stripe, elements, id, toast]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 pt-[300px] sm:pt-[100px] pb-[100px] px-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-[550px] flex-col items-center justify-center rounded-lg bg-white px-4 sm:px-10 py-10 shadow-lg"
      >
        <PaymentElement
          className="w-full"
          onReady={() => {
            console.log("PaymentElement ready");
            setPaymentReady(true);
          }}
          onBlur={() => console.log("PaymentElement blur")}
          onFocus={() => console.log("PaymentElement focus")}
        />
        <div className="mt-2 w-full text-xs text-gray-500">
          {(!stripe || !paymentReady) && "Initializing secure payment..."}
          {intentStatus && `Last status: ${intentStatus}`}
        </div>
        <Button
          type="submit"
          className="mt-5 w-full"
          disabled={!stripe || !paymentReady || loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
        </Button>
      </form>

      {isResponse && (
        <TicketSuccessModal
          guest={guest !== "user"}
          event={{ title: guest, orderId: id }}
          setIsResponse={setIsResponse}
        />
      )}
    </div>
  );
}
