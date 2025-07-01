"use client";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { TicketSuccessModal } from "@/components/ui/alert-dialog";

const stripePromise = loadStripe(
  "pk_live_51P8Se808P4tFOkILIuGcwOCzUfQrXKcx6uy8ufhmy6HS9gUV0THfuFkFkN2RQaCq4UBm0AgPXXHOhjTjSeQPNgtP008HJS6kpS"
);

// const { NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY } = process.env;

// const stripePromise = loadStripe(`${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`);

export default function StripePage({ params }: any) {
  const { client_secret, id, guest } = params;

  const decodedGuest = decodeURIComponent(guest);
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: client_secret,
      }}
    >
      <Checkout id={id} guest={decodedGuest} />
    </Elements>
  );
}

const Checkout = ({ id, guest }: any) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isResponse, setIsResponse] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false); // NEW

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (result.error) {
      toast({
        variant: "destructive",
        title: "An error occured",
        description: result.error.message,
      });
      setLoading(false);
      return;
    } else {
      setIsResponse(true);
      setLoading(false);
    }
  };

  return (
    <div className='fixed flex items-center justify-center pt-[300px] sm:pt-[100px] pb-[100px] px-4 max-w-screen-2xl min-h-screen overflow-scroll mx-auto inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'>
      <form
        onSubmit={handleSubmit}
        className='flex max-w-[550px] w-full rounded-lg bg-white flex-col px-4 sm:px-10 py-10 mx-auto items-center justify-center'
      >
        <PaymentElement
          className='w-full'
          onReady={() => setPaymentReady(true)} // NEW
        />
        <Button className='mt-5 w-full' disabled={!stripe || !paymentReady || loading}>
          {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : "Submit"}
        </Button>
      </form>
      {isResponse && (
        <TicketSuccessModal
          guest={guest === "user" ? false : true}
          event={{ title: guest, orderId: id }}
          setIsResponse={setIsResponse}
        />
      )}
    </div>
  );
};
