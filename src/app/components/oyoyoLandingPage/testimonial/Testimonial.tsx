import React from "react";
import Star from "../../assets/images/Star.png";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { LandingContainer, LandingTitle } from "@/components/ui/containers";

const Testimonial = () => {
  const plugin = React.useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));

  return (
    <LandingContainer id='testimonials' className='py-0 md:top-[480px]'>
      <LandingTitle header='testimonials' title='What our users are saying' />
      <Carousel
        plugins={[plugin.current]}
        className='max-w-[600px] w-full mx-auto bg-gray-50 rounded-[10px]'
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {testimonialData.map((item, index) => (
            <CarouselItem key={index}>
              <div className='flex flex-col gap-10 items-center justify-center p-10'>
                <h2 className='text-black text-center'>{item.title}</h2>
                <span className='flex flex-col gap-2 items-center justify-center'>
                  <Image src={item.star} alt='Star' />
                  <p className='text-black'>{item.name}</p>
                  <p>{item.text}</p>
                </span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </LandingContainer>
  );
};

export default Testimonial;

const testimonialData = [
  {
    title: "“Oyoyo Events App made planning my wedding a breeze”",
    star: Star,
    name: "Jane A",
    text: "Vendor",
  },
  {
    title: "“The vendor connection feature is a game-changer for our corporate events”",
    star: Star,
    name: "Mike O",
    text: "Customer",
  },
  {
    title: "“I love how I can manage everything from guest lists to seating with just one app”",
    star: Star,
    name: "Sarah K",
    text: "Customer",
  },
];
