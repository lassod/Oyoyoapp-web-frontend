import React from "react";
import Logo from "../../app/components/assets/images/OyoyoWhite.svg";
import Image from "next/image";
import Googlestore from "../../app/components/assets/images/Googlestore.svg";
import Appstore from "../../app/components/assets/images/Appstore.svg";
import Link from "next/link";
import { FacebookIcon, Instagram, Youtube } from "lucide-react";
import { Reveal3, Reveal5 } from "../../app/components/animations/Text";

const Footer = ({ className }: { className?: string }) => {
  return (
    <div className={`bg-red-700 relative ${className}`}>
      <div className='max-w-screen-xl lg:px-8 xl:px-24 px-4 py-10 mx-auto'>
        <div className='grid sm:grid-cols-[1fr,auto] gap-8 sm:gap-11 justify-between items-center'>
          <div className='flex flex-col gap-8'>
            <Image src={Logo} alt='Logo' />
            <Reveal3>
              <p className='text-white'>A user-friendly platform for event planning, ticketing and streaming.</p>
            </Reveal3>
            <Reveal3>
              <p className='text-white text-sm'>
               Address: Bookshop House 13th Floor, 50/52 Broad Street, Marina, Lagos
              </p>
            </Reveal3>
            <div className='flex gap-8 flex-wrap'>
              {footerData.map((item: any, index: number) => (
                <Link key={index} href={item.url} className='font-medium text-white'>
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
          <div className='flex flex-col gap-5'>
            <h5 className='text-white'>Get the app</h5>
            <Reveal5>
              <Link
                target='_blank'
                rel='noopener noreferrer'
                href='https://apps.apple.com/zm/app/oyoyo-event/id6447293031'
              >
                <Image src={Appstore} alt='Appstore' />
              </Link>
            </Reveal5>
            <Reveal5>
              <Link
                target='_blank'
                rel='noopener noreferrer'
                href='https://play.google.com/store/apps/details?id=com.lassod.oyoyoevents&hl=vn'
              >
                <Image src={Googlestore} alt='Googlestore' />
              </Link>
            </Reveal5>
          </div>
        </div>
        <div className='border-t flex flex-col items-center justify-center border-gray-200 mt-14 pt-10'>
          <p className='text-white'>© 2024 Oyoyo events. All rights reserved.</p>
          <div className='flex gap-5 mt-6'>
            <Reveal5>
              <Link href='https://www.youtube.com/channel/UCGBaVqXjFh2fPpOkd2I2-vQ'>
                <Youtube className='text-white' />
              </Link>
            </Reveal5>
            <Reveal5>
              <Link href='https://www.facebook.com/oyoyoapp'>
                <FacebookIcon className='text-white' />
              </Link>
            </Reveal5>
            <Reveal5>
              <Link href='.https://www.instagram.com/oyoyoeventsapp?igsh=MWk1MDIycGl0YWF6ZA=='>
                <Instagram className='text-white' />
              </Link>
            </Reveal5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;

const footerData = [
  {
    url: "/",
    title: "Home",
  },
  {
    url: "/#features",
    title: "Features",
  },
  {
    url: "/terms",
    title: "Terms",
  },
  {
    url: "/privacy",
    title: "Privacy",
  },
];
