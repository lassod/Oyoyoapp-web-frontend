"use client";
import { Dashboard, DashboardContainerContent } from "@/components/ui/containers";
import { LogoLoader, SkeletonCard2 } from "@/components/ui/skeleton";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Mastercard from "../../../../components/assets/images/Mastercard.png";
import { LucideMapPin, MoreVertical, PrinterIcon } from "lucide-react";
import { DashboardHeader, DashboardHeaderText } from "@/components/ui/containers";
import { orderKeys, useGetOrder } from "@/hooks/orders";
import { useGetUser } from "@/hooks/user";
import {
  AcceptOrder,
  CancelOrderUser,
  CompletedOrderUser,
  RejectOrder,
} from "@/app/components/business/orderData/OrderData";
import { AlertDialog, AlertDialogTrigger, TicketSuccessModal } from "@/components/ui/alert-dialog";
import { Review } from "@/app/components/business/Review";
import { serviceKeys, useGetService } from "@/hooks/services";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

declare var PaystackPop: {
  setup: (options: {
    key: string;
    email: string;
    currency: string;
    amount: number;
    ref?: string;
    onClose?: () => void;
    callback: (response: { status: string; reference: string }) => void;
  }) => {
    openIframe: () => void;
  };
};

const View = ({ params }: { params: { orderId: string } }) => {
  const { orderId } = params;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [data, setData] = useState<any>(null); // Initially null
  const { data: user } = useGetUser();
  const { data: transaction, status } = useGetOrder(parseInt(orderId));
  const { data: service, status: serviceStatus } = useGetService(data?.orderTypeDetail?.ServiceId);
  const [isVendor, setIsVendor] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResponse, setIsResponse] = useState(false);
  const [total, setTotal] = useState(0);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (transaction && user) {
      setData(transaction);
      if (transaction?.transactionRef?.[0]?.recieverId === user?.id) setIsVendor(true);
    } else setData(transaction);
  }, [transaction, user]);

  // const handleSubmit = (data: any) => {
  //   let handler = PaystackPop.setup({
  //     key: `${process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!}`,
  //     email: data.email,
  //     currency: "NGN",
  //     amount: data.amount * 100,
  //     ref: data.reference,

  //     callback: (res) => {
  //       if (res?.status === "success") {
  //         // setReference(res?.reference);
  //         setIsResponse(true);

  //         queryClient.invalidateQueries({
  //           queryKey: [orderKeys.order, orderId],
  //         });
  //         queryClient.invalidateQueries({
  //           queryKey: [serviceKeys.service, data?.orderTypeDetail?.ServiceId],
  //         });
  //       }
  //     },
  //   });
  // };

  const onSubmit = () => {
    setIsLoading(true);
    if (data?.transactionRef[0]?.paymentGateway === "PAYSTACK")
      // handleSubmit({
      //   reference: data?.transactionRef[0]?.reference,
      //   amount: data?.transactionRef[0]?.amountPaid,
      //   email: data?.transactionRef[0]?.email,
      // });
      router.push(
        data?.transactionRef[0]?.authorization_url ||
          data?.transactionRef[0]?.paymentGatewayTransitionInfo?.authorization_url
      );
    else if (data?.transactionRef[0].paymentGateWay === "STRIPE")
      window.location.href = `/payment/stripe/${data?.transactionRef[0].paymentGatewayTransitionInfo.client_secret}/${data?.id}/user`;
    else {
    }
  };

  const handlePrint = () => {
    window.print();
  };
  useEffect(() => {
    if (data) {
      let total = 0;
      if (data?.totalAmount + data?.transactionRef?.[0]?.transactionFeeTotal)
        total = data?.totalAmount + data?.transactionRef?.[0]?.transactionFeeTotal;
      // if (data?.transactionRef?.[0]?.settlementAmount) total += data?.transactionRef?.[0]?.settlementAmount;

      setTotal(total);
    }
  }, [data]);

  if (status !== "success" && serviceStatus !== "success") return <SkeletonCard2 />;
  return (
    <Dashboard className='relative mx-auto pt-[145px]'>
      <DashboardHeader>
        <DashboardHeaderText>View Order / {data?.id}</DashboardHeaderText>

        {/* Ellipsis menu for smaller screens */}
        <div className='relative sm:hidden'>
          <MoreVertical
            className='hover:text-red-700 cursor-pointer'
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          />
          <div
            className={`${
              isDropdownOpen ? "block" : "hidden"
            } absolute right-0 mt-2 p-4 max-w-48 bg-white rounded-lg shadow-md`}
          >
            {data?.orderStatus === "CONFIRMED" &&
            !isVendor &&
            data?.transactionRef[0]?.purpose !== "TICKET_PURCHASE" ? (
              <span className='flex-col sm:flex-row max-w-[422px] gap-[10px] hidden sm:flex'>
                <CancelOrderUser id={data?.id} />
                <CompletedOrderUser order={data} />
              </span>
            ) : data?.orderStatus === "COMPLETED" ? (
              <span className='max-w-[400px] gap-[10px] flex'>
                {(!isVendor && data?.transactionRef[0]?.purpose !== "TICKET_PURCHASE") ||
                  (!isVendor && data?.orderType !== "Event_Plans" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant={"secondary"}>Review</Button>
                      </AlertDialogTrigger>
                      <Review VendorId={data?.vendorId} />
                    </AlertDialog>
                  ))}
                <Button onClick={handlePrint} className='flex sm:px-5 justify-center items-center gap-[8px]'>
                  Print Receipt
                  <PrinterIcon className='h-5 w-5' />
                </Button>
              </span>
            ) : isVendor && data?.orderStatus === "PENDING" ? (
              <span className='flex-col sm:flex-row max-w-[422px] gap-[10px] flex'>
                <RejectOrder id={data?.id} />
                <AcceptOrder order={data} />
              </span>
            ) : (
              <Button onClick={handlePrint} className='flex mr-0 sm:px-5 justify-center items-center gap-[8px]'>
                Print Receipt
              </Button>
            )}
          </div>
        </div>

        {/* For larger screens, show the buttons inline */}
        {data?.orderStatus === "CONFIRMED" && !isVendor ? (
          <span className='flex-col sm:flex-row max-w-[422px] gap-[10px] hidden sm:flex'>
            <CancelOrderUser id={data?.id} />
            <CompletedOrderUser order={data} />
          </span>
        ) : data?.orderStatus === "COMPLETED" ? (
          <span className='max-w-[400px] gap-[10px] hidden sm:flex'>
            {(!isVendor && data?.transactionRef[0]?.purpose !== "TICKET_PURCHASE") ||
              (!isVendor && data?.orderType !== "Event_Plans" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant={"secondary"}>Review</Button>
                  </AlertDialogTrigger>
                  <Review VendorId={data?.vendorId} />
                </AlertDialog>
              ))}
            <Button onClick={handlePrint} className='flex sm:px-5 justify-center items-center gap-[8px]'>
              Print Receipt
              <PrinterIcon className='h-5 w-5' />
            </Button>
          </span>
        ) : isVendor && data?.orderStatus === "PENDING" && data?.transactionRef[0]?.purpose !== "TICKET_PURCHASE" ? (
          <span className='flex-col sm:flex-row max-w-[422px] gap-[10px] hidden sm:flex'>
            <RejectOrder id={data?.id} />
            <AcceptOrder order={data} />
          </span>
        ) : (
          <Button onClick={handlePrint} className='hidden sm:flex mr-0 sm:px-5 justify-center items-center gap-[8px]'>
            Print Receipt
            <PrinterIcon className='h-5 w-5' />
          </Button>
        )}
      </DashboardHeader>

      <DashboardContainerContent type={1}>
        <div className='bg-white p-4 rounded-lg md:mt-3 md:ml-3'>
          {data?.OrderItems?.map((item: any) => (
            <div className='flex bg-white flex-col gap-2 rounded-md border border-gray-200 px-4 py-3'>
              <div className='grid grid-cols-1 sm:grid-cols-[100px,1fr] sm:flex-row gap-2 items-center'>
                <div className='w-full sm:w-[100px] h-[130px] sm:h-[100px] overflow-hidden rounded-lg'>
                  <Image
                    className='w-full object-cover h-full'
                    src={item?.Event_Plans?.Events?.media[0] || service?.media[0]}
                    width={100}
                    height={100}
                    alt='Image'
                  />
                </div>

                <div className='flex justify-between gap-6'>
                  <div className='flex flex-col gap-[4px]'>
                    <h6>{item?.Event_Plans?.name}</h6>
                    {/* <div className='flex gap-2'>
                      <p>Category: </p>
                      <p className='text-black'>{data?.orderTypeDetail?.name} </p>
                    </div> */}
                    <div className='flex gap-2'>
                      <p>Type: </p>
                      <p className='text-black'>{data?.transactionRef?.[0]?.purpose}</p>
                    </div>
                  </div>
                  <div className='flex flex-col gap-2'>
                    <span>x{item.quantity || "1"}</span>
                    {/* <h6>
                      {data?.symbol} {item?.priceInSettlementCurrency.toLocaleString()}
                    </h6> */}
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
                <p className='text-black'>{`${data?.symbol} ${
                  data?.totalAmount.toLocaleString() || 0
                  // data?.transactionRef?.[0]?.settlementAmount.toLocaleString() || 0
                }`}</p>
              </div>
              <div className='flex justify-between gap-4'>
                <p>Shipping fee</p>
                <p className='text-black'>{`${data?.symbol} `}0</p>
                {/* <p className="text-black">
                      ₦ {data?.transactionRef?.[0]?.price}</p> */}
              </div>
              <div className='flex justify-between gap-4'>
                <p>Handling fee</p>
                {/* <p className="text-black">
                      ₦ {data?.transactionRef?.[0]?.price}
                    </p> */}
                <p className='text-black'>{`${data?.symbol} `}0</p>
              </div>
              <div className='flex justify-between gap-4'>
                <p>Transaction fee</p>
                {/* <p className="text-black">
                      ₦ {data?.transactionRef?.[0]?.price}
                    </p> */}
                <p className='text-black'>{`${data?.symbol} ${
                  data?.transactionRef?.[0]?.transactionFeeTotal?.toLocaleString() || 0
                }`}</p>
              </div>
              <div className='flex justify-between gap-4'>
                <p>Total</p>
                <p className='text-black'>{`${data?.symbol} ${total.toLocaleString() || 0}`}</p>
              </div>
            </div>
            <div className='flex justify-between gap-4'>
              <p className='text-black font-medium'>Amount to be paid</p>
              <p className='text-red-700 font-medium'>{`${data?.symbol} ${total.toLocaleString() || 0}`}</p>
            </div>
          </div>
        </div>

        <div className='bg-white p-4 md:p-5 flex flex-col gap-4'>
          <div className='flex flex-col gap-[16px] pt-2 pb-6 border-b border-gray-200'>
            <h3>Order Status</h3>
            <p className='flex items-centertext-black font-medium'>
              Order ID: <p className='text-red-700 ml-1'>{data?.id}</p>
            </p>
            {data?.orderStatus === "COMPLETED" || data?.orderStatus === "CONFIRMED" ? (
              <div className='py-1 text-center px-2 text-sm bg-green-100 text-green-700 font-medium rounded-md w-[110px]'>
                {data?.orderStatus}
              </div>
            ) : data?.orderStatus === "PAYMENT_COMPLETED" ? (
              <div className='py-1 text-center px-2 text-sm bg-green-100 text-green-700 font-medium rounded-md w-[180px]'>
                {data?.orderStatus}
              </div>
            ) : data?.orderStatus === "CANCELED" ? (
              <div className='py-1 text-center px-2 text-red-700  text-sm rounded-md bg-red-100 max-w-[90px] font-medium'>
                Cancelled
              </div>
            ) : data?.orderStatus === "PROCESSING" ? (
              <div className='py-1 text-center px-2 text-yellow-700  text-sm rounded-md bg-yellow-100 max-w-[110px] font-medium'>
                {data?.orderStatus}
              </div>
            ) : (
              <div className='py-1 text-center px-2 text-yellow-700  text-sm rounded-md bg-yellow-100 max-w-[75px] font-medium'>
                Pending
              </div>
            )}
          </div>
          <div className='flex flex-col gap-4 py-4 border-b border-gray-200'>
            <span>Vendor</span>
            <div className='flex items-center gap-2'>
              <Image
                className='w-[40px] h-[40px] rounded-full'
                width={60}
                height={60}
                src={data?.user?.avatar || "/noavatar.png"}
                alt='Zac'
              />
              <p className='text-black font-medium'>
                {data?.user?.first_name} {data?.user?.last_name || data?.user?.username}
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
                {/* <p className="text-black font-medium">
                      Victoria Island, Lagos,
                    </p> */}
                <p className='font-medium black'>{user?.country}</p>
              </div>
            </div>
          </div>
          <div className='flex flex-col gap-2 py-4'>
            <span>Payment Information</span>
            <div className='flex gap-2 items-center mt-2'>
              <Image src={Mastercard} alt='Mastercard' className='w-[32px]' />
              <div className='flex items-center w-full gap-1'>
                <p className='text-black font-medium'>
                  {data?.transactionRef?.length > 0 && data?.transactionRef[0]?.paymentGateWay
                    ? data?.transactionRef[0]?.paymentGateWay
                    : "PAYSTACK"}
                </p>
                {data?.orderStatus === "CONFIRMED" && !isVendor && (
                  <Button onClick={onSubmit} className='mr-0'>
                    Pay now
                  </Button>
                )}
                {data?.orderStatus === "PENDING" &&
                  !isVendor &&
                  data?.transactionRef[0]?.purpose === "TICKET_PURCHASE" && (
                    <Button onClick={onSubmit} className='mr-0'>
                      Pay now
                    </Button>
                  )}
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
      {reviewModal && (
        <AlertDialog open onOpenChange={(open) => setReviewModal(open)}>
          <Review VendorId={data?.vendorId} />
        </AlertDialog>
      )}
      {isLoading && <LogoLoader />}
    </Dashboard>
  );
};

export default View;
