"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogoLoader, SkeletonCard2, SkeletonDemo } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Cowries } from "@/components/assets/images/icon/Cowries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { formSpray, requestPayoutSchema } from "@/app/components/schema/Forms";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Reveal3 } from "@/app/components/animations/Text";
import {
  sprayKeys,
  useGetCowrieRates,
  useGetWalletBalance,
  useGetWalletTransaction,
  usePostBuyCowrie,
  usePostFundWallet,
  usePostSpray,
} from "@/hooks/spray";
import { useQueryClient } from "@tanstack/react-query";
import { Empty } from "@/components/ui/table";
import { formatDate2, scrollToTop } from "@/lib/auth-helper";
import { Badge } from "@/components/ui/badge";
import { CustomPagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { FaMoneyBill } from "react-icons/fa";
import { Loader } from "lucide-react";
import { CustomModal } from "../../general/Modal";

export function ManageWallet({ scrollToTop }: any) {
  const { data: wallet, status } = useGetWalletBalance();

  const tabItems = [
    {
      title: "Add Funds",
      component: <AddFunds scrollToTop={scrollToTop} />,
    },
    {
      title: "History",
      component: <History />,
    },
  ];

  if (status !== "success") return <SkeletonCard2 />;
  return (
    <div className='space-y-6 py-6'>
      <div className='bg-[linear-gradient(45deg,_#077534_0%,_#24583C_100%)] p-4 lg:p-6 rounded-xl'>
        <div className='flex items-center justify-between bg-green-900/60 rounded-md border border-gray-400 p-2 sm:px-4'>
          <span className='font-medium text-white'>Oyoyo Cowrie Wallet</span>
          <Cowries bg1='#077534' bg2='#24583C' />
        </div>
        <div className='flex my-4 justify-between items-center mt-2'>
          <div>
            <h4 className='text-white font-bold'>{wallet?.wallet?.cowrieBalance?.toLocaleString()}</h4>
            <p className='text-gray-300 text-sm font-[300]'>Available Cowries</p>
          </div>
          <div className='h-[30px] border border-white'></div>
          <div>
            <h4 className='text-white font-bold'>
              {wallet?.wallet?.symbol}
              {wallet?.wallet?.walletBalance?.toLocaleString()}
            </h4>
            <p className='text-gray-300 text-sm font-[300]'>Wallet Balance</p>
          </div>
        </div>
        <div>
          <div className='flex mb-2 justify-between gap-6 items-center'>
            <p className='text-sm text-white font-[300]'>
              Current Tier: <b>Tier 3</b>
            </p>
            <p className='text-sm text-white font-[300]'>Next Tier: 26 more</p>
          </div>
          <Progress indicatorClassName='bg-green-600' className='border-green-600' value={(75 / 100) * 100} />
        </div>
      </div>

      <Tabs defaultValue='Add Funds'>
        <TabsList>
          {tabItems.map((item: any) => (
            <TabsTrigger value={item?.title} key={item?.title}>
              {item?.title}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className='border-b border-gray-200 mt-2'></div>
        {tabItems.map((item) => (
          <TabsContent value={item.title} key={item.title} className='pt-3'>
            {item.component}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export function SprayCowrie({ data, setData, setIsAnimation, scrollToTop }: any) {
  const [symbol, setSymbol] = useState(data?.symbol);
  const { data: rate } = useGetCowrieRates(data?.symbol);
  const postSpray = usePostSpray();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSpray>>({
    resolver: zodResolver(formSpray),
    defaultValues: {
      sprayAmount: "0",
    },
  });

  useEffect(() => {
    if (data && rate) {
      setSymbol(data?.symbol);
      form.reset({
        sprayAmount: (data?.price * rate).toFixed(2),
      });
    }
  }, [data, rate]);

  const onSubmit = (values: z.infer<typeof formSpray>) => {
    console.log(values);
    postSpray.mutate(
      {
        id: data?.id,
        amount: parseInt(values.sprayAmount),
        cowrieAmount: parseInt(values.sprayAmount) / rate,
      },
      {
        onSuccess: (res: any) => {
          queryClient.invalidateQueries({ queryKey: [sprayKeys.balance] });
          queryClient.invalidateQueries({ queryKey: [sprayKeys.history] });
          queryClient.invalidateQueries({ queryKey: [sprayKeys.transactions] });
          setData(null);
          setIsAnimation({ video: data.video, response: res?.data?.data });
          scrollToTop();
        },
      }
    );
  };

  return (
    <CustomModal title='Spray Money' open={data} setOpen={setData}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <p>
            Your current Rank: <b className='text-red-700 lg:text-[18px]'>--</b>
          </p>

          <Select value={symbol} onValueChange={setSymbol}>
            <SelectTrigger value={symbol} className='w-full'>
              <SelectValue placeholder='Select currency' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='$'>USD ($)</SelectItem>
              <SelectItem value='₦'>NGN (₦)</SelectItem>
              <SelectItem value='€'>EUR (€)</SelectItem>
            </SelectContent>
          </Select>

          <FormField
            control={form.control}
            name='sprayAmount'
            render={({ field }) => (
              <FormItem className='pb-3'>
                <FormLabel>Amount to Spray</FormLabel>
                <Slider
                  disabled={!data?.isCustom}
                  max={200 * rate}
                  step={1}
                  value={[parseInt(field.value)]}
                  onValueChange={(val) => field.onChange(val[0]?.toString())}
                />
                <div className='flex items-center justify-between'>
                  <p className='text-sm'>{symbol}0</p>
                  <p className='text-sm'>
                    {symbol}
                    {/* {field.value} */}
                    {(200 * rate).toLocaleString()}
                  </p>
                </div>
                <FormMessage />

                <Input disabled={!data?.isCustom} {...field} placeholder='0' />
              </FormItem>
            )}
          />

          <Button
            className='gap-2 w-full'
            type='submit'
            disabled={form.watch("sprayAmount") === "0" || postSpray.isPending}
          >
            <FaMoneyBill className='w-5 h-5' />
            Spray{" "}
            {form.watch("sprayAmount") === "0" || !form.watch("sprayAmount")
              ? "now"
              : `${(parseInt(form.watch("sprayAmount")) / rate).toLocaleString()} cowries`}
            {postSpray?.isPending && <Loader className='animate-spin' size={20} />}
          </Button>
        </form>
      </Form>
    </CustomModal>
  );
}

declare var PaystackPop: {
  setup: (options: {
    key: string;
    email: string;
    currency: string;
    amount: number;
    ref?: string;
    onClose?: () => void;
    callback: (response: { reference: string }) => void;
  }) => {
    openIframe: () => void;
  };
};

const AddFunds = ({ scrollToTop }: any) => {
  const [isWallet, setIsWallet] = useState(false);
  const queryClient = useQueryClient();
  const fundWallet = usePostFundWallet();
  const buyCowrie = usePostBuyCowrie();

  const handleSubmit = (data: any) => {
    console.log(data);
    let handler = PaystackPop.setup({
      key: `${process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!}`,
      email: data.email,
      currency: "NGN",
      amount: data.amount * 100,
      ref: data.reference,

      callback: () => {
        queryClient.invalidateQueries({ queryKey: [sprayKeys.balance] });
        queryClient.invalidateQueries({ queryKey: [sprayKeys.history] });
        queryClient.invalidateQueries({ queryKey: [sprayKeys.transactions] });
        scrollToTop();
      },
    });

    handler.openIframe();
  };

  const handleFundWallet = (amt: any) => {
    if (isWallet)
      buyCowrie.mutate(
        { amount: amt * 1532, currency: "NGN" },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [sprayKeys.balance] });
            queryClient.invalidateQueries({ queryKey: [sprayKeys.history] });
            queryClient.invalidateQueries({ queryKey: [sprayKeys.transactions] });
            scrollToTop();
          },
        }
      );
    else
      fundWallet.mutate(
        { amount: amt * 1534.37, currency: "NGN", paymentGateway: "PAYSTACK" },
        {
          onSuccess: (res: any) => {
            console.log(res);
            handleSubmit({
              reference: res?.data?.data?.transaction?.reference,
              amount: res?.data?.data?.transaction?.amountPaid,
              email: res?.data?.data?.paymentDetails?.email,
            });
          },
        }
      );
  };

  const form = useForm<z.infer<typeof requestPayoutSchema>>({
    resolver: zodResolver(requestPayoutSchema),
  });

  const onSubmit = (data: z.infer<typeof requestPayoutSchema>) => handleFundWallet(parseInt(data.amount));

  return (
    <div className='p-4 border rounded-md space-y-4'>
      <span className='font-semibold'>{isWallet ? "Convert from Wallet balance" : "Buy Cowries"}</span>
      <div className='grid grid-cols-2 gap-2 md:gap-4'>
        {[5, 10, 20, 50].map((amount) => (
          <Button
            key={amount}
            variant='outline'
            onClick={() => handleFundWallet(amount)}
            size='lg'
            className='flex-col items-start gap-1'
          >
            {amount} <p className='text-xs text-gray-500'>${amount}.00</p>
          </Button>
        ))}
      </div>
      <div className='border-t pt-4'>
        <span>{isWallet ? "Convert from Wallet balance" : "Buy Cowries"}</span>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='amount'
              render={({ field }) => (
                <FormItem className='space-y-2 mt-3 mb-6'>
                  <FormLabel>Custom Amount</FormLabel>
                  <Input type='amount' placeholder='10' {...field} />
                  <FormMessage />
                  <p className='text-xs'>1 Cowrie = $1.00</p>
                </FormItem>
              )}
            />
            <Button type='submit' disabled={!form.watch("amount")}>
              {isWallet ? "Convert" : "Fund Cowrie"}
            </Button>
            <Button
              onClick={() => setIsWallet(!isWallet)}
              size='no-padding'
              variant='link-red'
              className='text-sm mt-1'
            >
              {isWallet ? "Fund cowrie wallet" : "Convert from Wallet Balance"}
            </Button>
          </form>
        </Form>
      </div>
      {fundWallet.isPending && <LogoLoader />}
    </div>
  );
};

const History = () => {
  const { data: histories, status } = useGetWalletTransaction();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;
  const paginatedItems = histories?.slice(currentPage * itemsPerPage, currentPage * itemsPerPage + itemsPerPage);

  return (
    <div className='p-4 border rounded-md space-y-3'>
      <span className='font-semibold'>Transaction History</span>
      <div>
        {status !== "success" ? (
          <SkeletonDemo number={4} />
        ) : paginatedItems?.length > 0 ? (
          paginatedItems.map((tx: any, index: number) => (
            <Reveal3 key={index}>
              <div className={`py-3 ${index !== histories.length - 1 ? "border-b" : ""}`}>
                <p>
                  {tx.transactionType === "WALLET_DEPOSIT"
                    ? "Added Funds"
                    : tx?.transactionType === "COWRIE_PURCHASE"
                    ? "Bought Cowries"
                    : "Withdraw Funds"}
                </p>
                <div className='flex items-center justify-between gap-4'>
                  <p className='text-sm'>{formatDate2(tx?.createdAt)}</p>
                  <Badge
                    className='font-semibold'
                    variant={tx.transactionType === "WALLET_DEPOSIT" ? "text-success" : "text-destructive"}
                  >
                    {tx.transactionType === "WALLET_DEPOSIT" ? "+" : "-"}
                    {tx?.wallet?.symbol}
                    {tx?.amount?.toLocaleString()}
                  </Badge>
                </div>
              </div>
            </Reveal3>
          ))
        ) : (
          <Empty title='No recent history' />
        )}
        {paginatedItems?.length && (
          <CustomPagination
            currentPage={currentPage}
            totalItems={histories?.length || 0}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};
