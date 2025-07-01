import React from "react";
import { AlarmCheckIcon, BadgeCheck, Ticket, UserCheck, Users, Wifi } from "lucide-react";
import { Reveal3, Reveal4 } from "../../animations/Text";
import { LandingContainer, LandingTitle, LandingWrapper } from "@/components/ui/containers";

const Features = () => {
  return (
    <LandingContainer className='py-10 md:top-[480px]' id='features'>
      <LandingTitle
        title='All-In-One Event Planning with Oyoyo'
        header='Features'
        text='Oyoyo Events App is a comprehensive event planning platform that offers'
      />
      <LandingWrapper className='md:grid-cols-3'>
        {features.map((feature, index) => (
          <div key={index} className='flex max-w-[400px] mx-auto w-full flex-col gap-2 items-center'>
            <Reveal4>
              <feature.icon className='bg-[#FCE5E4] text-red-700 rounded-md p-3 h-[43px] w-[43px]' />
            </Reveal4>
            <h6 className='text-center'>{feature.title}</h6>
            <Reveal3>
              <p className='text-center'>{feature.description}</p>
            </Reveal3>
          </div>
        ))}
      </LandingWrapper>
    </LandingContainer>
  );
};

export default Features;

const features = [
  {
    icon: Ticket,
    title: "Ticketing System",
    description: "Simplify ticket sales and guest list management for both free and paid events.",
  },
  {
    icon: Wifi,
    title: "Live Streaming",
    description: "Advanced AI features for budget management and scheduling.",
  },
  {
    icon: UserCheck,
    title: "Vendor Management",
    description: "Easily connect with verified vendors that fit your budget and requirements.",
  },
  {
    icon: Users,
    title: "Connect with customers",
    description: "Effortlessly handle RSVPs, seating arrangements, and guest lists.",
  },
  {
    icon: BadgeCheck,
    title: "Event Promotion",
    description: "Use integrated marketing tools to promote your event effectively.",
  },
  {
    icon: AlarmCheckIcon,
    title: "Real-Time Updates",
    description: "Keep everyone informed with instant notifications and updates.",
  },
];
