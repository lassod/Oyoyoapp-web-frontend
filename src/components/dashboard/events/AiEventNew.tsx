"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { formAiEvents } from "@/app/components/schema/Forms";
import { Dashboard, DashboardHeader, DashboardHeaderText } from "@/components/ui/containers";
import { CalendarRange, Check, ChevronDown, Loader2 } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useGetCountries, useGetEventTypesinCategory } from "@/hooks/events";
import { useGetUser } from "@/hooks/user";
import { Textarea } from "@/components/ui/textarea";
import { usePostAiEvent } from "@/hooks/aievent";
import { Calendar } from "@/components/ui/calendar";
import { calculateEventDurationInDays } from "@/lib/auth-helper";
import { postOpenAi } from "@/hooks/openai";
import { useGetGuestEventCategories } from "@/hooks/guest";

const AiEventNew = ({ event }: any) => {
  const { data: allCategories } = useGetGuestEventCategories();
  const { data: user } = useGetUser();
  const { mutation } = usePostAiEvent();
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [isOpenCountry, setIsOpenCountry] = useState(false);
  const [isOpenCategory, setIsOpenCategory] = useState(false);
  const [isOpenType, setIsOpenType] = useState(false);
  const [isOpenState, setIsOpenState] = useState(false);
  const { data: eventTypes } = useGetEventTypesinCategory(event?.eventCategoriesId);
  const { data: countries } = useGetCountries();

  const form = useForm<z.infer<typeof formAiEvents>>({
    resolver: zodResolver(formAiEvents),
  });

  console.log(event);
  useEffect(() => {
    if (event && eventTypes?.length > 0 && allCategories?.length > 0) {
      const event_type = eventTypes?.find((item: any) => event.event_types === item.id);
      const event_category = allCategories?.find((item: any) => event.eventCategoriesId === item.id);
      const days = calculateEventDurationInDays(event);

      form.reset({
        title: event?.title || "",
        event_type: event_type?.name || "",
        event_category: event_category?.name || "",
        country: event?.country && event?.country !== "undefined" && event?.country,
        state: event?.state && event?.state !== "undefined" && event?.state,
        town: event?.town && event?.town !== "undefined" && event?.town,
        number_of_guests: event?.capacity.toString() || "",
        number_of_aays: days,
        Plan_Details: event?.description || "",
        event_owner: `${event?.User?.first_name} ${event?.User?.last_name || event?.User?.username}` || "",
        budget: `1000 ${event?.User?.preferredCurrency || "NGN"}`,
        duration: `${days * 24 || 0} Hours`,
        Date_and_Time: new Date(event?.date),
      });
    }
  }, [event, eventTypes, allCategories]);

  const onSubmit = async (values: z.infer<typeof formAiEvents>) => {
    setLoading(true);
    const current_date = new Date().toISOString();
    const eventDate = new Date(event.date);
    const datePart = eventDate.toLocaleDateString();
    const timePart = eventDate.toLocaleTimeString();
    // Prepare data for OpenAI prompt and mutation
    const data = {
      id: event?.id,
      vendor_type: "event planner",
      meta_data: [{ ...values, current_date, Date_and_Time: `${datePart} ${timePart}` }],
    };

    const finalData = await postOpenAi(data);
    mutation.mutate(finalData, {
      onSuccess: () => (window.location.href = "aievent-planner"),
    });
    setLoading(false);
  };

  return (
    <>
      <DashboardHeader>
        <DashboardHeaderText>AI Event Planner</DashboardHeaderText>
      </DashboardHeader>
      <Dashboard className='mx-auto bg-white mt-20'>
        <div className='max-w-[596px] mx-auto w-full'>
          <h6 className='text-black font-semibold'>Event Plan</h6>
          <p className='border-b border-gray-200 pt-1 pb-2'>Kindly fill the following form</p>
          <Form {...form}>
            <form
              className='bg-white mt-4 flex flex-col gap-3 shadow-md p-5 rounded-lg'
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <Label>Title</Label>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='event_category'
                render={({ field }) => (
                  <FormItem>
                    <Label>Event category</Label>
                    <Popover open={isOpenCategory} onOpenChange={setIsOpenCategory}>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          role='combobox'
                          size={"sm"}
                          className={cn(!field.value ? "text-gray-400 font-normal" : "font-normal")}
                        >
                          {field.value
                            ? allCategories?.find((category: { name: string }) => category.name === field.value)?.name
                            : "Select event category"}
                          <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-full p-0'>
                        <Command>
                          <CommandInput placeholder='Search categories...' />
                          <CommandList>
                            <CommandEmpty>No category found.</CommandEmpty>
                            <CommandGroup>
                              {allCategories?.map((category: { name: string }) => (
                                <CommandItem
                                  value={category.name}
                                  key={category.name}
                                  onSelect={() => {
                                    form.setValue("event_category", category.name);
                                    setIsOpenCategory(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      category.name === field.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />

                                  {category.name}
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
                name='event_type'
                render={({ field }) => (
                  <FormItem>
                    <Label>Event type</Label>
                    <Popover open={isOpenType} onOpenChange={setIsOpenType}>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          role='combobox'
                          size={"sm"}
                          className={cn(!field.value ? "text-gray-400 font-normal" : "font-normal")}
                        >
                          {field.value
                            ? eventTypes?.find((category: { name: string }) => category.name === field.value)?.name
                            : "Select event type"}
                          <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-full p-0'>
                        <Command>
                          <CommandInput placeholder='Search event types...' />
                          <CommandList>
                            <CommandEmpty>No event type found.</CommandEmpty>
                            <CommandGroup>
                              {eventTypes?.map((category: { name: string }) => (
                                <CommandItem
                                  value={category.name}
                                  key={category.name}
                                  onSelect={() => {
                                    form.setValue("event_type", category.name);
                                    setIsOpenType(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      category.name === field.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />

                                  {category.name}
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
                name='number_of_aays'
                render={({ field }) => (
                  <FormItem>
                    <Label>Duration (Days)</Label>
                    <Input placeholder='3 Days' {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='budget'
                render={({ field }) => (
                  <FormItem>
                    <Label>Event budget</Label>
                    <Input placeholder={user?.preferredCurrency} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='number_of_guests'
                render={({ field }) => (
                  <FormItem>
                    <Label>Number of guest</Label>
                    <Input placeholder='10' {...field} />
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
                    <Label>State</Label>
                    <Popover open={isOpenState} onOpenChange={setIsOpenState}>
                      <PopoverTrigger asChild>
                        <Button
                          variant='combobox'
                          role='combobox'
                          size={"sm"}
                          className={cn(!field.value && "text-gray-400")}
                        >
                          {field.value ? field.value : "Select a state"}
                          <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-full p-0'>
                        <Command>
                          <CommandInput placeholder='Search countries...' />
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

              <FormField
                control={form.control}
                name='town'
                render={({ field }) => (
                  <FormItem>
                    <Label>Town</Label>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='Date_and_Time'
                render={({ field }) => (
                  <FormItem className='mt-1'>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={"outline"} className='w-full'>
                          <CalendarRange className='h-[20px] w-[20px] mr-2' />
                          {field.value ? (
                            new Date(field.value) instanceof Date && !isNaN(new Date(field.value).getTime()) ? (
                              new Date(field.value).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            ) : (
                              <span>Invalid Date</span>
                            )
                          ) : (
                            <span>Event Date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-full p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date("2027-01-01") || date < new Date()} // Prevent selection of past dates
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='event_owner'
                render={({ field }) => (
                  <FormItem>
                    <Label>Event owner</Label>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='Plan_Details'
                render={({ field }) => (
                  <FormItem className='mt-1'>
                    <Label>Plan details</Label>
                    <Textarea {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='relative w-full h-12 mt-6'>
                <Button disabled={mutation.isPending || loading} className='absolute right-0 w-auto px-7' type='submit'>
                  {mutation.isPending || loading ? <Loader2 className='w-5 h-5 animate-spin' /> : "Create plan"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Dashboard>
    </>
  );
};

export default AiEventNew;
