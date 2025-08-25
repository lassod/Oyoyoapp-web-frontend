"use client";
import { Dashboard, DashboardContainerContent } from "@/components/ui/containers";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Mastercard from "../../app/components/assets/images/Mastercard.png";
import { LucideMapPin, PrinterIcon } from "lucide-react";
import { DashboardHeader, DashboardHeaderText } from "@/components/ui/containers";
import { useGetUser } from "@/hooks/user";
import { useGetOrder } from "@/hooks/orders";

const ViewTransaction = () => {
  const [subTotal, setSubTotal] = useState(0);
  const [transaction, setTransaction] = useState<any>({});
  const { data: user } = useGetUser();
  const { data: order } = useGetOrder(transaction?.orderId);

  useEffect(() => {
    const savedTransact = sessionStorage.getItem("selectedTransact");
    if (savedTransact) setTransaction(JSON.parse(savedTransact));
  }, []);

  useEffect(() => {
    if (transaction) {
      const amount = transaction.amountPaid || 0;
      const commission = transaction.transactionFeeTotal || 0;
      setSubTotal(amount - commission);
    }
  }, [transaction]);
  return (
    <Dashboard className='relative mx-auto pt-[145px]'>
      <DashboardHeader className='justify-between'>
        <DashboardHeaderText>View Transaction / {transaction?.id || transaction?.transactionId}</DashboardHeaderText>

        <span>
          <Button
            onClick={() => window.print()}
            className='flex relative max-w-[120px] sm:max-w-[200px] w-full items-center gap-[8px]'
          >
            Print Receipt
            <PrinterIcon className='hidden sm:block h-[20px] w-[20px]' />
          </Button>
        </span>
      </DashboardHeader>

      <DashboardContainerContent type={1}>
        <div className='bg-white p-4 rounded-lg md:mt-3 md:ml-3'>
          {order &&
            transaction?.purpose === "TICKET_PURCHASE" &&
            order?.OrderItems?.map((item: any) => (
              <div className='flex bg-white flex-col gap-2 rounded-md border border-gray-200 px-4 py-3'>
                <div className='grid grid-cols-1 sm:grid-cols-[100px,1fr] sm:flex-row gap-2 items-center'>
                  <div className='w-full sm:w-[100px] h-[130px] sm:h-[100px] overflow-hidden rounded-lg'>
                    <Image
                      className='w-full object-cover h-full'
                      src={item?.Event_Plans?.Events?.media[0]}
                      width={100}
                      height={100}
                      alt='Image'
                    />
                  </div>

                  <div className='flex justify-between gap-6'>
                    <div className='flex flex-col gap-[4px]'>
                      <h6>{item?.Event_Plans?.name}</h6>
                      <div className='flex gap-2'>
                        <p>Category: </p>
                        <p className='text-black'>
                          {transaction?.purpose === "TICKET_PURCHASE" ? "Tickets" : "Services"}
                        </p>
                      </div>
                      <div className='flex gap-2'>
                        <p>Type: </p>
                        <p className='text-black'>{order?.orderType}</p>
                      </div>
                    </div>
                    <div className='flex flex-col gap-2'>
                      <span>x{item.quantity}</span>
                      <h6>
                        {transaction?.symbol}
                        {item?.price.toLocaleString() || 0}
                      </h6>
                    </div>
                  </div>
                </div>
                <p>{item?.Event_Plans?.description}</p>
              </div>
            ))}

          <div className='flex bg-white flex-col gap-4 rounded-md border border-gray-200 px-4 py-3'>
            <div className='flex flex-col gap-2'>
              <div className='flex justify-between gap-4'>
                <p>Subtotal</p>
                <p className='text-black'>
                  {transaction?.symbol}
                  {subTotal?.toLocaleString() || 0}
                </p>
              </div>
              <div className='flex justify-between gap-4'>
                <p>Shipping fee</p>
                <p className='text-black'>{transaction?.symbol} 0</p>
                {/* <p className="text-black">
                      {transaction?.symbol} {data.price}</p> */}
              </div>
              <div className='flex justify-between gap-4'>
                <p>Handling fee</p>
                {/* <p className="text-black">
                      {transaction?.symbol} {data.price}
                    </p> */}
                <p className='text-black'>{transaction?.symbol} 0</p>
              </div>
              <div className='flex justify-between gap-4'>
                <p>Commission</p>
                {/* <p className="text-black">
                      {transaction?.symbol} {data.price}
                    </p> */}
                <p className='text-black'>
                  {transaction?.symbol}
                  {transaction?.transactionFeeTotal?.toLocaleString() || 0}
                  {/* {transaction?.transactionFeeTotal?.toLocaleString() || 0} */}
                </p>
              </div>
              <div className='flex justify-between gap-4'>
                <p>Total</p>
                <p className='text-black'>
                  {transaction?.symbol}
                  {transaction?.amountPaid?.toLocaleString() || 0}
                </p>
              </div>
            </div>
            <div className='flex justify-between gap-4'>
              <p className='text-black font-medium'>Amount to be paid</p>
              <p className='text-red-700 font-medium'>
                {transaction?.symbol}
                {transaction?.amountPaid?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white p-4 md:p-5 flex flex-col gap-4'>
          <div className='flex flex-col gap-[16px] pt-2 pb-6 border-b border-gray-200'>
            <h3>Order Status</h3>
            <p className='flex items-centertext-black font-medium'>
              Order ID: <p className='text-red-700 ml-1'>{transaction?.orderId}</p>
            </p>
            {transaction?.status === "COMPLETED" ? (
              <div className='py-1 text-center px-2 text-sm bg-green-100 text-green-700 font-medium rounded-md w-[90px]'>
                Completed
              </div>
            ) : transaction?.status === "CANCELLED" ? (
              <div className='py-1 text-center px-2 text-red-700  text-sm rounded-md bg-red-100 max-w-[90px] font-medium'>
                Cancelled
              </div>
            ) : (
              <div className='py-1 text-center px-2 text-yellow-700  text-sm rounded-md bg-yellow-100 max-w-[75px] font-medium'>
                Pending
              </div>
            )}
          </div>
          <div className='flex flex-col gap-4 py-4 border-b border-gray-200'>
            <span>
              {transaction?.purpose === "TICKET_PURCHASE" && transaction?.user?.first_name ? "Customer" : "Vendor"}
            </span>
            <div className='flex items-center gap-2'>
              <Image
                className='w-[40px] h-[40px] rounded-full'
                width={60}
                height={60}
                src={
                  transaction?.purpose === "TICKET_PURCHASE" && transaction?.user?.first_name
                    ? transaction?.user?.avatar || "/noavatar.png"
                    : order?.vendor?.User?.avatar || "/noavatar.png"
                }
                alt='Zac'
              />
              <p className='text-black font-medium'>
                {transaction?.purpose === "TICKET_PURCHASE" && transaction?.user?.first_name
                  ? `${transaction?.user?.first_name || "--"} ${transaction?.user?.last_name || "--"}`
                  : `${order?.vendor?.User?.first_name || "--"} ${order?.vendor?.User?.last_name || "--"}`}
              </p>
            </div>
          </div>
          <div className='flex flex-col gap-4 py-4 border-b border-gray-200'>
            <span>Delivery Information</span>
            <div className='flex gap-2 items-center'>
              <span className='border border-gray-200 rounded-full p-1'>
                <LucideMapPin className='text-gray-500' />
              </span>
              <div className='flex flex-col gap-1'>
                <p className='font-medium black'>
                  {user?.state ? `${user?.state},` : null} {user?.country || "--"}
                </p>
              </div>
            </div>
          </div>
          <div className='flex flex-col gap-2 py-4'>
            <span>Payment Information</span>
            <div className='flex gap-2 items-center mt-2'>
              <Image src={Mastercard} alt='Mastercard' className='w-[32px]' />
              <div className='flex flex-col gap-1'>
                <p className='text-black font-medium'>{transaction?.paymentGateWay || "NIL"}</p>
                {/* <p className='text-black font-medium'>**** **** **** *819</p> */}
              </div>
            </div>
            {/* <div className="flex gap-2 items-center">
                  <span className="border border-gray-200 rounded-full p-1">
                    <LucideMapPin className="text-gray-500" />
                  </span>
                  <div className="flex flex-col gap-0">
                    <p className="text-black font-medium">Lagos</p>
                    <p className="text-black font-medium">Nigeria</p>
                  </div>
                </div> */}
          </div>
        </div>
      </DashboardContainerContent>
    </Dashboard>
  );
};

export default ViewTransaction;
