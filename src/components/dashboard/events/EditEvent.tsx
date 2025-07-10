"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftCircle,
  CalendarDays,
  Check,
  ChevronDown,
  Loader2,
  MapPinIcon,
  MoreHorizontal,
  Download,
  DownloadIcon,
} from "lucide-react";
import {
  DashboardContainer,
  DashboardContainerContent,
  DashboardHeader,
  DashboardHeaderText,
} from "@/components/ui/containers";
import { SkeletonCard2, SkeletonDemo } from "@/components/ui/skeleton";
import {
  AddButton,
  AddButtonContainer,
  Button,
  FileDisplay,
} from "@/components/ui/button";
import {
  useGetEventAnalytics,
  useGetEvent,
  useUpdateEvents,
  useGetEventTypesinCategory,
  useGetEventAttendees,
} from "@/hooks/events";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { eventFormSchema } from "@/app/components/schema/Forms";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate2, handleShare, scrollToTop } from "@/lib/auth-helper";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteEvent } from "@/app/components/business/eventsData/EventsData";
import { useRouter } from "next/navigation";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { useGetAiEvent } from "@/hooks/aievent";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useGetEventComments } from "@/hooks/guest";
import { useGetEventTableArrangements } from "@/hooks/table-arrangement";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import {
  FormBuilder,
  TermsAndConditions,
} from "@/app/components/dashboard/FormBuilder";
import Empty from "../../assets/images/dashboard/empty.svg";
import { ViewGuest } from "./AiEventPlanner";
import EventOrders from "./EventOrders";
import { useGetUser } from "@/hooks/user";

Chart.register(ArcElement, Tooltip, Legend);

const EditEvent = ({ event }: any) => {
  const [edit, setEdit] = useState(false);
  const { data: fetchedEvent, status: eventStatus } = useGetEvent(event?.id);
  const { data: analytics } = useGetEventAnalytics(event?.id);
  const { data: user } = useGetUser();
  const router = useRouter();
  const { mutation } = useUpdateEvents(event?.id);
  const [media, setMedia] = useState<(File | string)[]>(event?.media || []);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isQuestionaire, setIsQuestionaire] = useState(false);
  const { data: initialPlanner, status } = useGetAiEvent(event?.id);
  const { data: availableTables } = useGetEventTableArrangements(event?.id);
  const [comments, setComments] = useState<any>([]);
  const [showAllComments, setShowAllComments] = useState(false);
  const { data: eventComments, status: commentStatus } = useGetEventComments(
    event?.id
  );
  const { data: attendees } = useGetEventAttendees(event?.id);
  const [custom_fields, setCustom_fields] = useState<any>([]);
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (fetchedEvent?.Event_Custom_Fields)
      setCustom_fields(fetchedEvent.Event_Custom_Fields);
    if (fetchedEvent?.termsAndConditions)
      setTermsAndConditions(fetchedEvent.termsAndConditions);
  }, [fetchedEvent]);

  const displayedComments = showAllComments
    ? comments || []
    : (comments || []).slice(0, 5);

  let eventPlans = [];
  eventPlans = event?.Event_Plans
    ? event?.Event_Plans
    : fetchedEvent?.Event_Plans;

  const handleFileChange = (newFiles: File[]) => {
    if (newFiles.length > 0) setMedia((prev) => [...prev, ...newFiles]);
  };

  useEffect(() => {
    if (fetchedEvent) setMedia(fetchedEvent.media);
    else setMedia(event?.media);
  }, [fetchedEvent]);

  const handleRemoveFile = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (eventComments) setComments(eventComments);
  }, [eventComments]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToTop();
    }, 100);
    return () => clearTimeout(timer);
  }, [event]);

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (eventStatus === "success" && event) {
      const regularPlan =
        eventPlans.find((plan: any) => plan.name === "Regular") || {};
      const vipPlan = eventPlans.find((plan: any) => plan.name === "VIP") || {};
      const executivePlan =
        eventPlans.find((plan: any) => plan.name === "Executive") || {};

      form.reset({
        title: event?.title || "",
        date: new Date(event?.date),
        externalLink: event?.externalLink ? event?.externalLink : "",
        endTime: new Date(event?.endTime),
        regularPrice: regularPlan.price || 0,
        vipPrice: vipPlan.price || 0,
        executivePrice: executivePlan.price || 0,
        country: event?.country,
        state: event?.state,
        address: event?.address === "undefined" ? "Virtual" : event?.address,
        capacity: event?.capacity,
        event_types: event?.event_types,
        description: event?.description || "",
        event_ticketing: event?.event_ticketing || "",
        latitude: event?.latitude || 0,
        longitude: event?.longitude || 0,
        UserId: event?.UserId,
      });
    }
  }, [eventStatus, event, form]);

  const { data: eventTypes } = useGetEventTypesinCategory(
    fetchedEvent?.eventCategoriesId
  );
  const category = eventTypes?.find(
    (item: any) => fetchedEvent?.event_types === item.id
  );

  const onSubmit = async (values: z.infer<typeof eventFormSchema>) => {
    delete values.regularPrice;
    delete values.vipPrice;
    delete values.executivePrice;

    const updatedEvent = {
      ...values,
      media,
      custom_fields,
      termsAndConditions,
    };

    mutation.mutate(updatedEvent);
  };

  const handleAiEvent = () => {
    if (initialPlanner.length > 0) router.push(`aievent-planner`);
    else router.push(`new-aievent`);
  };

  const handleStream = () => {
    const externalLink = event?.externalLink;

    // List of notable meeting platforms
    const validMeetingPlatforms = [
      "zoom.us",
      "meet.google.com",
      "teams.microsoft.com",
    ];

    if (externalLink) {
      try {
        const url = new URL(externalLink); // Parse the URL
        const isValidMeeting = validMeetingPlatforms.some((domain) =>
          url.hostname.includes(domain)
        );

        if (isValidMeeting) {
          window.location.href = externalLink; // Redirect to external meeting link
          return;
        }
      } catch (error) {
        console.error("Invalid URL:", error);
      }
    }

    // Redirect to internal livestream if no valid meeting link
    router.push(`/stream/${event?.id}`);
  };

  const handleTable = () => {
    if (availableTables?.success) router.push(`table-arrangement`);
    else router.push(`new-table`);
  };

  if (eventStatus === "pending") return <SkeletonCard2 />;

  if (status === "pending") return <SkeletonCard2 />;

  return (
    <div className="relative mx-auto mt-[120px] sm:mt-36">
      {isQuestionaire ? (
        <QuestionnaireResults
          attendees={attendees}
          setIsQuestionaire={setIsQuestionaire}
        />
      ) : (
        <Form {...form}>
          <form>
            <DashboardHeader>
              <DashboardHeaderText>View Event</DashboardHeaderText>

              <div className="flex items-center gap-4">
                {!edit && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex items-center cursor-pointer rounded-full border border-gray-700 text-gray-700 hover:border-red-700 hover:text-red-700 w-6 h-6 p-1">
                        <MoreHorizontal className="w-4.5" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {event?.privacy === "Private" && (
                        <DropdownMenuItem
                          onClick={() => router.push(`manage-access`)}
                        >
                          Manage access
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={handleAiEvent}>
                        AI event planner
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleTable}>
                        Seating plan
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/dashboard/check-in/${event?.id}/ticket`)
                        }
                      >
                        Ticket validation
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="flex sm:hidden"
                        onClick={() => setEdit(true)}
                      >
                        Edit Event
                      </DropdownMenuItem>
                      {event?.privacy !== "Private" && (
                        <DropdownMenuItem
                          className="flex sm:hidden"
                          onClick={() => handleShare(event)}
                        >
                          Invite
                        </DropdownMenuItem>
                      )}
                      {event?.eventLocationType === "Virtual" && (
                        <DropdownMenuItem
                          className="flex"
                          onClick={handleStream}
                        >
                          Live stream
                        </DropdownMenuItem>
                      )}
                      {event?.isSprayingEnabled && (
                        <DropdownMenuItem
                          className="flex"
                          onClick={() =>
                            router.push(`/dashboard/spray/${event?.id}/event`)
                          }
                        >
                          Spray feature
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => setIsOpen(true)}>
                        View attendees
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteOpen(true)}
                        style={{ color: "red", fontWeight: "500" }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {!edit && event?.privacy !== "Private" && (
                  <span className="hidden sm:flex w-[109px] gap-[10px]">
                    <Button
                      type="button"
                      onClick={() => handleShare(event)}
                      className="flex justify-center items-center gap-[8px]"
                    >
                      Invite
                    </Button>
                  </span>
                )}
                <AlertDialog open={isDeleteOpen} onOpenChange={setDeleteOpen}>
                  <AlertDialogContent className="left-[50%] top-[50%]">
                    <DeleteEvent id={event?.id} />
                  </AlertDialogContent>
                </AlertDialog>

                <span className="flex items-center gap-[10px]">
                  {edit && (
                    <Button
                      type="button"
                      onClick={() => setEdit(false)}
                      variant={"secondary"}
                      className="flex justify-center items-center gap-[8px]"
                    >
                      Cancel
                    </Button>
                  )}
                  {edit ? (
                    <Button
                      type="button"
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Save"
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setEdit(true)}
                      className="hidden sm:flex justify-center items-center gap-[8px]"
                    >
                      Edit Event
                    </Button>
                  )}
                </span>
              </div>
            </DashboardHeader>
            <DashboardContainerContent className="mb-14" type={1}>
              <div className="bg-white p-4 rounded-lg md:mt-3 md:ml-3">
                <div className=" relative max-w-full max-h-[344.13px] rounded-lg overflow-hidden">
                  {!edit ? (
                    <Image
                      src={fetchedEvent?.media[0]}
                      alt="Image"
                      className="w-full h-auto object-contain"
                      width={444.13}
                      height={316}
                    />
                  ) : (
                    <DashboardContainerContent>
                      <h6>Event Media</h6>
                      <AddButtonContainer>
                        <AddButton
                          title="Upload image (PNG, JPG format)"
                          onFileChange={handleFileChange}
                          isMultiple={true}
                        />
                        <FileDisplay
                          files={media}
                          onRemove={handleRemoveFile}
                          isMultiple={true}
                        />
                      </AddButtonContainer>
                    </DashboardContainerContent>
                  )}
                </div>
                <div className="flex flex-col gap-[20px] mt-7">
                  <div className="flex items-center justify-between gap-3">
                    {edit ? (
                      <div className="flex flex-col w-full gap-3">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <Input placeholder="Event title" {...field} />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="event_ticketing"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>Ticket type</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger
                                    className={cn(
                                      !field.value && "text-gray-400"
                                    )}
                                  >
                                    <SelectValue placeholder="Event ticketing" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Free">Free</SelectItem>
                                    <SelectItem value="Paid">Paid</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="event_types"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Event type</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      size={"sm"}
                                    >
                                      {field.value
                                        ? eventTypes?.find(
                                            (category: any) =>
                                              category.id === field.value
                                          )?.name
                                        : "Select Event type"}

                                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0">
                                    <Command>
                                      <CommandInput placeholder="Search event types..." />
                                      <CommandList>
                                        <CommandEmpty>
                                          No event type found.
                                        </CommandEmpty>
                                        <CommandGroup>
                                          {eventTypes?.map((category: any) => (
                                            <CommandItem
                                              value={category.id}
                                              key={category.id}
                                              onSelect={() => {
                                                form.setValue(
                                                  "event_types",
                                                  category.id
                                                );
                                              }}
                                            >
                                              <Check
                                                className={cn(
                                                  "mr-2 h-4 w-4",
                                                  category.id === field.value
                                                    ? "opacity-100"
                                                    : "opacity-0"
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
                        </div>
                        {event?.eventLocationType === "Virtual" && (
                          <FormField
                            control={form.control}
                            name="externalLink"
                            render={({ field }) => (
                              <FormItem className="mt-2">
                                <FormLabel>Link</FormLabel>
                                <Input {...field} placeholder="https://" />
                                <p className="relative bottom-[-5px]">
                                  Add a link so people can live stream your
                                  event when it starts
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <h5>{event?.title}</h5>

                        <p className="text-green-700 bg-green-100 py-1 text-sm px-2 rounded-lg">
                          {event?.event_ticketing} event
                        </p>
                      </div>
                    )}
                    {/* <Bookmark className='w-[24px] h-24px]' /> */}
                  </div>

                  {/* <FormField
                            control={form.control}
                            name={
                              item.name === "Regular"
                                ? "regularPrice"
                                : item.name === "VIP"
                                ? "vipPrice"
                                : "executivePrice"
                            }
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price</FormLabel>
                                <Input
                                  type='number'
                                  {...field}
                                  value={field.value || "0"} // Ensure there's a fallback
                                  onChange={(e) => field.onChange(e.target.valueAsNumber)} // Use valueAsNumber
                                  placeholder='Enter price'
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          /> */}
                  {!edit && category && (
                    <div>
                      <p>Event type</p>
                      <span className="font-medium">{category?.name}</span>
                    </div>
                  )}
                  {!edit && (
                    <div className="flex flex-col gap-4 lg:flex-row justify-stretch">
                      {event?.Event_Plans &&
                        event?.Event_Plans.map((item: any) => (
                          <div key={item.name}>
                            <p>{item.name}</p>
                            <span className="font-medium">
                              {item.symbol} {item.price.toLocaleString()}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                  {edit ? (
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <Textarea
                            placeholder="Enter description"
                            {...field}
                          />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <div>
                      <p>Description</p>
                      <p className="text-black leading-normal font-medium">
                        {event?.description}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-col gap-3.5">
                    {edit ? (
                      <DashboardContainerContent>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem className="mt-1 flex flex-col gap-2">
                                <FormLabel>Start Date</FormLabel>
                                {/* <DatePicker
                                  selected={field.value}
                                  timeInputLabel='Event Time:'
                                  dateFormat='MM/dd/yyyy h:mm aa'
                                  placeholderText='Select Event Date and Time'
                                  showTimeInput
                                  onChange={(date) => field.onChange(date)}
                                  showYearDropdown
                                  showMonthDropdown
                                  dropdownMode='select'
                                  minDate={new Date()}
                                  maxDate={new Date(2057, 0, 1)}
                                  className='p-[10px] text-sm bg-white border hover:border-black outline-none z-50 border-gray-200 rounded-lg'
                                  calendarClassName='custom-calendar'
                                /> */}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="endTime"
                            render={({ field }) => (
                              <FormItem className="mt-1 flex flex-col gap-2">
                                <FormLabel>End Date</FormLabel>
                                {/* <DatePicker
                                  selected={field.value}
                                  timeInputLabel='Event Time:'
                                  dateFormat='MM/dd/yyyy h:mm aa'
                                  placeholderText='Add End Date and Time'
                                  showTimeInput
                                  onChange={(date) => field.onChange(date)}
                                  showYearDropdown
                                  showMonthDropdown
                                  dropdownMode='select'
                                  minDate={new Date()}
                                  maxDate={new Date(2057, 0, 1)}
                                  className='p-[10px] text-sm bg-white border hover:border-black outline-none z-50 border-gray-200 rounded-lg'
                                  calendarClassName='custom-calendar'
                                /> */}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </DashboardContainerContent>
                    ) : (
                      <span className="flex gap-3 items-center text-[14px] font-medium">
                        <div className="bg-red-100 p-1.5 rounded-lg">
                          <CalendarDays className="h-[20px] w-[20px] text-red-700" />
                        </div>
                        {formatDate2(event?.date, event?.is24hours)}
                      </span>
                    )}

                    {edit ? (
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormLabel>Address</FormLabel>
                            <Textarea
                              {...field}
                              placeholder="Type your address here..."
                              className="bottom-0 m-0"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <span className="flex gap-3 items-center text-[14px] font-medium">
                        <div className="bg-red-100 p-1.5 rounded-lg">
                          <MapPinIcon className="h-[20px] w-[20px] text-red-700" />
                        </div>
                        {event?.address === "undefined"
                          ? "Online"
                          : event?.address}
                      </span>
                    )}

                    <DashboardContainerContent className="md:flex-row items-center justify-center gap-4">
                      <Button
                        onClick={() =>
                          router.push("/dashboard/events/manage-access")
                        }
                        className="m-0"
                      >
                        Manage Event Access
                      </Button>
                      {event?.isSprayingEnabled && (
                        <Button
                          onClick={() =>
                            router.push(
                              `/dashboard/spray/${event?.id}/overview`
                            )
                          }
                          className="m-0"
                          variant="secondary"
                        >
                          Access Spray room
                        </Button>
                      )}
                    </DashboardContainerContent>

                    {fetchedEvent?.Event_Custom_Fields?.length > 0 && (
                      <DashboardContainerContent>
                        <div className="flex justify-between border-b pb-2">
                          <div className="flex flex-col gap-2">
                            <h6>Custom Registration Questions</h6>
                            {edit && (
                              <p>
                                Create custom questions to get the information
                                you need from your attendees.
                              </p>
                            )}
                          </div>
                          {edit && <p className="!text-xs">Optional</p>}
                        </div>
                        <div className="mt-4">
                          <FormBuilder
                            customFields={custom_fields}
                            setCustomFields={setCustom_fields}
                            edit={edit}
                          />
                        </div>
                      </DashboardContainerContent>
                    )}
                    {fetchedEvent?.termsAndConditions && (
                      <DashboardContainerContent>
                        <div className="flex justify-between mt-2 pb-2">
                          <div className="flex flex-col gap-2">
                            <h6>Terms and Conditions</h6>
                            {edit && (
                              <p>
                                Add terms and conditions that attendees must
                                agree to when registering for your event.
                              </p>
                            )}
                          </div>
                          {edit && <p className="!text-xs">Optional</p>}
                        </div>
                        <TermsAndConditions
                          termsAndConditions={termsAndConditions}
                          setTermsAndConditions={setTermsAndConditions}
                          edit={edit}
                        />
                      </DashboardContainerContent>
                    )}
                    <span className="flex gap-3 items-center text-[14px] font-medium">
                      <Image
                        className="w-[32px] rounded-full h-[32px]"
                        src={event?.User?.avatar || "/noavatar.png"}
                        alt="Avatar"
                        width={32}
                        height={32}
                      />
                      <div>
                        <p className="text-black">
                          {event?.User.first_name} {event?.User.last_name}
                        </p>
                        <p className="text-sm">Event host</p>
                      </div>
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 md:p-5 flex flex-col gap-4">
                <span className="text-gray-500 text-sm">
                  Last updated {event?.updatedAt.split("T")[0]}
                </span>

                <div>
                  <h4 className="font-semibold">Analytics</h4>
                  <div className="flex mt-2 flex-col gap-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="border rounded-lg p-4 flex flex-col gap-2">
                        <p className="text-black font-medium">Status</p>
                        {analytics?.status === "UPCOMING" ? (
                          <span className="py-1 px-2 text-[14px] bg-green-100 text-green-700 rounded-md max-w-[100px] text-center">
                            Upcoming
                          </span>
                        ) : (
                          <span className="py-1 px-2 text-[14px] bg-red-100 text-red-700 rounded-md w-[65px] text-center">
                            Past
                          </span>
                        )}
                      </div>
                      <div className="border rounded-lg p-4 flex flex-col gap-2">
                        <p className="text-black font-medium">Views</p>
                        <h6>{analytics?.views || 0}</h6>
                      </div>
                      <div className="border rounded-lg p-4 flex flex-col gap-2">
                        <p className="text-black font-medium">Sold</p>
                        <h6>{analytics?.sold || 0}</h6>
                      </div>
                      <div className="border rounded-lg p-4 flex flex-col gap-2">
                        <p className="text-black font-medium">Unsold</p>
                        <h6>{analytics?.unsold || 0}</h6>
                      </div>
                      <div className="border rounded-lg p-4 flex flex-col gap-2">
                        <p className="text-black font-medium">Total Sales</p>
                        <h6>
                          {user?.currencySymbol}
                          {analytics?.totalSoldAmount?.toLocaleString() || 0}
                        </h6>
                      </div>
                    </div>

                    {fetchedEvent?.Event_Custom_Fields?.length > 0 && (
                      <div className="border rounded-lg p-4 flex flex-col gap-2">
                        <p className="text-black font-medium">
                          Custom Registration Questions
                        </p>
                        <div className="flex gap-2 items-center">
                          <h6>{attendees?.length || 0} </h6>
                          <p>responses</p>
                        </div>
                        <div className="flex justify-end">
                          <p
                            onClick={() => setIsQuestionaire(true)}
                            className="text-red-700 hover:underline cursor-pointer"
                          >
                            View answers
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {commentStatus !== "success" ? (
                  <SkeletonDemo />
                ) : (
                  <div className="flex flex-col gap-5 mt-5">
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="font-semibold">
                        Comments({comments?.length || 0})
                      </h4>
                      {comments?.length > 4 && (
                        <p
                          onClick={() => setShowAllComments((prev) => !prev)}
                          className="text-red-700 cursor-pointer hover:underline"
                        >
                          {showAllComments ? "See Some" : "See All"}
                        </p>
                      )}
                    </div>
                    {comments?.length > 0 &&
                      displayedComments?.map((comment: any) => (
                        <div className="flex flex-col gap-4 pb-5 border-b border-gray-200">
                          <div className="flex gap-3 items-center w-full">
                            <Image
                              src={comment?.Users?.avatar || "/noavatar.png"}
                              alt="zac"
                              width={100}
                              height={100}
                              className="h-[40px] w-[40px] rounded-full"
                            />
                            <p className="text-black font-medium">
                              {comment?.Users?.first_name}{" "}
                              {comment?.Users?.last_name}
                            </p>
                          </div>
                          <p className="leading-normal">{comment?.comment}</p>
                          <div className="flex items-end justify-end">
                            <span className="flex gap-4">
                              {/* <PenLine className='w-5 cursor-pointer hover:text-red-700 h-5 text-gray-600' /> */}
                              {/* {user?.id === comment?.userId && (
                              <button disabled={isDel}>
                                <Trash2
                                  onClick={() => onDeleteComment(comment)}
                                  className='w-5 cursor-pointer hover:text-gray-700 h-5 text-red-700'
                                />
                              </button>
                            )} */}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </DashboardContainerContent>
            <EventOrders data={attendees} />
          </form>
        </Form>
      )}
      {isOpen && (
        <ViewGuest data={attendees} isOpen={isOpen} setIsOpen={setIsOpen} />
      )}{" "}
    </div>
  );
};

export default EditEvent;

const QuestionnaireResults = ({ attendees, setIsQuestionaire }: any) => {
  const questionStats: { [key: string]: { [key: string]: number } } = {};
  attendees.forEach((attendee: any) => {
    attendee.custom_fields.forEach((field: any) => {
      const label = field.label || field.field; // Use `label` or fallback to `field`
      const response = field.response || "No response"; // Handle missing responses

      if (!questionStats[label]) questionStats[label] = {};
      if (!questionStats[label][response]) questionStats[label][response] = 0;
      questionStats[label][response] += 1;
    });
  });

  // Colors for pie chart
  const colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4CAF50",
    "#9C27B0",
    "#FF9800",
    "#03A9F4",
    "#E91E63",
    "#8BC34A",
    "#FF5722",
  ];

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    Object.entries(questionStats).forEach(([question, responses]) => {
      csvContent += `"${question}"\n`; // Question label
      Object.entries(responses).forEach(([response, count]) => {
        csvContent += `  "${response}","${count}"\n`; // Option & response count
      });
      csvContent += "\n"; // Add spacing between questions
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "questionnaire_results.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <>
      <DashboardHeader>
        <div className="flex gap-2 items-center">
          <ArrowLeftCircle
            onClick={() => setIsQuestionaire(false)}
            className="w-5 h-5 cursor-pointer hover:text-red-700"
          />
          <h3 className="sm:font-semibold">Custom Registration Questions</h3>
        </div>
        <div className="relative">
          <DownloadIcon
            onClick={exportToCSV}
            className="w-5 h-5 sm:hidden cursor-pointer hover:text-red-700"
          />
          <Button
            onClick={exportToCSV}
            className="hidden sm:flex gap-2 items-center"
          >
            <Download className="w-5 h-5" />
            Download
          </Button>
        </div>
      </DashboardHeader>

      {attendees?.length > 0 ? (
        <DashboardContainer className="px-4 pt-14 lg:max-w-full flex flex-col gap-4 bg-white">
          {Object.entries(questionStats).map(([question, responses], index) => {
            const responseLabels = Object.keys(responses);
            const responseCounts = Object.values(responses);
            const chartColors = colors.slice(0, responseLabels.length);

            const data = {
              labels: responseLabels,
              datasets: [
                {
                  data: responseCounts,
                  backgroundColor: chartColors,
                  hoverBackgroundColor: chartColors,
                  borderWidth: 1,
                  cutout: "50%", // Makes the pie chart into a doughnut chart
                },
              ],
            };

            return (
              <div
                key={index}
                className="sm:px-4 sm:pt-4 sm:border rounded-lg sm:shadow-sm grid lg:grid-cols-[1fr,400px] lg:gap-10"
              >
                <div className="flex-grow">
                  <h6 className="text-lg font-semibold mb-2">
                    {index + 1}. {question}
                  </h6>
                  <ul className="text-sm space-y-2">
                    {responseLabels.map((response, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 py-1 px-3 bg-gray-100"
                      >
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: chartColors[i] }}
                        ></span>
                        {response}:
                        <p className="text-black italic font-medium">
                          {responses[response]} responses
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="max-w-[250px]">
                  <Pie
                    data={data}
                    options={{ plugins: { legend: { position: "right" } } }}
                  />
                </div>
              </div>
            );
          })}
        </DashboardContainer>
      ) : (
        <DashboardContainer className="px-4 pt-14 lg:max-w-full flex flex-col gap-4 bg-white">
          <div className="flex flex-col items-center justify-center w-full h-[200px] gap-4">
            <Image
              src={Empty}
              alt="empty"
              width={100}
              height={100}
              className="w-[100px] h-auto"
            />
            <p className="text-center">No data yet</p>
          </div>
        </DashboardContainer>
      )}
    </>
  );
};
