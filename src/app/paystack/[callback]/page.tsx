"use client";
import { TicketSuccessModal } from "@/components/ui/alert-dialog";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import { useGetTransactionByReference } from "@/hooks/guest";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

const Paystack = () => {
  const { data: session } = useSession();
  const [reference, setReference] = useState("");
  const [isResponse, setIsResponse] = useState(false);
  const { data: paymentData, status } = useGetTransactionByReference(reference);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref: any = params.get("reference"); // Extract the 'reference' parameter from the URL
    setReference(ref); // Set it in state for further use
  }, []);

  if (status !== "success") return <SkeletonCard2 />;
  return (
    <TicketSuccessModal
      isResponse={isResponse}
      setIsResponse={setIsResponse}
      guest={session?.user?.id ? false : true}
      event={{ ...paymentData, reference }}
    />
  );
};

export default Paystack;
