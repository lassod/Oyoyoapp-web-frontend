import React from "react";
import Image from "next/image";
import Appstore from "../../assets/images/Appstore.png";
import GooglePlay from "../../assets/images/GooglePlay.png";
import Link from "next/link";
import MuxPlayer from "@mux/mux-player-react";
import { Reveal2 } from "../../animations/Text";
import { LandingContainer, LandingTitle, LandingWrapper } from "@/components/ui/containers";

const ExpectPage = () => {
  return (
    <LandingContainer className='top-[220px] md:top-[430px]'>
      <LandingTitle
        title='Effortless Event Management'
        text='Unlock Seamless Planning with Oyoyo Events App'
        header='What to expect'
      />
      <LandingWrapper>
        <div className='flex flex-col items-start justify-start gap-[5px] mx-auto'>
          <h3>Master Event Planning Effortlessly</h3>
          <Reveal2>
            <p className='my-1'>
              This all-in-one solution integrates everything you need to manage your events seamlessly. Whether
              you&apos;re an event planner, organizer, or enthusiast, Oyoyo Events App equips you with the essential
              tools and features to create unforgettable experiences effortlessly and with confidence.
            </p>
          </Reveal2>
          <div className='flex items-start justify-start gap-[15px] my-[15px]'>
            <Link
              className='max-w-[132px]'
              target='_blank'
              rel='noopener noreferrer'
              href='https://apps.apple.com/zm/app/oyoyo-event/id6447293031'
            >
              <Image src={Appstore} alt='Appstore' />
            </Link>
            <Link
              className='max-w-[132px]'
              target='_blank'
              rel='noopener noreferrer'
              href='https://play.google.com/store/apps/details?id=com.lassod.oyoyoevents&hl=vn'
            >
              <Image src={GooglePlay} alt='GooglePlay' />
            </Link>
          </div>
        </div>
        <MuxPlayer
          style={{
            maxWidth: "758px",
            borderRadius: "20px",
            overflow: "hidden",
            zIndex: "1",
          }}
          streamType='on-demand'
          playbackId='bWom3bfGjaTJ00YGG7TK3CcFd4lpEyrGXRZbLoiR9Ut4'
          metadataVideoTitle='Setting up a live event'
          primaryColor='#FFFFFF'
          secondaryColor='#000000'
        />
      </LandingWrapper>
    </LandingContainer>
  );
};

export default ExpectPage;
