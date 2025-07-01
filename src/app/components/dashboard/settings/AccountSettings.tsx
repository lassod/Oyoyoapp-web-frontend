"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Image from "next/image";
import React from "react";
import { AlertTriangle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FileUploadAvatar } from "../../business/FileUpload";
import { formResetPassword, profileSchema } from "../../schema/Forms";
import { useDeleteUser, useGetUser, useUpdateUser } from "@/hooks/user";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useForgotPassword, useResetPassword } from "@/hooks/auth";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SkeletonCard1, SkeletonDemo } from "@/components/ui/skeleton";
import { useGetCountries } from "@/hooks/events";
import { useSession } from "next-auth/react";
import { AccountManagement } from "@/components/dashboard/stripe/EmbededComponents";

export const AccountSettings = () => {
  const { data: session, status } = useSession();
  const connectId = session?.stripeConnectId;

  if (status === "loading") return <SkeletonCard1 />;
  return (
    <div className='mx-auto sm:px-5 mt-5 settings max-w-[800px]'>
      <div className='w-full flex flex-col gap-6'>
        {connectId && <AccountManagement />}
        <PersonalInformation />
        <PasswordSection />
        {/* <ConnectedAccounts /> */}
        <DeletedAccounts />
      </div>
    </div>
  );
};

const PersonalInformation = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { mutation } = useUpdateUser();
  const { data: user, status } = useGetUser();
  const [states, setStates] = useState([]);
  const [isOpenCountry, setIsOpenCountry] = useState(false);
  const [isOpenState, setIsOpenState] = useState(false);
  const { data: countries } = useGetCountries();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      form.reset({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        gender: user.gender || "",
        country: user.country || "",
        state: user.state || "",
        phone: user.phone || "",
        bio: user.bio || "Bio",
      });
    }
  }, [user]);

  console.log(user);
  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    console.log(values);
    mutation.mutate(
      { ...values },
      {
        onSuccess: () => window.location.reload(),
      }
    );
  };

  if (status !== "success") return <SkeletonDemo />;
  return (
    <div className='flex flex-col w-full'>
      <div className='justify-self-start my-[15px]'>
        <h6>Profile Information</h6>
        <p>Manage your account information and settings.</p>
      </div>
      <div className='border-b border-gray-200'></div>
      <div className='sm:mt-[30px] relative pb-[15px] w-full px-4 shadow-md dark:bg-surface-dark rounded-lg'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className=''>
            <div className='pb-10 px-1'>
              <div className='grid sm:grid-cols-2 gap-3 mb-3 sm:mb-5'>
                <FormField
                  control={form.control}
                  name='first_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <Input type='text' placeholder='Enter your first name' {...field} />
                      <FormMessage className='top-1' />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='last_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <Input type='text' placeholder='Enter your last name' {...field} />
                      <FormMessage className='top-1' />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <Input type='email' placeholder='Enter your email' {...field} />
                    <FormMessage className='top-1' />
                  </FormItem>
                )}
              />

              <div className='grid sm:grid-cols-2 gap-3 my-3 sm:my-5'>
                <FormField
                  control={form.control}
                  name='country'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Popover open={isOpenCountry} onOpenChange={setIsOpenCountry}>
                        <PopoverTrigger asChild>
                          <Button
                            variant='combobox'
                            role='combobox'
                            size={"sm"}
                            className={cn(!field.value && "text-gray-400")}
                          >
                            {field.value ? field.value : "Select a country"}
                            <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-full p-0'>
                          <Command>
                            <CommandInput placeholder='Search countries...' />
                            <CommandList>
                              <CommandEmpty>No country found.</CommandEmpty>
                              <CommandGroup>
                                {countries?.map((country: any) => (
                                  <CommandItem
                                    value={country.name}
                                    key={country.name}
                                    onSelect={() => {
                                      form.setValue("country", country.name);
                                      setStates(country.states);
                                      setIsOpenCountry(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        country.name === field.value ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {country.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='state'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Popover open={isOpenState} onOpenChange={setIsOpenState}>
                        <PopoverTrigger asChild>
                          <Button
                            variant='combobox'
                            role='combobox'
                            disabled={!states.length}
                            size={"sm"}
                            className={cn(!field.value && "text-gray-400")}
                          >
                            {field.value ? field.value : "Select a state"}
                            <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-full p-0'>
                          <Command>
                            <CommandInput placeholder='Search states...' />
                            <CommandList>
                              <CommandEmpty>No state found.</CommandEmpty>
                              <CommandGroup>
                                {states?.map((state: any) => (
                                  <CommandItem
                                    value={state.name}
                                    key={state.name}
                                    onSelect={() => {
                                      form.setValue("state", state.name);
                                      setIsOpenState(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        state.name === field.value ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {state.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='bio'
                render={({ field }) => (
                  <FormItem className='mt-2'>
                    <FormLabel>Bio</FormLabel>
                    <Textarea placeholder='Brief description of yourself' {...field} />
                  </FormItem>
                )}
              />
              <div className='relative flex gap-3 sm:gap-[25px] mt-4 w-full'>
                <Image
                  src={(uploadedFile && URL.createObjectURL(uploadedFile)) || user?.avatar || "/noavatar.png"}
                  alt='Avatar'
                  className='w-16 h-14 sm:w-[85px] mt-3 sm:h-[70px] rounded-full object-cover'
                  width={300}
                  height={300}
                />
                <FileUploadAvatar onUploadSuccess={setUploadedFile} />
              </div>
            </div>
            <div className='border-b border-gray-200 mb-3'></div>
            <Button type='submit' className='flex flex-row mr-0 text-center items-center gap-[5px]'>
              {mutation.isPending ? <Loader2 className='h-4 w-5 animate-spin' /> : "Save changes"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export const PasswordSection = () => {
  const [hide, setHide] = useState(true);
  const [hide2, setHide2] = useState(true);

  const { mutation } = useResetPassword();
  const { mutation: code } = useForgotPassword();
  const user = useGetUser();

  const form = useForm<z.infer<typeof formResetPassword>>({
    resolver: zodResolver(formResetPassword),
  });

  const onSubmit = (values: z.infer<typeof formResetPassword>) => {
    if (values.password !== values.confirmPassword) return alert("Passwords do not match");
    console.log(values);
    mutation.mutate(values);
  };

  return (
    <div className='flex flex-col justify-center items-center w-full'>
      <div className='flex flex-col w-full'>
        <div className='justify-self-start my-[15px]'>
          <h6>Password</h6>
          <p>Update your password</p>
        </div>
        <div className='border-b border-gray-200 mb-3'></div>
        <div className='flex flex-col  mt-[30px] rounded-lg bg-transparent w-full px-4 shadow-md dark:bg-surface-dark'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
              <FormField
                control={form.control}
                name='token'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification code</FormLabel>
                    <div className='relative flex justify-between w-full'>
                      <Input pattern={REGEXP_ONLY_DIGITS} type='text' placeholder='Enter current password' {...field} />
                    </div>
                    <FormMessage className='top-1' />
                  </FormItem>
                )}
              />
              <Button
                type='button'
                disabled={code.isPending}
                onClick={() => code.mutate({ email: user?.data?.email })}
                className='mr-0'
              >
                {code.isPending ? <Loader2 className='h-4 w-5 animate-spin' /> : "Get code"}
              </Button>
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <div className='relative flex justify-between w-full'>
                      <Input
                        pattern={REGEXP_ONLY_DIGITS}
                        type={`${hide ? "password" : "text"}`}
                        placeholder='Enter password (Ex. 1234)'
                        {...field}
                      />
                      {hide ? (
                        <EyeOff
                          className='absolute right-3 text-gray-600 cursor-pointer top-2'
                          onClick={() => setHide(!hide)}
                        />
                      ) : (
                        <Eye
                          className='absolute right-3 text-gray-600 cursor-pointer top-2'
                          onClick={() => setHide(!hide)}
                        />
                      )}
                    </div>
                    <FormMessage className='top-1' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <div className='relative flex justify-between w-full'>
                      <Input
                        pattern={REGEXP_ONLY_DIGITS}
                        type={`${hide ? "password" : "text"}`}
                        placeholder='Enter password (Ex. 1234)'
                        {...field}
                      />
                      {hide2 ? (
                        <EyeOff
                          className='absolute right-3 text-gray-600 cursor-pointer top-2'
                          onClick={() => setHide2(!hide2)}
                        />
                      ) : (
                        <Eye
                          className='absolute right-3 text-gray-600 cursor-pointer top-2'
                          onClick={() => setHide2(!hide2)}
                        />
                      )}
                    </div>
                    <FormMessage className='top-1' />
                  </FormItem>
                )}
              />

              <div className='flex justify-end w-full pr-[30px] mt-5'>
                <Button type='submit' className='flex mr-0 mb-5 flex-row text-center items-center gap-[5px]'>
                  {mutation.isPending ? <Loader2 className='h-4 w-5 animate-spin' /> : "Save changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export const DeletedAccounts = () => {
  const { mutation } = useDeleteUser();
  return (
    <div className=' flex flex-col justify-center items-center    w-full'>
      <div className='flex flex-col w-full'>
        <div className='justify-self-start my-[15px]'>
          <h6>Delete Your Account</h6>
          <p className='text-sm text-gray-600'>
            Permanently close and delete your account. Once deleted, your account cannot be restored.
          </p>
          <a href='#' className='text-red-600 font-medium hover:underline'>
            Learn more.
          </a>
        </div>
        <div className='border-b border-gray-200 mb-3'></div>
        <div className='flex items-center justify-center md:mt-[30px] p-[25px] rounded-lg bg-transparent shadow-sm dark:bg-surface-dark'>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className='mx-auto' variant={"secondary"}>
                Request deletion of account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className='bg-transparent left-[50%] top-[50%] px-4'>
              <div className='div rounded-lg p-4 sm:px-6 sm:py-5 bg-white'>
                <AlertDialogHeader className='flex-row gap-4'>
                  <div className='rounded-full w-[48px] h-[48px] p-[10px] flex items-center justify-center bg-[#FFFAEB]'>
                    <div className='rounded-full w-[32px] h-[32px] p-[5px] flex items-center justify-center bg-yellow-100'>
                      <AlertTriangle className='text-red-700' />
                    </div>
                  </div>
                  <div className='flex flex-col gap-4 w-full'>
                    <div>
                      <h6 className='text-left pb-2 leading-[1.3]'>Delete Account</h6>
                      <p className='text-left mb-2'>Your account will be Permanently deleted from this platform</p>
                    </div>
                  </div>
                </AlertDialogHeader>
                <div className='flex justify-end mt-2'>
                  <div className='flex max-w-[235px] gap-2'>
                    <AlertDialogCancel>
                      <Button variant={"secondary"}>Close</Button>
                    </AlertDialogCancel>
                    <Button onClick={() => mutation.mutate()} className='ml-0 w-[116px]' disabled={mutation.isPending}>
                      {mutation.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : "Continue"}
                    </Button>
                  </div>
                </div>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};
