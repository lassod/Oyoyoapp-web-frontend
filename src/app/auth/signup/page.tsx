"use client";
import Image from "next/image";
import React, { useState } from "react";
import Oyoyo from "../../components/assets/images/Oyoyo.svg";
import Background from "../../components/authBackground/Background";
import SignupEmail from "@/app/components/forms/SignupEmail/SignUpEmail";
import { Briefcase, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Signup = () => {
  const [personal, setPersonal] = useState(false);
  const [business, setBusiness] = useState(false);
  const [proceed, setProceed] = useState(false);
  const [account, setAccount] = useState(false);
  const [active, setActive] = useState(false);

  const handleBusiness = () => {
    setProceed(true);
    setBusiness(true);
    setPersonal(false);
  };
  const handlePersonal = () => {
    setProceed(true);
    setPersonal(true);
    setBusiness(false);
    setAccount(true);
  };

  return (
    <section className='min-h-screen flex items-center justify-center py-[50px]'>
      <Background />

      {active ? (
        <SignupEmail personal={account} />
      ) : (
        <div className='bg-white w-full max-w-[500px] rounded-[20px] px-4 sm:px-[30px] py-[50px]'>
          <Image src={Oyoyo} alt='Envelope' />
          <h2 className='font-bold text-[30px] mt-5'>Choose an account type</h2>
          <p className='my-2'>Choose the account type that best suits your needs</p>

          <div className='grid sm:grid-cols-2 gap-3 my-5'>
            <span
              onClick={handlePersonal}
              className={`border hover:border-red-700 rounded-[8px] px-4 py-6 relative items-center flex flex-col gap-2 ${
                personal && "border-red-700"
              }`}
            >
              <User2 className='h-10 w-10' />
              <h6>Personal Account</h6>
              <p className='text-xs text-center'>Ideal for event attendees looking to discover and book events.</p>
            </span>
            <span
              onClick={handleBusiness}
              className={`border hover:border-red-700 rounded-[8px] px-4 py-6 relative items-center flex flex-col gap-2 ${
                business && "border-red-700"
              }`}
            >
              <Briefcase className='h-10 w-10' />
              <h6>Business Account</h6>
              <p className='text-xs text-center'>Ideal for event hosts, vendors, and service providers.</p>
            </span>
          </div>
          <Button className='w-full mt-5' disabled={!proceed} onClick={() => setActive(true)}>
            Proceed
          </Button>
        </div>
      )}
    </section>
  );
};

export default Signup;
