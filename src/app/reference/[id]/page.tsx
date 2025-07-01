"use client";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, DollarSign, User, Calendar } from "lucide-react";
import type React from "react"; // Import React
import { useGetTransactionByReference } from "@/hooks/guest";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import Oyoyo from "../../components/assets/images/Oyoyo.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const ReferenceModal = ({ params }: any) => {
  const { id } = params;
  const { data: paymentData, status } = useGetTransactionByReference(id);
  const router = useRouter();

  console.log(paymentData);
  if (status !== "success") return <SkeletonCard2 />;
  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-green-100 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto'>
        <Card className='backdrop-blur-sm bg-white/30 shadow-xl'>
          <CardHeader className='bg-gradient-to-r from-red-500 via-red-700 to-red-800 text-white rounded-t-lg'>
            <CardTitle className='text-3xl font-bold text-center'>Payment Confirmation</CardTitle>
            <p className='text-center text-white'>Transaction ID: {paymentData.transactionId}</p>
          </CardHeader>
          <CardContent className='p-6 relative'>
            <div className='w-full h-full absolute mt-[-100px] flex items-center justify-center'>
              <Image src={Oyoyo} alt='Oyoyo' className='max-w-[200px] w-full opacity-10' />
            </div>
            <div className='space-y-8'>
              <div className='flex justify-between items-center'>
                <span className='text-gray-600 font-medium'>Status:</span>
                {/** @ts-ignore */}
                <PaymentStatus status={paymentData.status} />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <InfoItem
                  icon={DollarSign}
                  label='Amount Paid'
                  value={`${paymentData.symbol}${paymentData.amountPaid.toFixed(2)}`}
                />
                <InfoItem icon={CreditCard} label='Payment Method' value={paymentData.paymentMethod} />
                <InfoItem icon={Calendar} label='Date' value={new Date(paymentData.createdAt).toLocaleDateString()} />
                <InfoItem icon={User} label='Order ID' value={paymentData.orderId.toString()} />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
                <div className='bg-blue-50 p-4 rounded-lg'>
                  <h3 className='font-semibold mb-2 text-red-700'>Vendor Information</h3>
                  <p className='text-sm'>
                    {paymentData.vendor.User.first_name} {paymentData.vendor.User.last_name}
                  </p>
                  <p className='text-sm'>{paymentData.vendor.email}</p>
                </div>
                <div className='bg-green-50 p-4 rounded-lg'>
                  <h3 className='font-semibold mb-2 text-green-700'>Customer Information</h3>
                  <p className='text-sm'>{paymentData.order.OrderItems[0].fullName}</p>
                  <p className='text-sm'>{paymentData.order.OrderItems[0].email}</p>
                  <p className='text-sm'>{paymentData.order.OrderItems[0].phoneNumber}</p>
                  {paymentData?.order?.quantity > 1 && (
                    <p className='text-sm text-black mt-2 font-medium'>and others</p>
                  )}
                </div>
              </div>
              <div className='h-11'></div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className='!z-50 relative mt-[-70px] max-w-[300px] mx-auto flex gap-2'>
        <Button variant={"secondary"} onClick={() => router.push("/guest/events")}>
          Back to home
        </Button>
        <Button onClick={() => (window.location.href = `/guest/view-ticket`)}>Buy more tickets</Button>
      </div>
    </div>
  );
};

export default ReferenceModal;

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div className='flex items-center space-x-3'>
      <div className='bg-red-50 p-2 rounded-full'>
        <Icon className='w-6 h-6 text-red-500' />
      </div>
      <div>
        <p className='text-sm text-gray-500'>{label}</p>
        <p className='font-semibold'>{value}</p>
      </div>
    </div>
  );
}

interface PaymentStatusProps {
  status: "COMPLETED" | "PENDING" | "FAILED";
}

function PaymentStatus({ status }: PaymentStatusProps) {
  const statusConfig = {
    COMPLETED: {
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    PENDING: {
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-100",
    },
    FAILED: { icon: XCircle, color: "text-red-500", bgColor: "bg-red-100" },
  };

  const {
    icon: Icon,
    color,
    bgColor,
  } = statusConfig[status] || {
    icon: AlertTriangle,
    color: "text-gray-500",
    bgColor: "bg-gray-100",
  };

  return (
    <div className={`flex items-center ${color} ${bgColor} px-3 py-1 rounded-full`}>
      <Icon className='w-5 h-5 mr-2' />
      <span className='font-semibold text-sm'>{status}</span>
    </div>
  );
}
