"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { Check, ChevronDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { countries } from "@/components/assets/data/dashboard";

const bankLocations = [
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "ca", label: "Canada" },
];

const bankNames = [
  { value: "chase", label: "Chase" },
  { value: "wellsfargo", label: "Wells Fargo" },
  { value: "bofa", label: "Bank of America" },
  // add more bank names as needed
];

export const PaymentMethod = () => {
  const [showPaymentMethod, setShowPaymentMethod] = React.useState<boolean>(false);

  return (
    <div className=' flex flex-col max-w-[640px] mx-auto'>
      <div className='flex flex-col'>
        <div className='my-[15px]'>
          <h6>Payment Method</h6>
          <p>Choose how you want to get paid</p>
        </div>
        <div className='border-b border-gray-200 mb-3'></div>
        <div className='shadow-md rounded-lg px-5 '>
          {showPaymentMethod ? <PaymentMethodData /> : <Personalization setShowPaymentMethod={setShowPaymentMethod} />}
        </div>
      </div>
    </div>
  );
};

const Personalization = ({ setShowPaymentMethod }: any) => {
  const personalizationSchema = z.object({
    country: z.string().default("").optional(),
  });

  const form = useForm<z.infer<typeof personalizationSchema>>({
    resolver: zodResolver(personalizationSchema),
  });

  const onSubmit = (values: z.infer<typeof personalizationSchema>) => {
    // const newBusiness = {
    //   ...values,
    //   categoryId: category.id,
    // };
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className='mx-auto block mt-[30px] pt-[20px] pb-[15px]'>
          {/* Currency Selector */}
          <FormField
            control={form.control}
            name='country'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country of residence</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      role='combobox'
                      size={"sm"}
                      className={cn(!field.value && "text-gray-400")}
                    >
                      {field.value ? countries.find((country) => country.name === field.value)?.name : "Shop country"}
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
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  country.name === field.value ? "opacity-100" : "opacity-0"
                                )}
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
          <div className='flex items-center gap-[8px] my-5'>
            <div
              className=' flex justify-center items-center rounded-[50%] w-[24px] h-[24px] p-2 pb-[10px] border-2 border-dotted border-red-700  cursor-pointer'
              onClick={() => setShowPaymentMethod(true)}
            >
              <span className=' text-[25px]  text-red-700 text-primary-foreground hover:text-primary/90 '>+</span>
            </div>
            <span
              className='text-red-700 text-primary-foreground cursor-pointer '
              onClick={() => setShowPaymentMethod(true)}
            >
              Add another bank account
            </span>
          </div>
          <div className='border-b border-gray-200 mb-3'></div>
          <Button type='submit' className='mr-0'>
            Save changes
          </Button>
        </div>
      </form>
    </Form>
  );
};

const PaymentMethodData = ({ setShowPaymentMethod }: any) => {
  return (
    <div className='mx-auto block mt-[30px] pt-[0px] pb-[15px] rounded-lg bg-white shadow-sm dark:bg-surface-dark'>
      <div className='flex flex-col w-full gap-[16px] px-[30px] border  border-gray-300 rounded-lg'>
        <div className='flex flex-col w-full gap-[16px] '>
          {/* Where is your bank located? */}
          <div className='flex flex-col'>
            <label htmlFor='bankLocation' className='mb-2 font-medium text-black'></label>
            <select id='bankLocation' className=' border border-none  my-[15px] rounded-lg font-medium text-black'>
              {bankLocations.map((option) => (
                <option key={option.value} value={option.value}>
                  Payment details 1
                </option>
              ))}{" "}
            </select>
          </div>
          {/* Where is your bank located? */}
          <div className='flex flex-col'>
            <label htmlFor='bankLocation' className='mb-2 font-medium text-black'>
              Where is your bank located?
            </label>
            <select id='bankLocation' className='p-2 border border-gray-300 rounded-lg text-sm text-gray-500'>
              {bankLocations.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {/* Account Name */}
          <div className='flex flex-col'>
            <label htmlFor='accountName' className='mb-2 font-medium text-black'>
              Account Name
            </label>
            <input
              id='accountName'
              type='text'
              className='p-2 border border-gray-300 rounded-lg text-sm text-gray-500'
            />
          </div>
          {/* Account Number */}
          <div className='flex flex-col'>
            <label htmlFor='accountNumber' className='mb-2 font-medium text-black'>
              Account Number
            </label>
            <input
              id='accountNumber'
              type='text'
              className='p-2 border border-gray-300 rounded-lg text-sm text-gray-500'
            />
          </div>
          {/* Bank Name */}
          <div className='flex flex-col'>
            <label htmlFor='bankName' className='mb-2 font-medium text-black'>
              Bank Name
            </label>
            <select id='bankName' className='p-2 border border-gray-300 rounded-lg text-sm text-gray-500'>
              {bankNames.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className='flex items-center'>
            <input
              type='checkbox'
              id='agree'
              className='mr-2 h-5 w-5 border-2 rounded-lg border-gray-300 focus:ring-0 focus:ring-offset-0 checked:border-red-700 checked:bg-red-700 checked:hover:bg-red-700 text-sm text-gray-500'
            />
            <label htmlFor='agree' className=' text-sm text-gray-500'>
              Use as default
            </label>
          </div>
          <div className='grid justify-items-stretch  justify-start mb-[10px] '>
            <Button variant={"outline"}>
              Delete account <span className='ml-[10px]'>%</span>
            </Button>
          </div>
        </div>
        {/*  */}
      </div>
      <div className='flex items-center gap-[8px] my-5'>
        <div
          className=' flex justify-center items-center rounded-[50%] w-[24px] h-[24px] p-2 pb-[10px] border-2 border-dotted border-red-700  cursor-pointer'
          onClick={() => setShowPaymentMethod(true)}
        >
          <span className=' text-[25px]  text-red-700 text-primary-foreground hover:text-primary/90 '>+</span>
        </div>
        <span
          className='text-red-700 text-primary-foreground cursor-pointer '
          onClick={() => setShowPaymentMethod(true)}
        >
          Add another bank account
        </span>
      </div>
      <div className='border-b border-gray-200 mb-3 '></div>
      <div className='flex justify-end w-full pr-[30px] mt-5'>
        <div className='flex  gap-[16px] w-[300px]'>
          <Button variant={"secondary"}>Cancel</Button>
          <Button type='submit' className='flex flex-row text-center  items-center gap-[5px]'>
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
};
