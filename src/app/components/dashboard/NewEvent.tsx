"use client";
import React, { useEffect } from "react";
import { FormsContainer, StepsContainer } from "@/components/ui/containers";
import { Form, FormDescription, FormLabel, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MultiSelect } from "@/components/ui/multi-select";
import { ArrowRightCircleIcon, Loader2, PlusCircle, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddButtonContainer, FileDisplay, AddButton, Button } from "@/components/ui/button";
import { DashboardContainer, DashboardContainerContent } from "@/components/ui/containers";
import { useGetVendors } from "@/hooks/vendors";
import { formSchemaEvents } from "@/app/components/schema/Forms";
import { EventHeader, Steps } from "@/app/components/business/eventsData/EventsData";
import { Check, ChevronDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useGetCountries, useGetEventTypesinCategory } from "@/hooks/events";
import { ArrowLeftCircleIcon } from "lucide-react";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { formSchemaTimeLocation } from "@/app/components/schema/Forms";
import { useSession } from "next-auth/react";
import { Label } from "@/components/ui/label";
import "./NewEvent.css";
import { useGetGuestEventCategories } from "@/hooks/guest";
import axios from "axios";
import { scrollToTop } from "@/lib/auth-helper";
import { FormBuilder, TermsAndConditions } from "./FormBuilder";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AlertDialog, AlertDialogAction, ErrorModal } from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { useGetOnboardingStatus } from "@/hooks/wallet";

export const EventsDetailsPage = ({ eventData, onNext }: any) => {
  const { data: allCategories } = useGetGuestEventCategories();
  const [allVendors, setAllVendors] = useState<any>([]);
  const [eventCategoryId, setEventCategoryId] = useState<any>(null);
  const { data: eventTypes } = useGetEventTypesinCategory(eventCategoryId);
  const { data: vendorsData } = useGetVendors();
  const [media, setMedia] = useState<(File | string)[]>([]);
  const [isOpenCategory, setIsOpenCategory] = useState(false);
  const [isOpenType, setIsOpenType] = useState(false);
  const [isOnboard, setIsOnboard] = useState(false);
  const { data: onboardStatus } = useGetOnboardingStatus();
  const router = useRouter();

  useEffect(() => {
    if (onboardStatus)
      if (!onboardStatus?.onboardingStatus) setIsOnboard(true);
      else if (onboardStatus.kycRecord?.status !== "APPROVED") setIsOnboard(true);
  }, [onboardStatus]);

  const form = useForm<z.infer<typeof formSchemaEvents>>({
    resolver: zodResolver(formSchemaEvents),
  });

  useEffect(() => {
    if (eventData) {
      setMedia(eventData?.media || []);
      setEventCategoryId(eventData?.eventCategoryId || "");
      form.reset({
        ...eventData,
        event_types: eventData?.event_types?.toString() || "",
        vendors: eventData?.vendorsName || [],
      });
    }
  }, [eventData]);

  const handleFileChange = (newFiles: File[]) => {
    if (newFiles.length > 0) setMedia((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => setMedia((prev) => prev.filter((_, i) => i !== index));

  useEffect(() => {
    if (vendorsData && allCategories) {
      const enrichedVendors = vendorsData.map((vendor: any) => {
        const category = allCategories.find((cat: any) => cat.id === vendor.CategoryId);
        return {
          ...vendor,
          categoryName: category ? category.name : "Unknown Category", // Fallback if no category is found
        };
      });
      setAllVendors(enrichedVendors);
    }
  }, [vendorsData, allCategories]);

  const onSubmit = async (values: z.infer<typeof formSchemaEvents>) => {
    let selectedVendorNames: any = [];
    if (values.vendors) selectedVendorNames = values.vendors.map((name) => name.trim()); // Use map to trim each name in the array

    const vendors = allVendors
      ?.filter((item: any) => {
        const fullName = `${item.User.first_name} ${item.User.last_name}`;
        return selectedVendorNames.includes(fullName);
      })
      .map((item: { id: number }) => item.id);

    onNext({
      eventCategoryId,
      ...values,
      vendors: vendors,
      vendorsName: values.vendors,
      media,
    });
  };

  const eventsDetailsData = {
    step: "Step 1 of 3",
    title: "Event details",
    text: "Please provide information about your event.",
  };

  console.log(form.getValues("isSprayingEnabled"));
  return (
    <FormsContainer>
      <EventHeader />

      <StepsContainer>
        <Steps data={eventsDetailsData} />
      </StepsContainer>

      <DashboardContainer>
        <h6>Create Event</h6>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DashboardContainerContent>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem className='mt-2'>
                    <Input placeholder='Event title' {...field} />
                    <FormMessage className='relative top-1' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem className='mt-4'>
                    <Textarea placeholder='Enter description' {...field} />
                    <FormDescription className='text-gray-400 top-1'>Maximum of 1000 characters</FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='organizer'
                render={({ field }) => (
                  <FormItem className='mt-2'>
                    <Input placeholder='Event organizer' {...field} />
                    <FormMessage className='relative top-1' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='eventCategory'
                render={({ field }) => (
                  <FormItem className='mt-5'>
                    <Popover open={isOpenCategory} onOpenChange={setIsOpenCategory}>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          role='combobox'
                          size={"sm"}
                          className={cn(!field.value ? "text-gray-400 font-normal" : "font-normal")}
                        >
                          {field.value ? field.value : "Event category"}
                          <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-full p-0'>
                        <Command>
                          <CommandInput placeholder='Search categories...' />
                          <CommandList>
                            <CommandEmpty>No category found.</CommandEmpty>
                            <CommandGroup>
                              {allCategories?.map((category: any) => (
                                <CommandItem
                                  value={category.name}
                                  key={category.name}
                                  onSelect={() => {
                                    setEventCategoryId(category.id);
                                    form.setValue("eventCategory", category.name);
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
              <div className='grid grid-cols-2 items-center max-w-full gap-4 mt-3'>
                <FormField
                  control={form.control}
                  name='event_types'
                  render={({ field }) => (
                    <FormItem>
                      <Popover open={isOpenType} onOpenChange={setIsOpenType}>
                        <PopoverTrigger asChild>
                          <Button
                            variant='outline'
                            role='combobox'
                            disabled={!eventCategoryId && !eventTypes?.length}
                            size={"sm"}
                            className={cn(!field.value ? "text-gray-400 font-normal" : "font-normal")}
                          >
                            {field.value
                              ? eventTypes?.find((category: any) => category.id === parseInt(field.value))?.name
                              : "Event types"}
                            <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-full p-0'>
                          <Command>
                            <CommandInput placeholder='Search event types...' />
                            <CommandList>
                              <CommandEmpty>No event type found.</CommandEmpty>
                              <CommandGroup>
                                {eventTypes?.map((category: any) => (
                                  <CommandItem
                                    value={category.id}
                                    key={category.name}
                                    onSelect={() => {
                                      form.setValue("event_types", category.id.toString());
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
                  name='event_ticketing'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <Select onValueChange={(value) => field.onChange(value)} defaultValue={field.value}>
                        <SelectTrigger className={cn(!field.value && "text-gray-400")}>
                          <SelectValue placeholder={field.value || "Event ticketing"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Free'>Free</SelectItem>
                          <SelectItem value='Paid'>Paid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </DashboardContainerContent>

            <DashboardContainerContent>
              <h6>Event capacity</h6>
              <FormField
                control={form.control}
                name='capacity'
                render={({ field }) => (
                  <FormItem className='mt-2'>
                    <Input placeholder='Enter capacity' {...field} />
                    <FormMessage className='relative top-1' />
                  </FormItem>
                )}
              />
            </DashboardContainerContent>

            <DashboardContainerContent>
              <h6>Event Media</h6>
              <AddButtonContainer>
                <AddButton title='Upload images (PNG, JPG format)' onFileChange={handleFileChange} isMultiple={true} />
                <FileDisplay files={media} onRemove={handleRemoveFile} isMultiple={true} />
              </AddButtonContainer>
            </DashboardContainerContent>

            <DashboardContainerContent>
              <h6>Event vendors</h6>
              <FormField
                control={form.control}
                name='vendors'
                render={({ field }) => (
                  <FormItem>
                    <MultiSelect
                      options={allVendors}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      placeholder='Search for a vendor'
                      animation={2}
                      maxCount={2}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </DashboardContainerContent>
            <DashboardContainerContent>
              <h6>Spray feature</h6>
              <FormField
                control={form.control}
                name='isSprayingEnabled'
                render={({ field }) => (
                  <FormItem className='flex flex-col gap-2 rounded-lg border p-3 shadow-sm mt-1'>
                    <div className='flex gap-4'>
                      <Switch className='mt-2' checked={field.value} onCheckedChange={field.onChange} />
                      <div className='space-y-2'>
                        <FormLabel className='text-base'>Enable Spraying Feature</FormLabel>
                        <p>
                          Allow guests to spray digital cash during your event. Sprayed funds go directly to your Oyoyo
                          wallet.
                        </p>
                      </div>
                    </div>
                    <div className='flex gap-4'>
                      <Switch className='mt-2' onCheckedChange={field.onChange} />
                      <div className='space-y-2'>
                        <FormLabel className='text-base'>Include Musician in Spraying Room?</FormLabel>
                        <p>Enable this option if you want guests to spray both you and a musician during the event.</p>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </DashboardContainerContent>
            <DashboardContainerContent>
              <h6>Event visibility</h6>
              <FormField
                control={form.control}
                name='privacy'
                render={({ field }) => (
                  <FormItem className='flex flex-col gap-2 rounded-lg border p-3 shadow-sm mt-1'>
                    <FormLabel className='text-base'>{field.value === "Private" ? "Private" : "Public"}</FormLabel>
                    <div className='flex gap-4'>
                      <Switch
                        checked={field.value === "Private"} // ✅ Checked means Private
                        onCheckedChange={(checked) => field.onChange(checked ? "Private" : "Public")}
                      />
                      <p>
                        {field.value === "Private"
                          ? "Your event will only be visible to you. To allow others to attend, you will need to share the event link or invite them via email."
                          : "Your event will be visible to everyone on the platform. Anyone can find, view, and join your event."}{" "}
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </DashboardContainerContent>

            <Button type='submit' className='mt-4'>
              Next
              <ArrowRightCircleIcon className='ml-2 h-4 w-4' />
            </Button>
          </form>
        </Form>
      </DashboardContainer>
      {isOnboard && (
        <AlertDialog open={true}>
          <ErrorModal
            description={`You KYC status is ${
              onboardStatus?.kycRecord?.status || "Not started"
            }, you can't create an event`}
          >
            <AlertDialogAction
              onClick={() => {
                router.push("/dashboard/wallet/verification");
              }}
            >
              View KYC status
            </AlertDialogAction>
          </ErrorModal>
        </AlertDialog>
      )}
    </FormsContainer>
  );
};

export const TimeLocationPage = ({ eventData, onNext, onPrev, isPending }: any) => {
  const [repeat, setRepeat] = useState(false);
  const [eventLocation, setEventLocation] = useState("Physical");
  const [latitude, setLatitude] = useState(27139);
  const [longitude, setLongitude] = useState(271394);
  const [customDates, setCustomDates] = useState<string[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [states, setStates] = useState([]);
  const [isOpenCountry, setIsOpenCountry] = useState(false);
  const [isOpenState, setIsOpenState] = useState(false);
  const { data: countries } = useGetCountries();
  const [suggestions, setSuggestions] = useState<any>([]);
  const [address, setAddress] = useState("");
  const [custom_fields, setCustom_fields] = useState<any>([]);
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [is24Hours, setIs24Hours] = useState(false);
  const session = useSession();

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToTop();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const form = useForm<z.infer<typeof formSchemaTimeLocation>>({
    resolver: zodResolver(formSchemaTimeLocation),
  });

  useEffect(() => {
    if (eventData) {
      const parsedDate = eventData?.date && new Date(eventData?.date);
      const parsedEndTime = eventData?.endTime && new Date(eventData?.endTime);
      const isValidDate = (date: any) => date instanceof Date && !isNaN(date.getTime());

      form.reset({
        date: isValidDate(parsedDate) && parsedDate, // Use current date if invalid
        endTime: isValidDate(parsedEndTime) && parsedEndTime, // Use current endTime if invalid
        frequency: eventData?.frequency && eventData?.frequency,
        externalLink: eventData?.externalLink && eventData?.externalLink,
        state: eventData?.state && eventData?.state,
        country: eventData?.country && eventData?.country,
        address: eventData?.address && eventData?.address,
      });

      if (eventData?.frequency) setRepeat(true);
      if (eventData?.custom_fields) setCustom_fields(eventData.custom_fields);
      if (eventData?.termsAndConditions) setTermsAndConditions(eventData.termsAndConditions);
      if (eventData?.is24Hours) setIs24Hours(eventData.is24Hours);
    }
  }, [eventData]);
  console.log(eventData);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);

          console.log(`Latitude: ${latitude}`);
          console.log(`Longitude: ${longitude}`);
        },
        (err) => {
          console.log(err.message);
        }
      );
    } else console.log("Geolocation is not supported by this browser.");
  }, [latitude, longitude]);

  const handleAddressChange = async (e: any) => {
    const query = e.target.value;
    const selectedCountry = form.getValues("country");
    const selectedState = form.getValues("state");
    setAddress(query); // Update the input value as the user types

    if (query.length > 2) {
      try {
        const response = await axios.get(`https://api.locationiq.com/v1/autocomplete.php`, {
          params: {
            key: process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY, // Use your LocationIQ API key
            q: `${query}, ${selectedState}, ${selectedCountry}`, // Add state and country to refine the query
            limit: 5, // Limit the number of suggestions
            format: "json",
          },
        });

        setSuggestions(response.data); // Update suggestions based on response
      } catch (error) {
        console.error("Error fetching address suggestions:", error);
      }
    } else {
      setSuggestions([]); // Clear suggestions if the query is too short
    }
  };

  const handleSelectSuggestion = (suggestion: any) => {
    setAddress(suggestion.display_name);
    form.setValue("address", suggestion.display_name); // Set the selected address
    setSuggestions([]); // Clear suggestions after selection
  };

  const onSubmit = (values: z.infer<typeof formSchemaTimeLocation>) => {
    console.log(values);
    const data = {
      ...values,
      latitude,
      longitude,
      UserId: session?.data?.user?.id,
      customDates,
      custom_fields,
      termsAndConditions,
      is24Hours,
    };

    let submit = false;
    if (eventData?.event_ticketing === "Free") submit = true;

    onNext(data, submit);
  };

  const timeLocationData = {
    step: "Step 2 of 3",
    title: "Event time and location",
    text: "Please provide information about your event.",
  };

  console.log(form.watch("date"));
  return (
    <FormsContainer>
      <EventHeader />
      <StepsContainer>
        <Steps data={timeLocationData} />
      </StepsContainer>
      <DashboardContainer>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DashboardContainerContent>
              <h6>Create Event</h6>
              <div className='flex items-center gap-2'>
                <Switch id='time-format-switch' checked={is24Hours} onCheckedChange={setIs24Hours} />
                <label htmlFor='time-format-switch' className='text-sm'>
                  Use 24-hour time format
                </label>
              </div>

              <div className='grid sm:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='date'
                  render={({ field }) => (
                    <FormItem className='mt-1'>
                      <DateTimePicker
                        label='Start Date'
                        value={field.value ? dayjs(field.value) : null} // Convert JS Date to dayjs
                        onChange={(val) => field.onChange(val?.toDate())} // Convert back to JS Date
                        ampm={!is24Hours}
                        disablePast={true}
                        viewRenderers={{
                          hours: renderTimeViewClock,
                          minutes: renderTimeViewClock,
                          seconds: renderTimeViewClock,
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                            variant: "outlined",
                          },
                        }}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='endTime'
                  render={({ field }) => (
                    <FormItem className='mt-1'>
                      <DateTimePicker
                        label='End Date'
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(val) => field.onChange(val?.toDate())}
                        ampm={!is24Hours}
                        disablePast={true}
                        minDateTime={form.watch("date") ? dayjs(form.watch("date")) : dayjs()}
                        viewRenderers={{
                          hours: renderTimeViewClock,
                          minutes: renderTimeViewClock,
                          seconds: renderTimeViewClock,
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                            variant: "outlined",
                          },
                        }}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </DashboardContainerContent>

            <DashboardContainerContent>
              <div className='max-w-full flex flex-row gap-[8px] items-center'>
                <Switch id='airplane-mode' onClick={() => setRepeat(!repeat)} className='border border-gray-200' />{" "}
                <p className='font-medium text-black'>Does this event repeat</p>
              </div>
            </DashboardContainerContent>

            {repeat && (
              <DashboardContainerContent>
                <h6>Repeat event</h6>
                <FormField
                  control={form.control}
                  name='frequency'
                  render={({ field }) => (
                    <FormItem className='mt-2'>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          if (value === "CUSTOM") setShowCalendar(true);
                          else setShowCalendar(false);
                        }}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className={cn(!field.value && "text-gray-400")}>
                          <SelectValue placeholder='Select the frequency' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='NEVER'>NEVER</SelectItem>
                          <SelectItem value='DAILY'>DAILY</SelectItem>
                          <SelectItem value='WEEKLY'>WEEKLY</SelectItem>
                          <SelectItem value='CUSTOM'>CUSTOM</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showCalendar && (
                  <Button
                    type='button'
                    variant={"outline"}
                    className='w-full h-full items-start flex md:flex-col justify-between sm:flex-row'
                  >
                    <Calendar
                      mode='single'
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          const formattedDate = date.toISOString();
                          setCustomDates([...customDates, formattedDate]);
                          setSelectedDate(date);
                        }
                      }}
                      disabled={(date) => date > new Date("2027-01-01") || date < new Date()} // Prevent selection of past dates
                      initialFocus
                    />
                    <div className='flex flex-col w-full bg-gray-50 h-full py-5'>
                      <FormLabel className='mb-3'>Selected Custom Dates:</FormLabel>
                      <ul>
                        {customDates.map((date, index) => (
                          <p key={index}>{date.split("T")[0]}</p>
                        ))}
                      </ul>
                    </div>
                  </Button>
                )}
              </DashboardContainerContent>
            )}

            <DashboardContainerContent>
              <h6>Event location</h6>

              <Select onValueChange={(value) => setEventLocation(value)} defaultValue={eventLocation}>
                <SelectTrigger className={cn(eventLocation && "text-gray-400")}>
                  <SelectValue placeholder='Virtual' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Virtual'>Virtual</SelectItem>
                  <SelectItem value='Physical'>Physical</SelectItem>
                </SelectContent>
              </Select>

              {eventLocation === "Virtual" ? (
                <div>
                  <FormField
                    control={form.control}
                    name='externalLink'
                    render={({ field }) => (
                      <FormItem className='mt-2'>
                        <p className='text-black font-medium bottom-[-5px] relative'>External link</p>
                        <p className='relative bottom-[-5px]'>
                          Add a link so people can live stream your event when it starts
                        </p>
                        <Input {...field} placeholder='https://' />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <>
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
                  <FormField
                    control={form.control}
                    name='address'
                    render={({}) => (
                      <FormItem className='mt-2'>
                        <div>
                          <Input
                            value={address}
                            type='text'
                            placeholder='Type your address...'
                            className='address-input'
                            onChange={handleAddressChange}
                          />
                          {suggestions.length > 0 && (
                            <ul className='bg-white flex flex-col gap-3 mt-6 p-4 shadow-lg rounded'>
                              {suggestions.map((suggestion: any, index: number) => (
                                <li
                                  className='bg-gray-50 hover:bg-gray-100 cursor-pointer p-2'
                                  key={index}
                                  onClick={() => handleSelectSuggestion(suggestion)}
                                >
                                  <p className='font-medium text-black'>{suggestion.display_name}</p>
                                  <p className='text-xs mt-2'>
                                    {suggestion.address.state}, {suggestion.address.country}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </DashboardContainerContent>

            <DashboardContainerContent>
              <div className='flex justify-between border-b pb-2'>
                <div className='flex flex-col gap-2'>
                  <h6>Custom Registration Questions</h6>
                  <p>Create custom questions to get the information you need from your attendees.</p>
                </div>
                <p className='text-xs'>Optional</p>
              </div>
              <div className='mt-4'>
                <FormBuilder customFields={custom_fields} setCustomFields={setCustom_fields} edit={true} />
              </div>
            </DashboardContainerContent>
            <DashboardContainerContent>
              <div className='flex justify-between mt-2 pb-2'>
                <div className='flex flex-col gap-2'>
                  <h6>Terms and Conditions</h6>
                  <p>Add terms and conditions that attendees must agree to when registering for your event.</p>
                </div>
                <p className='text-xs'>Optional</p>
              </div>
              <TermsAndConditions
                termsAndConditions={termsAndConditions}
                setTermsAndConditions={setTermsAndConditions}
                edit={true}
              />
            </DashboardContainerContent>
            <div className='flex mt-6 w-[200px] sm:w-[300px] mx-auto gap-[16px]'>
              <Button
                type='button'
                className='flex items-center gap-1'
                onClick={() =>
                  onPrev({
                    ...form.getValues(),
                    customDates,
                    custom_fields,
                    termsAndConditions,
                    is24Hours,
                  })
                }
                variant={"secondary"}
              >
                <ArrowLeftCircleIcon className='h-4 w-4' /> Back
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <div className='flex gap-2 items-center'>
                    Next
                    <ArrowRightCircleIcon className='h-4 w-4' />
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DashboardContainer>
    </FormsContainer>
  );
};

export const Tickets = ({ eventData, onNext, onPrev, isPending }: any) => {
  const [selectedTab, setSelectedTab] = useState("Regular");
  const [items, setItems] = useState<any>({});
  const [customCategory, setCustomCategory] = useState("1");
  const [plans, setPlans] = useState(["Category 1"]);

  const generateFormSchema = (categories: string[]) => {
    const schema: any = {};

    categories.forEach((category) => {
      schema[`${category}Name`] = z.string().min(2, "Name is required.");
      schema[`${category}Description`] = z.string().min(2, "Description is required.");
      schema[`${category}Price`] = z.string().regex(/^\d+(\.\d+)?$/, "Only numbers are allowed.");
    });

    return z.object(schema);
  };

  const formSchema = generateFormSchema(plans);

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    handleCategoryUpdate(1);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToTop();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCategoryUpdate = (num: number) => {
    if (isNaN(num) || num < 1 || num > 6) return; // Ensure valid input

    const newPlans = Array.from({ length: num }, (_, i) => `Category ${i + 1}`);
    setPlans(newPlans);
    setSelectedTab(newPlans[0]);

    setItems((prev: any) =>
      newPlans.reduce((acc: any, category: any) => {
        acc[category] = prev[category] || [];
        return acc;
      }, {})
    );
  };

  const generateTabFields = (category: string) => [
    { name: `${category}Name`, placeholder: `${category} Name`, type: "input" },
    { name: `${category}Description`, placeholder: `${category} Description`, type: "textarea" },
    { name: `${category}Price`, placeholder: "Enter price", type: "text" },
  ];

  const tabFields: any = plans.reduce((acc: any, category) => {
    acc[category] = generateTabFields(category);
    return acc;
  }, {});

  const onSubmit = (values: any) => {
    const selectedPlans = plans.map((category) => {
      return {
        name: values[`${category}Name`] || category,
        description: values[`${category}Description`] || "",
        price: values[`${category}Price`] || "0",
        items: items[category] || [], // Handle empty array case
      };
    });

    // Remove empty categories (i.e., those without a description)
    const filteredPlans = selectedPlans.filter((plan) => plan.description.trim() !== "");

    const updatedData = {
      ...eventData,
      plans: filteredPlans,
    };
    onNext(updatedData, true);
  };

  const ticketsPriceData = {
    step: "Step 3 of 3",
    title: "Setup ticket prices",
    text: "Provide event ticket prices.",
  };

  return (
    <FormsContainer>
      <EventHeader />

      <StepsContainer>
        <Steps data={ticketsPriceData} />
      </StepsContainer>

      <DashboardContainer>
        <h6 className='mb-4'>Create event</h6>

        <div className='flex flex-col gap-[15px]'>
          <Label>Number of Ticket Categories (Max: 6)</Label>
          <Input
            type='number'
            min='1'
            max='6'
            placeholder='Enter number of categories (1 - 6)'
            value={customCategory}
            onChange={(e) => {
              let value: any = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
              if (value > 6) value = "6";
              setCustomCategory(value);
              handleCategoryUpdate(parseInt(value));
            }}
          />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DashboardContainerContent>
              <div>
                <div className='flex flex-wrap border-b'>
                  {plans.map((option) => (
                    <button
                      type='button'
                      key={option}
                      className={`px-4 py-2 hover:text-black ${
                        selectedTab === option ? "border-b-2 border-red-500 font-semibold" : "text-gray-500"
                      }`}
                      onClick={() => setSelectedTab(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <div>
                  {plans.map((category) => (
                    <div key={category} className={selectedTab === category ? "block" : "hidden"}>
                      {tabFields[category]?.map((field: any) => (
                        <FormField
                          key={field.name}
                          control={form.control}
                          name={field.name}
                          render={({ field: formField }) => (
                            <FormItem>
                              {field.type === "textarea" ? (
                                <Textarea placeholder={field.placeholder} className='my-2' {...formField} />
                              ) : (
                                <Input placeholder={field.placeholder} className='mb-2 mt-4' {...formField} />
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}

                      {/* ✅ Add Items Section Inside Each Category */}
                      <div>
                        {items[category] &&
                          items[category].map((item: any, index: number) => (
                            <div
                              key={index}
                              className='grid grid-cols-[1fr,20px] mt-3 w-full items-center gap-2 sm:gap-4 mb-2'
                            >
                              <Input
                                placeholder={`Item ${index + 1}`}
                                value={item}
                                onChange={(e) => {
                                  const newItems = [...items[category]];
                                  newItems[index] = e.target.value;
                                  setItems((prev: any) => ({ ...prev, [category]: newItems }));
                                }}
                              />
                              <button
                                type='button'
                                className='text-red-500 hover:text-red-700'
                                onClick={() => {
                                  setItems((prev: any) => {
                                    const newItems = [...prev[category]];
                                    newItems.splice(index, 1);
                                    return { ...prev, [category]: newItems };
                                  });
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}

                        {/* ✅ Add Item Button */}
                        <button
                          type='button'
                          className='flex items-center mt-3 gap-2 text-red-700 hover:text-black'
                          onClick={() => {
                            setItems((prev: any) => ({
                              ...prev,
                              [category]: [...prev[category], ""],
                            }));
                          }}
                        >
                          <PlusCircle className='w-5 h-5' /> Add Item
                        </button>

                        <p className='bg-green-50 border border-green-500 text-green-500 p-3 rounded-lg mt-3 text-sm max-w-[350px]'>
                          Click on “Add item” to include packages that come with the ticket.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DashboardContainerContent>

            <div className='flex mt-4 w-[350px] mx-auto gap-[16px]'>
              <Button
                type='button'
                className='flex items-center gap-1'
                onClick={() =>
                  onPrev({
                    ...form.getValues(),
                    items,
                  })
                }
                variant={"secondary"}
              >
                <ArrowLeftCircleIcon className='h-4 w-4' /> Back
              </Button>

              <Button type='submit' disabled={isPending}>
                {isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : "Post event"}
              </Button>
            </div>
          </form>
        </Form>
      </DashboardContainer>
    </FormsContainer>
  );
};
