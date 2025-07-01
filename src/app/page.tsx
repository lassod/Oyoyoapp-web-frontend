"use client";
import React from "react";
import Expect from "./components/oyoyoLandingPage/Expect/Expect";
import Choose from "./components/oyoyoLandingPage/choose/Choose";
import Features from "./components/oyoyoLandingPage/features/Features";
import Download from "./components/oyoyoLandingPage/download/Download";
import WhyUs from "./components/oyoyoLandingPage/whyUs/WhyUs";
import HeroPage from "./components/oyoyoLandingPage/Hero/Hero";
import Testimonial from "./components/oyoyoLandingPage/testimonial/Testimonial";
import Faq from "./components/oyoyoLandingPage/faq/Faq";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <HeroPage />
      <Expect />
      <Choose />
      <Features />
      <WhyUs />
      <Testimonial />
      <Faq />
      <Download />
      <Footer className='top-[186px] md:top-[586px]' />
    </main>
  );
}
