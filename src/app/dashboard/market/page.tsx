"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Dashboard } from "@/components/ui/containers";
import { SkeletonCard1 } from "@/components/ui/skeleton";
import { Check, ChevronDown, Loader2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { FaTrophy } from "react-icons/fa6";
import { goToNextPage, goToPrevPage, shortenText } from "@/lib/auth-helper";
import empty from "@/app/components/assets/images/empty.svg";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input"; // Import the Shadcn Input component
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { FaFilter } from "react-icons/fa";
import { FaChevronUp, FaChevronDown } from "react-icons/fa6";
import { CircleCheckbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { marketPlaceSchema } from "@/app/components/schema/Forms";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { countries } from "@/components/assets/data/dashboard";
import { cn } from "@/lib/utils";
import { useGetServiceTypes } from "@/hooks/types";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useGetAllServices } from "@/hooks/services";
import { useGetUser } from "@/hooks/user";

const MarketPlace = () => {
  const [search, setSearch] = useState<any>(null); // State for search input
  const navigation = useRouter();
  const [filters, setFilters] = useState<any>(null);
  const { data: serviceTypes } = useGetServiceTypes();
  const { data: services, status } = useGetAllServices(filters);
  const [page, setPage] = useState(services?.pagination?.page || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenType, setIsOpenType] = useState(false);
  const [isOpenCountry, setIsOpenCountry] = useState(false);
  const { data: user } = useGetUser();

  useEffect(() => {
    if (services?.pagination?.totalPages) setTotalPages(services?.pagination?.totalPages || 1);
  }, [services]);

  useEffect(() => {
    setFilters((prevFilters: any) => ({
      ...prevFilters,
      search,
    }));
  }, [search]);

  // Hook form initialization
  const form = useForm<z.infer<typeof marketPlaceSchema>>({
    resolver: zodResolver(marketPlaceSchema),
  });

  const handleSearchInput = (e: any) => {
    e.preventDefault();
    setSearch(e.target.value.trim());
  };

  // Submit the form and apply filters
  const onSubmit = (values: z.infer<typeof marketPlaceSchema>) => {
    setFilters((prevFilters: any) => ({
      ...prevFilters,
      ...values,
      price: `${values.minPrice}-${values.maxPrice}`,
    }));
    setIsOpen(false);
  };

  return (
    <Dashboard className='flex flex-col bg-white gap-[10px] pb-20'>
      <div className='flex items-center my-3 gap-4 flex-wrap justify-between'>
        <h5>Market Place</h5>

        <div className='flex gap-2'>
          <Input onChange={handleSearchInput} placeholder='Search for services' className='sm:flex mb-2' />
          <DropdownMenu>
            <DropdownMenuTrigger className='h-[42px]' asChild>
              <div
                onClick={() => setIsOpen(!isOpen)}
                className='flex gap-3 text-sm border border-gray-300 hover:border-red-700 hover:text-red-700 items-center px-4 rounded-lg cursor-pointer'
              >
                <FaFilter className='w-4 h-4 cursor-pointer' />
                Filter
                {isOpen ? <FaChevronUp className='w-3 h-3' /> : <FaChevronDown className='w-3 h-3' />}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='max-h-[300px] sm:max-h-[350px] px-2 overflow-scroll'>
              <Form {...form}>
                <form className='flex flex-col gap-2 p-5'>
                  <Accordion type='single' collapsible>
                    <AccordionItem className='max-w-full px-0' value='Today'>
                      <AccordionTrigger className='text-sm'>Service type</AccordionTrigger>
                      <AccordionContent>
                        <FormField
                          control={form.control}
                          name='serviceType'
                          render={({ field }) => (
                            <FormItem>
                              <Popover open={isOpenType} onOpenChange={setIsOpenType}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant='combobox'
                                    role='combobox'
                                    size={"sm"}
                                    className={cn(!field.value && "text-gray-400")}
                                  >
                                    {field.value ? field.value : "Select a service type"}
                                    <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-full p-0'>
                                  <Command>
                                    <CommandInput placeholder='Search service types...' />
                                    <CommandList>
                                      <CommandEmpty>No service type found.</CommandEmpty>
                                      <CommandGroup>
                                        {serviceTypes?.map((item: any) => (
                                          <CommandItem
                                            value={item.name}
                                            key={item.name}
                                            onSelect={() => {
                                              form.setValue("serviceType", item.name);
                                              setIsOpenType(false);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                item.name === field.value ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            {item.name}
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
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Accordion type='single' collapsible>
                    <AccordionItem className='max-w-full px-0' value='Today'>
                      <AccordionTrigger className='text-sm'>Location</AccordionTrigger>
                      <AccordionContent>
                        <FormField
                          control={form.control}
                          name='country'
                          render={({ field }) => (
                            <FormItem>
                              <Popover open={isOpenCountry} onOpenChange={setIsOpenCountry}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant='combobox'
                                    role='combobox'
                                    size={"sm"}
                                    className={cn(!field.value && "text-gray-400")}
                                  >
                                    {field.value
                                      ? countries.find((country) => country.name === field.value)?.name
                                      : "Select a country"}
                                    <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-full p-0'>
                                  <Command>
                                    <CommandInput placeholder='Search countries...' />
                                    <CommandList>
                                      <CommandEmpty>No country found.</CommandEmpty>
                                      <CommandGroup>
                                        {countries.map((country: any) => (
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
                            </FormItem>
                          )}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Accordion type='single' collapsible defaultValue='UPCOMING'>
                    <AccordionItem className='max-w-full px-0' value='UPCOMING'>
                      <AccordionTrigger className='text-sm'>Star rating</AccordionTrigger>
                      <AccordionContent>
                        <ul className='flex flex-col gap-3'>
                          {starRating.map((item) => (
                            <li className='flex items-center gap-3' key={item}>
                              <FormField
                                control={form.control}
                                name='minRating'
                                render={({ field }) => (
                                  <div className='flex items-center gap-1 cursor-pointer'>
                                    <CircleCheckbox
                                      checked={field.value === item}
                                      onCheckedChange={() => field.onChange(field.value === item ? "" : item)}
                                    />
                                    <button
                                      type='button'
                                      className='flex gap-1'
                                      onClick={() => field.onChange(field.value === item ? "" : item)} // Ensure click works for stars
                                    >
                                      {Array.from({ length: parseInt(item) }).map((_, index) => (
                                        <Star fill='#34A853' className='text-[#34A853] h-4 w-4' key={index} />
                                      ))}
                                    </button>
                                  </div>
                                )}
                              />
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  <Accordion type='single' collapsible defaultValue='UPCOMING'>
                    <AccordionItem className='max-w-full px-0' value='UPCOMING'>
                      <AccordionTrigger className='text-sm'>Status</AccordionTrigger>
                      <AccordionContent>
                        <ul className='flex flex-col gap-3'>
                          {vendorRating.map((item) => (
                            <li className='flex items-center gap-3' key={item}>
                              <FormField
                                control={form.control}
                                name='vendorTier'
                                render={({ field }) => {
                                  const selectedValues = field.value || [];
                                  const isSelected = selectedValues.includes(item);
                                  return (
                                    <>
                                      <CircleCheckbox
                                        checked={isSelected}
                                        onCheckedChange={() => {
                                          if (isSelected)
                                            field.onChange(selectedValues.filter((tier) => tier !== item));
                                          else field.onChange([...selectedValues, item]);
                                        }}
                                      />
                                      <button
                                        type='button'
                                        className='flex gap-1 hover:text-red-700'
                                        onClick={() => {
                                          if (isSelected)
                                            field.onChange(selectedValues.filter((tier) => tier !== item));
                                          else field.onChange([...selectedValues, item]);
                                        }}
                                      >
                                        {item}
                                      </button>
                                    </>
                                  );
                                }}
                              />
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Accordion type='single' collapsible>
                    <AccordionItem className='max-w-full px-0' value='Physical'>
                      <AccordionTrigger className='text-sm'>Percentage job completion</AccordionTrigger>
                      <AccordionContent>
                        <FormField
                          control={form.control}
                          name='minCompletionPercentage'
                          render={({ field }) => (
                            <FormItem className='mt-2'>
                              <Input {...field} placeholder='85' className='bottom-0 m-0' />
                            </FormItem>
                          )}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  <Accordion type='single' collapsible>
                    <AccordionItem className='max-w-ull px-0' value='Physical'>
                      <AccordionTrigger className='text-sm'>Service cost/ amount</AccordionTrigger>
                      <AccordionContent className='grid grid-cols-2 gap-3'>
                        <FormField
                          control={form.control}
                          name='minPrice'
                          render={({ field }) => (
                            <FormItem className='mt-2 max-w-[120px]'>
                              <FormLabel>Min ({user?.Wallet?.symbol || "₦"})</FormLabel>
                              <Input
                                {...field}
                                pattern={REGEXP_ONLY_DIGITS}
                                placeholder='100'
                                className='bottom-0 m-0'
                              />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name='maxPrice'
                          render={({ field }) => (
                            <FormItem className='mt-2 max-w-[120px]'>
                              <FormLabel>Max ({user?.Wallet?.symbol || "₦"})</FormLabel>
                              <Input
                                {...field}
                                pattern={REGEXP_ONLY_DIGITS}
                                placeholder='5000'
                                className='bottom-0 m-0'
                              />
                            </FormItem>
                          )}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  <div className='flex gap-4 sticky bottom-0 bg-white py-2 shadow'>
                    <Button
                      className='text-red-700'
                      type='button'
                      onClick={() => {
                        form.reset({
                          serviceType: "",
                          country: "",
                          minRating: "",
                          minCompletionPercentage: "",
                          vendorTier: [],
                          minPrice: "",
                          maxPrice: "",
                        });
                        setFilters({});
                        setIsOpen(false);
                      }}
                      variant={"ghost"}
                    >
                      Reset
                    </Button>
                    <Button type='button' onClick={form.handleSubmit(onSubmit)}>
                      {status === "pending" ? <Loader2 className='w-4 h-4 animate-spin' /> : "Apply"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className='flex flex-wrap gap-6'>
        {status !== "success" ? (
          <SkeletonCard1 />
        ) : services?.data?.length > 0 ? (
          services?.data?.map((item: any) => (
            <div
              key={item.title}
              className='relative cursor-pointer border border-transparent hover:border-black w-full sm:w-[355px] rounded-[15.12px] overflow-hidden'
              onClick={() => navigation.push(`market/${item.id}`)}
            >
              <div className='h-[240px] overflow-hidden'>
                <Image
                  src={item.media[0]}
                  width={500}
                  height={500}
                  alt='Image'
                  className='w-full object-cover h-full'
                />
              </div>
              <div className='relative px-[17.4px] py-[14px] bg-gray-50 flex flex-col gap-2'>
                <span className='flex justify-between gap-10'>
                  <p className='text-[15.12px] leading-normal text-black font-[600]'>{shortenText(item.tagline, 20)}</p>
                  <h6 className='text-[15.12px] flex font-[600] text-red-700'>
                    {`${item?.Service_Plans[0]?.symbol}${item?.Service_Plans[0]?.price || 0}`}
                  </h6>
                </span>

                <div className='flex gap-3'>
                  <Image
                    src={item?.Vendor?.User?.avatar || "/noavatar.png"}
                    width={100}
                    height={100}
                    className='h-[30px] w-[30px] rounded-full'
                    alt='Avatar'
                  />

                  <div className='flex flex-col gap-2'>
                    <p className='flex items-center text-black gap-2'>
                      <FaTrophy
                        fill={`${
                          item?.vendorRating?.rankingStatus === "Diamond"
                            ? "#76A1EE"
                            : item?.vendorRating?.rankingStatus === "Gold"
                            ? "#FFC400"
                            : item?.vendorRating?.rankingStatus === "Silver"
                            ? "#C1C5B8"
                            : "#CD7F32"
                        }`}
                      />
                      {item?.Vendor?.first_name || item?.Vendor?.User?.first_name}{" "}
                      {item?.Vendor?.last_name || item?.Vendor?.User?.last_name}
                      <span className='flex items-center'>
                        <Star fill='#F48E2F' className='h-5 w-5 text-[#F48E2F] ml-2' />
                        <p className='text-[#F48E2F] font-[500] pl-1'>{item?.vendorRating?.rating?.toFixed(0) || 0}</p>
                      </span>
                    </p>
                    <span className='flex items-center'>
                      <p className='text-[14px] text-black font-[400] pr-2 border-r border-black'>
                        {item?.vendorRating?.totalGigs || "--"} Jobs
                      </p>
                      <p className='text-[14px] text-black font-[400] pl-2'>
                        {item?.vendorRating?.completionPercentage || 0} Completion
                      </p>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='flex flex-col items-center justify-center w-full h-[150px] gap-4'>
            <Image src={empty} alt='empty' width={100} height={100} className='w-[100px] h-auto' />
            <p className='text-[#666666] text-center'>No Data</p>
          </div>
        )}
      </div>

      <Pagination className='mt-4'>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => goToPrevPage(page, setPage, setFilters)} isActive={page !== 1} />
          </PaginationItem>
          <PaginationItem>
            <p className='flex text-black items-center justify-center text-sm'>
              Page {page} of {totalPages}
            </p>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={() => goToNextPage(page, totalPages, setPage, setFilters)}
              isActive={page !== totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </Dashboard>
  );
};

const vendorRating = ["Unranked", "Bronze", "Silver", "Gold", "Diamond"];
const starRating = ["1", "2", "3", "4", "5"];

export default MarketPlace;
