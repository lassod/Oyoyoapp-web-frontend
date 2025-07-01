"use client";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { searchSchema } from "@/app/components/schema/Forms";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { FaChevronDown, FaChevronUp, FaFilter } from "react-icons/fa";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";
import { useGetCountries } from "@/hooks/events";
import { useGetGuestEventCategories } from "@/hooks/guest";

export const filterUpcoming = [
  "Filter by Date",
  "Today",
  "Tomorrow",
  "This Week",
  "Next Week",
  "This Month",
  "Next Month",
  "Next Year",
];
export const filterPast = ["Filter by Date", "Yesterday", "Last Week", "Last Month", "Last Year"];

export const FilterMenu = ({ type, placeholder, filterDateRange, setFilterDateRange }: any) => {
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    if (type === 1) setData(filterUpcoming);
    if (type === 2) setData(filterPast);
  }, [type]);

  return (
    <Select defaultValue={filterDateRange} onValueChange={(value) => setFilterDateRange(value)}>
      <SelectTrigger className='w-fit'>
        <Button size='no-padding' variant='link-gray' className='gap-2 pr-2'>
          <FaFilter className='w-4 h-4 cursor-pointer' />
          {placeholder || "Filter"}
        </Button>
      </SelectTrigger>
      <SelectContent>
        {data.map((date: string, index: number) => (
          <SelectItem key={index} value={date}>
            {date}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export const FilterMenuEvent = ({ item, setFilters, searchQuery, setSearchQuery }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [states, setStates] = useState([]);
  const [isOpenCountry, setIsOpenCountry] = useState(false);
  const [isOpenCategory, setIsOpenCategory] = useState(false);
  const [isOpenState, setIsOpenState] = useState(false);
  const { data: categories } = useGetGuestEventCategories();
  const { data: countries } = useGetCountries();

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
  });

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setFilters((prevFilters: any) => ({
      ...prevFilters,
      search: searchQuery.trim(),
    }));
  };

  const onSubmit = (values: z.infer<typeof searchSchema>) => {
    setFilters((prevFilters: any) => ({
      ...prevFilters,
      ...values,
    }));
    setIsOpen(false);
  };

  const ticketing = ["Free", "Paid"];

  return (
    <div className='mt-5'>
      <h3 className='font-medium'>{item && item?.title}</h3>

      <div className='flex gap-2 mt-3'>
        <DropdownMenu>
          <DropdownMenuTrigger className='h-[42px]' asChild>
            <div
              onClick={() => setIsOpen(!isOpen)}
              className='flex text-sm font-normal gap-3 border border-gray-300 hover:border-red-700 hover:text-red-700 items-center px-4 rounded-lg cursor-pointer'
            >
              <FaFilter className='w-4 h-4 cursor-pointer' />
              Filter
              {isOpen ? <FaChevronUp className='w-3 h-3' /> : <FaChevronDown className='w-3 h-3' />}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='max-h-[400px] sm:max-h-[450px] px-2 overflow-scroll'>
            <Form {...form}>
              <form className='flex flex-col gap-2 p-5'>
                <div className='grid grid-cols-2 gap-3'>
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
                              disabled={!states?.length}
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
                  name='category'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Popover open={isOpenCategory} onOpenChange={setIsOpenCategory}>
                        <PopoverTrigger asChild>
                          <Button
                            variant='combobox'
                            role='combobox'
                            size={"sm"}
                            className={cn(!field.value && "text-gray-400")}
                          >
                            {field.value ? field.value : "Select a category"}
                            <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-full p-0'>
                          <Command>
                            <CommandInput placeholder='Search categories...' />
                            <CommandList>
                              <CommandEmpty>No category found.</CommandEmpty>
                              <CommandGroup>
                                {categories?.map((item: any) => (
                                  <CommandItem
                                    value={item.name}
                                    key={item.name}
                                    onSelect={() => {
                                      form.setValue("category", item.name);
                                      setIsOpenCategory(false);
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
                <FormField
                  control={form.control}
                  name='eventTicketing'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ticketing</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger className={cn(!field.value && "text-gray-400")}>
                          <SelectValue placeholder='Select ticket type' />
                        </SelectTrigger>
                        <SelectContent>
                          {ticketing.map((ticket: string) => (
                            <SelectItem key={ticket} value={ticket}>
                              {ticket}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <div className='flex gap-4 sticky bottom-0 mt-4 bg-white py-2 shadow'>
                  <Button
                    type='button'
                    className='text-red-700'
                    onClick={() => {
                      form.reset({
                        country: "",
                        state: "",
                        eventTicketing: "",
                        category: "",
                      });
                      setFilters({});
                      setIsOpen(false);
                    }}
                    variant={"ghost"}
                  >
                    Reset
                  </Button>
                  <Button type='button' onClick={form.handleSubmit(onSubmit)} variant={"secondary"}>
                    Apply
                  </Button>
                </div>
              </form>
            </Form>
          </DropdownMenuContent>
        </DropdownMenu>
        <Input value={searchQuery} onChange={handleSearchInput} placeholder='Search events' className='max-w-[300px]' />
      </div>
    </div>
  );
};
