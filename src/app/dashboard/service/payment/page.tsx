"use client";
import React from "react";
import { ServiceHeader, Steps, PaymentSetup } from "@/app/components/business/serviceData/ServiceData";
import { FormsContainer, StepsContainer } from "@/components/ui/containers";
import { useSession } from "next-auth/react";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

const Payment = () => {
  const paymentSetupData = {
    step: "Step 3 of 5",
    title: "Payment Setup",
    text: "Configure your preferred payment methods to ensure smooth and secure transactions. Add your banking details, and set up payment preferences to provide flexibility for your customers.",
  };

  const navigation = useRouter();
  const { data: session, status } = useSession();

  if (status === "loading") return <SkeletonCard2 />;
  if (session?.user?.accountType === "PERSONAL") {
    navigation.back(); // Redirect user back but don't render void
    return null; // Return null to render nothing while navigating
  }
  return (
    <div>
      <div className='dashBG'></div>
      <div className='relative mx-auto'>
        <ServiceHeader />
        <FormsContainer>
          <StepsContainer>
            <Steps data={paymentSetupData} />
          </StepsContainer>
          <div className='pt-10 pb-20 bg-white'>
            <PaymentSetup />
          </div>
        </FormsContainer>
      </div>
    </div>
  );
};

export default Payment;
