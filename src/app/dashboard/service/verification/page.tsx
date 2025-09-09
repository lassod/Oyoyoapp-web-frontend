"use client";
import { ServiceHeader, Steps } from "@/app/components/business/serviceData/ServiceData";
import { FormsContainer, StepsContainer } from "@/components/ui/containers";
import { useSession } from "next-auth/react";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { DashboardContainer } from "@/components/ui/containers";
import VerifyKyc from "@/app/components/business/VerifyKyc";

const Verification = () => {
  const verificationSetupData = {
    step: "Step 4 of 5",
    title: "Verification Setup",
    text: "Complete the verification process by providing necessary documentation and information. This step is crucial to ensure the legitimacy of your business, build trust with customers, and comply with regulatory requirements.",
  };

  const { data: session, status } = useSession();
  const navigation = useRouter();

  if (status === "loading") return <SkeletonCard2 />;
  if (session?.user?.accountType === "PERSONAL") {
    navigation.back();
    return null;
  }
  return (
    <div>
      <div className='dashBG'></div>
      <div className='relative mx-auto'>
        <ServiceHeader />
        <FormsContainer>
          <StepsContainer>
            <Steps data={verificationSetupData} />
          </StepsContainer>
          <div className='pb-10 sm:bg-white'>
            <DashboardContainer>
              <VerifyKyc />
            </DashboardContainer>
          </div>
        </FormsContainer>
      </div>
    </div>
  );
};

export default Verification;
