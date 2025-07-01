"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormMessage, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formSchemaPreference } from "../../schema/Forms";
import { languages } from "@/lib/auth-helper";
import { useGetUser, useUpdateCurrency } from "@/hooks/user";
import { countries } from "@/components/assets/data/dashboard";
import Image from "next/image";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const Preferences = () => {
  const { data: user } = useGetUser();
  const { mutation } = useUpdateCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchemaPreference>>({
    resolver: zodResolver(formSchemaPreference),
  });

  useEffect(() => {
    if (user)
      form.reset({
        preferredCurrency: user.preferredCurrency || "NGN",
      });
  }, [user]);

  const onSubmit = (values: z.infer<typeof formSchemaPreference>) => {
    console.log(values);
    mutation.mutate(
      {
        preferredCurrency: values.preferredCurrency,
      },
      {
        onSuccess: () => window.location.reload(),
      }
    );
  };

  return (
    <div className=' flex flex-col max-w-[640px] mx-auto'>
      <div className='flex flex-col'>
        <div className='my-[15px]'>
          <h6>Preference</h6>
          <p>Set your preferred language and currency.</p>
        </div>
        <div className='border-b border-gray-200 mb-3'></div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='mx-auto block md:mt-[30px]  pt-[20px] pb-[15px] rounded-lg bg-white  shadow-md dark:bg-surface-dark'>
              <div className='flex flex-col w-full gap-[16px] px-4 md:px-[30px]'>
                <FormField
                  control={form.control}
                  name='language'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue='English (UK)'>
                        <SelectTrigger>
                          <SelectValue placeholder='Select language' />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((country: any) => (
                            <SelectItem value={country.item}>{country.item}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='preferredCurrency'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Popover open={isOpen} onOpenChange={setIsOpen}>
                        <PopoverTrigger className='w-full' asChild>
                          <Button variant='combobox' role='combobox' className={cn(!field.value && "text-gray-400")}>
                            {field.value
                              ? countries.find((country) => country.currency === field.value)?.currency
                              : "Select a currency"}
                            <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-full p-0'>
                          <Command>
                            <CommandInput placeholder='Search currencies...' />
                            <CommandList>
                              <CommandEmpty>No currency found.</CommandEmpty>
                              <CommandGroup>
                                {countries.map((country) => (
                                  <CommandItem
                                    value={country.currency}
                                    key={country.currency}
                                    onSelect={() => {
                                      form.setValue("preferredCurrency", country.currency);
                                      setIsOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        country.currency === field.value ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <Image
                                      src={country.flag}
                                      alt={country.name}
                                      width={50}
                                      height={50}
                                      className='w-5 h-5 mr-3 rounded-full'
                                    />
                                    <span className='pr-2'>{country.currency}</span>
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
              </div>
              <div className='border-b border-gray-200 mb-3 mt-5'></div>
              <div className='flex justify-end w-full pr-[30px] mt-5'>
                <Button disabled={mutation.isPending} type='submit' className='mr-0'>
                  {mutation.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : "Save changes"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
