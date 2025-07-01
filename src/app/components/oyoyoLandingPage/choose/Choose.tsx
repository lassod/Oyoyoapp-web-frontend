import React from "react";
import Image from "next/image";
import Canon from "../../assets/images/Canon.jpg";
import { CheckCircle } from "lucide-react";
import { Reveal1, Reveal3 } from "../../animations/Text";
import { LandingContainer } from "@/components/ui/containers";

const Choose = () => {
  return (
    <LandingContainer
      className='md:grid md:top-[450px] flex-col-reverse md:grid-cols-2 py-10 md:items-center md:justify-center'
      id='about'
    >
      <Image src={Canon} alt='Phone' className='max-h-[400px] md:max-h-full object-contain' />
      <div className='flex flex-col gap-2'>
        <Reveal1>
          <h3>Why Choose Oyoyo Events App?</h3>
        </Reveal1>
        <p className='mb-3'>Oyoyo Events App transforms the event planning process by:</p>
        <div className='flex flex-col gap-3 pl-4'>
          <span className='flex gap-2 '>
            <CheckCircle className='text-red-700 h-[23.3px] max-w-[23.3px] w-full' />
            <Reveal3>
              <p>Reducing Stress: Simplifies complex tasks, allowing you to focus on creativity.</p>
            </Reveal3>
          </span>
          <span className='flex gap-2'>
            <CheckCircle className='text-red-700 h-[23.3px] max-w-[23.3px] w-full' />
            <Reveal3>
              <p>Enhancing Efficiency: Streamlines workflows with integrated tools and features.</p>
            </Reveal3>
          </span>
          <span className='flex gap-2'>
            <CheckCircle className='text-red-700 h-[23.3px] max-w-[23.3px] w-full' />
            <Reveal3>
              <p>Increasing Visibility: Promotes your events and vendor services to a wider audience.</p>
            </Reveal3>
          </span>
          <span className='flex gap-2'>
            <CheckCircle className='text-red-700 h-[23.3px] max-w-[23.3px] w-full' />
            <Reveal3>
              <p>Improving Communication: Facilitates seamless interaction between planners, vendors, and attendees.</p>
            </Reveal3>
          </span>
        </div>
      </div>
    </LandingContainer>
  );
};

export default Choose;
