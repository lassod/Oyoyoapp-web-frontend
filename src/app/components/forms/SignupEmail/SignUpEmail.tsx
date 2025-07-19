"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Oyoyo from "../../assets/images/Oyoyo.svg";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { formSignUp } from "../../schema/Forms";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePostSignup } from "@/hooks/auth";
import { Check, ChevronDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { countries } from "@/components/assets/data/dashboard";
import { useGetCategories } from "@/hooks/categories";

const SignupEmail = ({ personal }: { personal: boolean }) => {
  const [hide, setHide] = useState(true);
  const [hide2, setHide2] = useState(true);
  const [isOpenCountry, setIsOpenCountry] = useState(false);
  const [isOpenCategory, setIsOpenCategory] = useState(false);
  const { mutation } = usePostSignup();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSignUp>>({
    resolver: zodResolver(formSignUp),
  });

  const allCategories = useGetCategories();
  const onSubmit = (values: z.infer<typeof formSignUp>) => {
    if (values.password !== values.confirmPassword) {
      toast({
        variant: "destructive",
        title: "An error as occurred",
        description: "Passwords do not match",
      });
      return;
    }
    delete values.confirmPassword;

    if (personal) {
      delete values.accountType;
      delete values.categoryId;

      const newPersonal = {
        ...values,
        personal: true,
      };
      console.log(newPersonal);
      mutation.mutate(newPersonal);
    } else {
      const category = allCategories?.data?.find(
        (item: any) => values.categoryId === item.name
      );
      const newBusiness = {
        ...values,
        categoryId: category.id,
      };
      console.log(newBusiness);

      mutation.mutate(newBusiness);
    }
  };

  console.log(allCategories);

  return (
    <div className="bg-white w-full max-w-[600px] rounded-[20px] px-4 sm:px-[30px] py-[50px]">
      <Image src={Oyoyo} alt="Envelope" />
      <h2 className="font-bold text-[30px] mt-5">Create an account</h2>
      <p className="text-black font-medium">
        Already have an account?{" "}
        <Link
          className="text-red-700 font-medium hover:text-black"
          href="/auth/login"
        >
          Sign In
        </Link>
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col mt-4 gap-2"
        >
          <FormField
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <span className="grid md:grid-cols-2 md:gap-x-4 gap-y-2">
            <FormField
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <Input type="text" placeholder="Enter your name" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <Input
                    type="text"
                    placeholder="Enter your last name"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User name</FormLabel>
                  <Input
                    type="text"
                    placeholder="Enter your username"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={field.value || "Select gender"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </span>
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country of residence</FormLabel>
                <Popover open={isOpenCountry} onOpenChange={setIsOpenCountry}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      size={"sm"}
                      className={cn(!field.value && "text-gray-400")}
                    >
                      {field.value
                        ? countries.find(
                            (country) => country.name === field.value
                          )?.name
                        : "Select a country"}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search countries..." />
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
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  country.name === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <Image
                                src={country.flag}
                                alt={country.name}
                                width={50}
                                height={50}
                                className="w-5 h-5 mr-3 rounded-full"
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
          {!personal && (
            <div className="select2">
              <FormField
                control={form.control}
                name="accountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="individual">Individual</SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem className="mt-3">
                    <FormLabel>Business category</FormLabel>

                    <Popover
                      open={isOpenCategory}
                      onOpenChange={setIsOpenCategory}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          size={"sm"}
                          className={cn(
                            !field.value && "text-gray-400 font-normal"
                          )}
                        >
                          {field.value
                            ? allCategories?.data?.find(
                                (category: { name: string }) =>
                                  category.name === field.value
                              )?.name
                            : "Select a business category"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search categories..." />
                          <CommandList>
                            <CommandEmpty>No category found.</CommandEmpty>
                            <CommandGroup>
                              {allCategories?.data?.map(
                                (category: { name: string }) => (
                                  <CommandItem
                                    value={category.name}
                                    key={category.name}
                                    onSelect={() => {
                                      form.setValue(
                                        "categoryId",
                                        category.name
                                      );
                                      setIsOpenCategory(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        category.name === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />

                                    {category.name}
                                  </CommandItem>
                                )
                              )}
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
          )}

          <FormField
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>

                <div className="relative flex justify-between w-full">
                  <Input
                    type={`${hide ? "password" : "text"}`}
                    placeholder="Enter password (Ex. 1234)"
                    {...field}
                  />
                  {hide ? (
                    <EyeOff
                      className="absolute right-3 text-gray-600 top-2 bg-white pl-1"
                      onClick={() => setHide(!hide)}
                    />
                  ) : (
                    <Eye
                      className="absolute right-3 text-gray-600 top-2 bg-white pl-1"
                      onClick={() => setHide(!hide)}
                    />
                  )}
                </div>
                <FormMessage className="top-1" />
              </FormItem>
            )}
          />
          <FormField
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormLabel>Password</FormLabel>

                <div className="relative flex justify-between w-full">
                  <Input
                    type={`${hide2 ? "password" : "text"}`}
                    placeholder="Confirm password"
                    {...field}
                  />
                  {hide2 ? (
                    <EyeOff
                      className="absolute right-3 text-gray-600 top-2 bg-white pl-1"
                      onClick={() => setHide2(!hide2)}
                    />
                  ) : (
                    <Eye
                      className="absolute right-3 text-gray-600 top-2 bg-white pl-1"
                      onClick={() => setHide2(!hide2)}
                    />
                  )}
                </div>

                <FormMessage className="top-1" />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-2 mt-3 mb-2">
            <Checkbox required />
            <p className="text-[12px] text-left">
              By creating an account, you agree to our company{" "}
              <Link href="/privacy" className="hover:text-black text-red-500">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="hover:text-black text-red-500">
                Conditions of Use
              </Link>
            </p>
          </div>
          <Button
            className="w-full mt-5"
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SignupEmail;
