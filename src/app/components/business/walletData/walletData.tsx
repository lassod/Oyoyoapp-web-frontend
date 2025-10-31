"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CircleCheck, Loader2, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  ErrorModal,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formSchemaPayout, requestPayoutSchema } from "../../schema/Forms";
import { Input } from "@/components/ui/input";
import { useGetBanks, usePostWithdrawal } from "@/hooks/wallet";
import { useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { CustomModal } from "@/components/dashboard/general/Modal";

export const RequestPayout = ({ connectId, open, setOpen }: any) => {
  const [errorModal, setErrorModal] = useState(false);
  const [isVerify, setIsVerify] = useState(false);
  const [data, setData] = useState<any>({});
  const { mutation } = usePostWithdrawal();
  const navigation = useRouter();

  const onSubmit = (values: z.infer<typeof requestPayoutSchema>) => {
    if (connectId)
      mutation.mutate({
        type: "STRIPE",
        amount: parseInt(values.amount),
      });
    else
      mutation.mutate(
        { ...data, amount: parseInt(values.amount) },
        {
          onSuccess: () => {
            setOpen(false);
            setData({});
            setIsVerify(false);
            form.reset({});
          },
        }
      );
  };

  const form = useForm<z.infer<typeof requestPayoutSchema>>({
    resolver: zodResolver(requestPayoutSchema),
  });

  return (
    <CustomModal open={open} className='max-w-[550px]' setOpen={setOpen} title='Request Payout'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-3'>
          <FormField
            control={form.control}
            name='amount'
            render={({ field }) => (
              <FormItem className='mt-2'>
                <FormLabel>Amount</FormLabel>
                <Input pattern={REGEXP_ONLY_DIGITS} placeholder='Enter amount' {...field} />
                <FormMessage className='relative top-1' />
              </FormItem>
            )}
          />

          {!connectId && <PaymentSetup data={data} setData={setData} isVerify={isVerify} setIsVerify={setIsVerify} />}

          <AlertDialogFooter>
            {connectId ? (
              <Button className='w-full mt-4' disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 size={20} className='animate-spin' /> : "Proceed"}
              </Button>
            ) : isVerify ? (
              <div className='grid w-full mt-4 grid-cols-2 gap-2'>
                <Button
                  type='button'
                  onClick={() => {
                    form.reset({
                      amount: "",
                    });
                    setData({});
                    setOpen(false);
                    setIsVerify(false);
                  }}
                  variant='secondary'
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  variant='success'
                  className='w-full'
                  disabled={mutation.isPending || !form.watch("amount") || !data?.payoutAccountName}
                >
                  {mutation.isPending ? <Loader2 size={20} className='animate-spin' /> : "Withdraw now"}
                </Button>
              </div>
            ) : null}
          </AlertDialogFooter>
        </form>
        {errorModal && (
          <AlertDialog open={errorModal}>
            <ErrorModal description={"Your Verification status is still pending, Verify now"}>
              <AlertDialogAction
                onClick={() => {
                  setErrorModal(false);
                  navigation.push("/dashboard/wallet/verification");
                }}
              >
                Verify Now
              </AlertDialogAction>
            </ErrorModal>
          </AlertDialog>
        )}
      </Form>
    </CustomModal>
  );
};

export const ConfirmPayout = () => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Accept Order</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className='left-[50%] top-[50%]'>
        <AlertDialogHeader className='flex-row gap-4'>
          <div className='alertHeader bg-[#EDFDF4]'>
            <div className='bg-[#EDFDF4]'>
              <CircleCheck className='text-green-500' />
            </div>
          </div>
          <div className='flex flex-col gap-4 w-full'>
            <div>
              <AlertDialogTitle className='text-black pb-2'>Accept Order</AlertDialogTitle>
              <AlertDialogDescription>Confirm which products are available</AlertDialogDescription>
            </div>
            <div className='flex flex-col gap-3'>
              <div className='flex gap-3 justify-between'>
                <div className='flex flex-row gap-[8px] items-center'>
                  {/* <Checkbox className="border-gray-200" /> */}
                  <Label className='text-gray-500'>Vanilla Cake</Label>
                </div>
                <Label className='text-gray-500'>x2</Label>
              </div>
              <div className='flex gap-3 justify-between'>
                <div className='flex flex-row gap-[8px] items-center'>
                  {/* <Checkbox className="border-gray-200" /> */}
                  <Label className='text-gray-500'>Baked Cake</Label>
                </div>
                <Label className='text-gray-500'>x1</Label>
              </div>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className='alertDialogFooter'>
          <div className='box'>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className='bg-green-500'>Update</AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const PaymentSetup = ({ data, setData, isVerify, setIsVerify }: any) => {
  const [bankCode, setBankCode] = useState(""); // State for the verified account name
  const [isOpenBank, setIsOpenBank] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { data: banks } = useGetBanks();

  const form = useForm<z.infer<typeof formSchemaPayout>>({
    resolver: zodResolver(formSchemaPayout),
  });

  useEffect(() => {
    if (data) form.reset(data);
  }, [data]);

  // Mutation for account verification
  const onSubmit = async (values: z.infer<typeof formSchemaPayout>) => {
    setLoading(true);
    if (bankCode) {
      try {
        const res = await axios.get(`https://api.paystack.co/bank/resolve`, {
          params: {
            account_number: values.payoutAccountNumber,
            bank_code: bankCode,
          },
          headers: {
            Authorization: `Bearer sk_test_968556c9082f84f1f82bb0ca41b4f645748dfb07`, // Replace with your actual Paystack secret key
          },
        });
        if (res.data.status) {
          setData({
            type: "PAYSTACK",
            payoutAccountNumber: values.payoutAccountNumber,
            payoutBankName: values.payoutBankName,
            currency: "NGN",
            bankCode,
            payoutAccountName: res.data.data.account_name,
          });
          setIsVerify(true);
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "An error occurred!.",
          description: "Account details entered does not exist",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Form {...form}>
      <form className='flex flex-col gap-3 sm:gap-4 py-1 max-w-[600px] mx-auto w-full'>
        <FormField
          control={form.control}
          name='payoutBankName'
          render={({ field }) => (
            <FormItem>
              <Label>Bank name</Label>

              <Popover open={isOpenBank} onOpenChange={setIsOpenBank}>
                <PopoverTrigger asChild>
                  <Button variant='combobox'>
                    {field.value ? field.value : "Select Bank Name"}
                    <ChevronDown size={20} className='ml-2 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-full p-0'>
                  <Command>
                    <CommandInput placeholder='Search categories...' />
                    <CommandList>
                      <CommandEmpty>No bank found.</CommandEmpty>
                      <CommandGroup>
                        {banks?.map((bank: any) => (
                          <CommandItem
                            value={bank.name}
                            key={bank.name}
                            onSelect={() => {
                              form.setValue("payoutBankName", bank.name);
                              setBankCode(bank.code);
                              setIsOpenBank(false);
                            }}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", bank.name === field.value ? "opacity-100" : "opacity-0")}
                            />
                            {bank.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='payoutAccountNumber'
          render={({ field }) => (
            <FormItem>
              <Label>Account Number</Label>
              <Input placeholder='Enter number' {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        {isVerify ? (
          <FormField
            control={form.control}
            name='accountName'
            render={() => (
              <FormItem>
                <Label>Account Name</Label>
                <Input value={data?.payoutAccountName} readOnly />
              </FormItem>
            )}
          />
        ) : (
          <Button
            type='button'
            onClick={() => form.handleSubmit(onSubmit)()}
            disabled={loading}
            className='w-full mt-6'
          >
            {loading ? <Loader2 className='w-5 h-5 animate-spin' /> : "Verify Account"}
          </Button>
        )}
      </form>
    </Form>
  );
};
