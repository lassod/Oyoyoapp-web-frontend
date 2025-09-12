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
      </div>

      <VerifyKyc />
    </Dashboard>
  );
};

export default KycPage;
