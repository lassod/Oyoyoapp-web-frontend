"use client";
import { DashboardContainer } from "@/components/ui/containers";
import { ServiceHeader, Steps } from "../../components/business/serviceData/ServiceData";
import { FormsContainer, StepsContainer } from "@/components/ui/containers";
import { useSession } from "next-auth/react";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { Store } from "@/app/components/dashboard/settings/Store";

const Shop = () => {
  const { data: session, status } = useSession();

  const navigation = useRouter();
  const shopSetupData = {
    step: "Step 1 of 5",
    title: "Shop Setup",
    text: "Personalize your store to reflect your brand. Add your store name, upload a logo, and create an engaging store description to attract customers. Make sure your store stands out with a unique and professional appearance.",
  };

  if (status === "loading") return <SkeletonCard2 />;
  if (session?.user?.accountType === "PERSONAL") {
    navigation.back();
    return null;
  }
  return (
    <>
      <div className='dashBG'></div>
      <div className='relative mx-auto'>
        <ServiceHeader />
        <FormsContainer>
          <StepsContainer>
            <Steps data={shopSetupData} />
          </StepsContainer>

          <DashboardContainer className='py-10'>
            <Store isOverview={true} />
          </DashboardContainer>
        </FormsContainer>
      </div>
    </>
  );
};

export default Shop;
