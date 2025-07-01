import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LandingContainer, LandingTitle } from "@/components/ui/containers";

const Faq = () => {
  return (
    <LandingContainer id='faq' className='md:top-[490px]'>
      <LandingTitle title='Frequently asked questions' text='Everything you need to know about oyoyo event app' />
      <div className='max-w-[700px] mx-auto'>
        <Accordion type='single' collapsible>
          {faqData.map((item, index) => (
            <AccordionItem value={item.title} key={index}>
              <AccordionTrigger>{item.title}</AccordionTrigger>
              <AccordionContent>{item.text}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </LandingContainer>
  );
};

export default Faq;

const faqData = [
  {
    title: "How does the Oyoyo Events App simplify event planning?",
    text: "Our app offers a range of tools including AI-powered planning, vendor connections, ticketing, and guest management to streamline the planning process.",
  },
  {
    title: "Can I use Oyoyo Events App for both small and large events?",
    text: " Yes, Oyoyo Events App is designed to cater to events of all sizes, from intimate gatherings to large-scale conferences.",
  },
  {
    title: "How do I get started with Oyoyo Events App?",
    text: "Simply download the app from the Play Store or App Store, create an account, and start planning your event with our intuitive tools.",
  },
];
