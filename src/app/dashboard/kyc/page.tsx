"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dashboard } from "@/components/ui/containers";
import VerifyKyc from "@/app/components/business/VerifyKyc";

const KycPage = () => {
  return (
    <Dashboard className='bg-white'>
      <div className='flex flex-row justify-between items-center'>
        <h3>Manage KYC</h3>
        <span className='flex gap-[16px]'>
          <Link href='/dashboard/event/new-event'>
            <Button className='max-w-[115px] sm:max-w-[140px]'>New event</Button>
          </Link>
        </span>
      </div>

      <VerifyKyc />
    </Dashboard>
  );
};

export default KycPage;
