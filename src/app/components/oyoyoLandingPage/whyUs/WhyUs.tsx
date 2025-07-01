import React from "react";
import { BadgeCent, BadgeCheck, CloudLightning } from "lucide-react";
import { Reveal2, Reveal5 } from "../../animations/Text";
import { LandingContainer } from "@/components/ui/containers";

const WhyUs = () => {
  return (
    <LandingContainer className='max-w-[1580px] md:top-[480px] px-0 lg:px-0'>
      <div className='relative max-w-[1380px] mx-auto w-full h-full'>
        <div className='md:rounded-[24px] absolute bg-red-700 -z-10 top-0 w-full h-full'></div>
        <div className='max-w-[1200px] flex flex-col gap-[45px] mx-auto overflow-y-auto py-[40px] px-4 md:py-[40px] md:px-[40px] lg:py-[50px] lg:px-[40px]'>
          <div className='max-w-[600px] items-center justify-center flex flex-col gap-2 mx-auto'>
            <h3 className='font-bold text-white'>Why use our app?</h3>
            <h5 className='text-white'>When Should You Use Oyoyo Events App?</h5>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 items-center justify-center gap-[15px] md:gap-5 mx-auto'>
            {whyUsData.map((item: any, index: number) => (
              <div key={index} className='flex flex-col gap-1 border border-[#fce5e433] rounded-[10px] px-5 py-[30px]'>
                <Reveal5>
                  <item.icon className='bg-[#FCE5E433] text-white rounded-full p-3 h-[43px] w-[43px]' />
                </Reveal5>
                <p className='text-white font-bold mt-2'>{item.title}</p>
                <Reveal2>
                  <p className='text-white'>{item.text}</p>
                </Reveal2>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LandingContainer>
  );
};

export default WhyUs;

const whyUsData = [
  {
    icon: BadgeCent,
    title: "Versatile Event Planning",
    text: "When planning any type of event be it corporate, social, personal or virtual.",
  },
  {
    icon: CloudLightning,
    title: "Maximize Event Planning",
    text: "When looking to enhance the quality and efficiency of your event planning process.",
  },
  {
    icon: BadgeCheck,
    title: "Boost Event Reach & Impact",
    text: "When aiming to increase the reach and impact of your events.",
  },
];
