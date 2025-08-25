"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formSchemaPayment } from "../../schema/Forms";
import { Label } from "@/components/ui/label";
import { DashboardHeader, DashboardHeaderText } from "@/components/ui/containers";
import { useState } from "react";
import { useGetBanks } from "@/hooks/wallet";
import axios from "axios";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { countries } from "@/components/assets/data/dashboard";
import { ArrowLeftCircleIcon, ArrowRightCircleIcon, Check, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePostPaymentMethod } from "@/hooks/user";

// SERVICE HEADER
export const ServiceHeader = () => {
  return (
    <DashboardHeader>
      <DashboardHeaderText>Dashboard</DashboardHeaderText>
      {/* <Button variant={"secondary"} className='m-0'>
        <Link href='/dashboard/business'>Save & Exit</Link>
      </Button> */}
    </DashboardHeader>
  );
};

export const Steps = ({ data }: any) => {
  return (
    <div className='w-full md:max-w-[438px] xl:max-w-[538px] lg:pr-9 flex flex-col gap-4 justify-center md:fixed'>
      {!data?.new && <h3 className='font-semibold mb-5 md:mb-10'>{data.step}</h3>}{" "}
      <h1 className='text-black text-[22px] md:text-[34px]'>{data.title}</h1>
      <p className='leading-6'>{data.text} </p>
    </div>
  );
};

export const PaymentSetup = () => {
  const [bank_code, setBank_code] = useState(""); // State for the verified account name
  const [accountName, setAccountName] = useState(""); // State for the verified account name
  const [isOpenBank, setIsOpenBank] = useState(false);
  const [isOpenCountry, setIsOpenCountry] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchemaPayment>>({
    resolver: zodResolver(formSchemaPayment),
  });
  const { data: banks } = useGetBanks();
  const { mutation } = usePostPaymentMethod();

  const handleVerify = async (account_number: string) => {
    if (!bank_code)
      return toast({
        variant: "destructive",
        title: "An error occurred!.",
        description: "Please select Bank name",
      });
    if (!account_number)
      return toast({
        variant: "destructive",
        title: "An error occurred!.",
        description: "Please Enter account number",
      });

    try {
      setLoading(true);
      const res = await axios.get(`https://api.paystack.co/bank/resolve`, {
        params: { account_number, bank_code },
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY}`, // Replace with your actual Paystack secret key
        },
      });
      console.log(res);
      if (res.data.status) {
        setAccountName(res.data.data.account_name);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "An error occurred!.",
        description: "The account details entered does not exist",
      });
      setAccountName("");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchemaPayment>) => {
    console.log(values);
    mutation.mutate({ ...values, accountName });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col gap-3 sm:gap-4 py-1 px-4 sm:px-6 max-w-[600px] mx-auto w-full'
      >
        <FormField
          control={form.control}
          name='bankName'
          render={({ field }) => (
            <FormItem>
              <Label>Bank name</Label>

              <Popover open={isOpenBank} onOpenChange={setIsOpenBank}>
                <PopoverTrigger asChild>
                  <Button
                    variant='combobox'
                    role='combobox'
                    size={"sm"}
                    className='rounded-md h-10 py-0 px-3 justify-between ml-0 w-full'
                  >
                    {field.value ? field.value : "Select Bank Name"}
                    <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
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
                              form.setValue("bankName", bank.name);
                              setBank_code(bank.code);
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
          name='country'
          render={({ field }) => (
            <FormItem>
              <Label>Country</Label>
              <Popover open={isOpenCountry} onOpenChange={setIsOpenCountry}>
                <PopoverTrigger asChild>
                  <Button variant='outline' role='combobox' size={"sm"} className={cn(!field.value && "text-gray-400")}>
                    {field.value ? countries.find((country) => country.name === field.value)?.name : "Select a country"}
                    <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-full p-0'>
                  <Command>
                    <CommandInput placeholder='Search countries...' />
                    <CommandList>
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup>
                        {countries.map((country) => (
                          <CommandItem
                            value={country.name}
                            key={country.name}
                            onSelect={() => {
                              form.setValue("country", country.name);
                              setIsOpenCountry(false);
                            }}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", country.name === field.value ? "opacity-100" : "opacity-0")}
                            />
                            <Image
                              src={country.flag}
                              alt={country.name}
                              width={50}
                              height={50}
                              className='w-5 h-5 mr-3 rounded-full'
                            />
                            {country.name}
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
          name='accountNumber'
          render={({ field }) => (
            <FormItem>
              <Label>Account Number</Label>
              <div className='flex gap-2'>
                <Input placeholder='Enter number' {...field} />
                <Button
                  type='button'
                  onClick={() => handleVerify(field.value)}
                  disabled={loading}
                  variant={"destructive"}
                  className='h-[39px] m-0 max-w-[90px]'
                >
                  {loading ? <Loader2 className='w-5 h-5 animate-spin' /> : "Verify"}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='accountName'
          render={({ field }) => (
            <FormItem>
              <Label>Account Name</Label>
              <Input value={accountName || field.value} readOnly />
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex mt-4 w-[350px] mx-auto gap-[16px]'>
          <Button type='button' className='mr-0' variant={"secondary"}>
            <Link href='/dashboard/service/listing/add' className='flex justify-center items-center'>
              <ArrowLeftCircleIcon className='mr-2 h-4 w-4' />
              Back
            </Link>
          </Button>
          <Button disabled={mutation.isPending} type='submit' className='ml-0'>
            {mutation.isPending ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <div className='flex items-center'>
                Next
                <ArrowRightCircleIcon className='ml-2 h-4 w-4' />
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
