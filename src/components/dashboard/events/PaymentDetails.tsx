import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, DollarSign, User, Calendar, ArrowRight } from "lucide-react";
import type React from "react"; // Import React

export default function ReferenceModal() {
  const paymentData = {
    transactionId: "2025-02-10T16:57:10.336Z",
    createdAt: "2025-02-10T16:57:10.336Z",
    amountPaid: 7.01,
    settlementAmount: 9662.62,
    orderId: 1221,
    status: "PENDING",
    paymentMethod: "PAYSTACK",
    transactionType: "CREDIT",
    description: "Platform commission fee: 3.5% of 6.68",
    reference: "0jugjlchzu",
    currency: "USD",
    symbol: "$",
    settlementCurrency: "NGN",
    settlementCurrencySymbol: "₦",
    exchangeRate: 1498.08,
    transactionFeeTotal: 0.33,
    transactionFeeDescription: "International Paystack fee: 3.9% + $0.07",
    vendor: {
      email: "niyex30@gmail.com",
      User: {
        username: "Jim",
        first_name: "Abdulkabir",
        last_name: "Abdulkareem",
      },
    },
    order: {
      orderStatus: "PENDING",
      quantity: 1,
      totalAmount: 6.68,
      OrderItems: [
        {
          fullName: "aubrey zulu",
          email: "aubreydarious@gmail.com",
          phoneNumber: "+260 97 4019095",
        },
      ],
    },
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-green-100 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto'>
        <Card className='backdrop-blur-sm bg-white/30 shadow-xl'>
          <CardHeader className='bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg'>
            <CardTitle className='text-3xl font-bold text-center'>Payment Confirmation</CardTitle>
            <p className='text-center opacity-75'>Transaction ID: {paymentData.transactionId}</p>
          </CardHeader>
          <CardContent className='p-6'>
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

              <div className='bg-gray-100 p-4 rounded-lg'>
                <h3 className='font-semibold mb-2 text-gray-700'>Transaction Details</h3>
                <p className='text-sm text-gray-600'>{paymentData.description}</p>
                <p className='text-sm text-gray-600 mt-2'>{paymentData.transactionFeeDescription}</p>
              </div>

              <div className='flex items-center justify-center space-x-4 text-lg font-semibold'>
                <span>
                  {paymentData.symbol}
                  {paymentData.amountPaid.toFixed(2)}
                </span>
                <ArrowRight className='text-blue-500' />
                <span>
                  {paymentData.settlementCurrencySymbol}
                  {paymentData.settlementAmount.toFixed(2)}
                </span>
              </div>
              <p className='text-center text-sm text-gray-500'>
                Exchange Rate: 1 {paymentData.currency} = {paymentData.exchangeRate.toFixed(2)}{" "}
                {paymentData.settlementCurrency}
              </p>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
                <div className='bg-blue-50 p-4 rounded-lg'>
                  <h3 className='font-semibold mb-2 text-blue-700'>Vendor Information</h3>
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
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div className='flex items-center space-x-3'>
      <div className='bg-blue-100 p-2 rounded-full'>
        <Icon className='w-6 h-6 text-blue-500' />
      </div>
      <div>
        <p className='text-sm text-gray-500'>{label}</p>
        <p className='font-semibold'>{value}</p>
      </div>
    </div>
  );
}

interface PaymentStatusProps {
  status: "SUCCESS" | "PENDING" | "FAILED";
}

export function PaymentStatus({ status }: PaymentStatusProps) {
  const statusConfig = {
    SUCCESS: {
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
