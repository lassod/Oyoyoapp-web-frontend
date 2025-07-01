import Image from "next/image";
import React from "react";
import Googlestore from "../../assets/images/Googlestore.svg";
import Appstore from "../../assets/images/Appstore.svg";
import Iphone12 from "../../assets/images/Iphone12.png";
import Iphone13 from "../../assets/images/Iphone13.png";
import Link from "next/link";
import { Reveal3, Reveal5 } from "../../animations/Text";
import { LandingContainer, LandingWrapper } from "@/components/ui/containers";

const Download = ({ className }: { className?: string }) => {
  return (
    <LandingContainer id='contact' className={`max-w-[1580px] py-5 md:top-[500px] ${className}`}>
      <section className='relative max-w-[1380px] mx-auto w-full h-full'>
        <div className='rounded-[12px] md:rounded-[24px] absolute bg-red-700 -z-10 top-0 w-full h-full'></div>
        <LandingWrapper className='px-4 py-10 md:py-0'>
          <div className='flex max-w-[490px] flex-col gap-5 mx-auto'>
            <h2 className='text-white font-bold'>Download the Oyoyo Events App Today!</h2>
            <Reveal3>
              <p className='text-white'>Navigate our user-friendly app for seamless event planning and streaming.</p>
            </Reveal3>

            <div className='flex gap-3 my-3 pb-5 md:pb-0'>
              <Reveal5>
                <Link
                  target='_blank'
                  rel='noopener noreferrer'
                  href='https://apps.apple.com/zm/app/oyoyo-event/id6447293031'
                  className='btn'
                >
                  <Image src={Appstore} alt='Appstore' />
                </Link>
              </Reveal5>
              <Reveal5>
                <Link
                  target='_blank'
                  rel='noopener noreferrer'
                  href='https://play.google.com/store/apps/details?id=com.lassod.oyoyoevents&hl=vn'
                  className='btn'
                >
                  <Image src={Googlestore} alt='Googlestore' />
                </Link>
              </Reveal5>
            </div>
          </div>

          <div className='hidden relative max-w-[490px] md:flex items-center'>
            <Image src={Iphone12} alt='Iphone12' />
            <Image src={Iphone13} alt='Iphone13' className='absolute right-0 bottom-0 -z-10' />
          </div>
        </LandingWrapper>
      </section>
    </LandingContainer>
  );
};

export default Download;
