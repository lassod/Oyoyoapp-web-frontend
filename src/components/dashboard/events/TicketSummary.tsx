"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { AlertDialog, TicketSuccessModal } from "@/components/ui/alert-dialog";
import {
  DashboardHeader,
  Dashboard,
  DashboardHeaderText,
} from "@/components/ui/containers";
import { Loader2 } from "lucide-react";
import { AlertDialogAction, ErrorModal } from "@/components/ui/alert-dialog";
import { useSession } from "next-auth/react";
import { handleShare, scrollToTop, shortenText } from "@/lib/auth-helper";
import { useGetVendorByUserId } from "@/hooks/guest";
import { usePostTickets } from "@/hooks/tickets";
import { useGetDiscounts } from "@/hooks/discount";
import {
  formOrderTicket,
  formOrderTicket2,
} from "@/app/components/schema/Forms";
import PhoneInput, {
  formatPhoneNumberIntl,
  isPossiblePhoneNumber,
  isValidPhoneNumber,
} from "react-phone-number-input";
import "./event.css";
import { useRouter } from "next/navigation";
import { useGetEventCustomFields } from "@/hooks/events";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { PreviewTerms } from "@/app/components/dashboard/FormBuilder";
import { LogoLoader } from "@/components/ui/skeleton";

declare var PaystackPop: {
  setup: (options: {
    key: string;
    email: string;
    currency: string;
    amount: number;
    ref?: string;
    onClose?: () => void;
    callback: (response: { status: string; reference: string }) => void;
  }) => {
    openIframe: () => void;
  };
};

const TicketSummary = ({ ticket, event, guest = false, currency }: any) => {
  const [errorModal, setErrorModal] = useState(false);
  const [tickets, setTickets] = useState<any>([]);
  const [vendor, setVendor] = useState<any>({});
  const session = useSession();
  const { mutation, response } = usePostTickets();
  const [discount, setDiscount] = useState<any>(null);
  const { data: discounts } = useGetDiscounts();
  const { data: customFields } = useGetEventCustomFields(event?.id);
  const [discountCode, setDiscountCode] = useState("");
  const [error, setError] = useState<any>(null);
  const { data: vendors } = useGetVendorByUserId(event?.UserId);
  const [values, setValues] = useState<string[]>([]);
  const [phoneErrors, setPhoneErrors] = useState<string[]>([]);
  const [isResponse, setIsResponse] = useState<any>(null);
  const [ticketData, setTicketData] = useState<any>(null);
  const router = useRouter();
  const [defaultCountry, setDefaultCountry] = useState<any>("NG");
  const [orderId, setOrderId] = useState("");
  const [reference, setReference] = useState("");
  const [isTerms, setIsTerms] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: number]: string }>({});
  const fieldRefs = useRef<(HTMLTextAreaElement | HTMLDivElement | null)[]>([]);
  const [useSingleContact, setUseSingleContact] = useState(false);

  useEffect(() => {
    if (currency === "NGN") setDefaultCountry("NG");
    else if (currency === "GBP") setDefaultCountry("GB");
    else setDefaultCountry("US");
  }, [currency]);

  useEffect(() => {
    if (useSingleContact) {
      form.reset(); // Reset the multiple contacts form
      setFieldErrors({}); // Clear field errors
    } else {
      form2.reset(); // Reset the single contact form
      setFieldErrors({}); // Clear field errors
    }
  }, [useSingleContact]);

  useEffect(() => {
    if (event?.termsAndConditions) setIsTerms(true);

    const timer = setTimeout(() => {
      scrollToTop();
    }, 100);
    return () => clearTimeout(timer);
  }, [event]);

  const handlePhoneChange = (index: number, value?: string) => {
    const updatedValues: any = [...values];
    updatedValues[index] = value;
    setValues(updatedValues);

    const updatedErrors = [...phoneErrors];

    if (!value) {
      // if cleared, no error
      updatedErrors[index] = "";
    } else {
      const possible = isPossiblePhoneNumber(value);
      const valid = isValidPhoneNumber(value);
      if (!possible) updatedErrors[index] = "Phone number is incorrect.";
      else if (!valid) updatedErrors[index] = "Phone number does not exist.";
      else updatedErrors[index] = "";
    }

    setPhoneErrors(updatedErrors);
  };

  const updatedEventPlans = event?.Event_Plans.map((plan: any) => ({
    ...plan,
    quantity: ticket[plan.name] || 0,
  }));

  const form = useForm<z.infer<typeof formOrderTicket>>({
    resolver: zodResolver(formOrderTicket),
    defaultValues: {
      ticketDetails: Object.fromEntries(
        event?.Event_Plans.map((plan: any) => [plan.name, []]) || []
      ),
      form_response:
        customFields?.map((field: any) => ({
          label: field.label,
          fieldType: field.fieldType,
          response: field.required ? "" : undefined,
          required: field.required,
        })) || [],
    },
  });

  const form2 = useForm<z.infer<typeof formOrderTicket2>>({
    resolver: zodResolver(formOrderTicket2),
    defaultValues: {
      // : Object.fromEntries(
      //   event?.Event_Plans.map((plan: any) => [plan.name, []]) || []
      // ),
      form_response:
        customFields?.map((field: any) => ({
          label: field.label,
          fieldType: field.fieldType,
          response: field.required ? "" : undefined,
          required: field.required,
        })) || [],
    },
  });

  const handleSubmit = (data: any) => {
    console.log(data);
    let handler = PaystackPop.setup({
      key: `${process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!}`,
      email: data.email,
      currency: "NGN",
      amount: data.amount * 100,
      ref: data.reference,

      callback: (res) => {
        console.log(res);
        if (res?.status === "success") {
          setReference(res?.reference);
          setIsResponse(true);
        }
        // queryClient.invalidateQueries({ queryKey: [sprayKeys.balance] });
      },
    });

    handler.openIframe();
  };

  useEffect(() => {
    if (vendors) setVendor(vendors);
  }, [vendors]);

  useEffect(() => {
    const ticket = updatedEventPlans?.filter(
      (item: any) => item.quantity !== 0
    );
    setTickets(ticket);
  }, [event]);

  const totalPrice = parseFloat(
    tickets
      ?.map(
        (item: { price: number; quantity: number }) =>
          item.price * item.quantity
      )
      .reduce(
        (accumulator: any, currentValue: any) => accumulator + currentValue,
        0
      )
      .toFixed(2)
  );

  const percentageFee = parseFloat(
    tickets
      ?.map(
        (item: any) =>
          (totalPrice * (item?.transactionFees?.percentage || 0)) / 100
      )
      .reduce(
        (accumulator: any, currentValue: any) => accumulator + currentValue,
        0
      )
      .toFixed(2)
  );

  const firstTotalFee = tickets[0]?.transactionFees?.flatFee || 0;
  const totalPercentageFee = (percentageFee + firstTotalFee).toFixed(2);
  const overallTotal = totalPrice + parseFloat(totalPercentageFee);

  const onSubmit = (values: z.infer<typeof formOrderTicket>) => {
    let newErrors: { [key: number]: string } = {};

    customFields?.forEach((field: any, index: number) => {
      if (field.required) {
        const response = values.form_response?.[index]?.response;
        if (
          !response ||
          (Array.isArray(response) && response.length === 0) ||
          (typeof response === "string" && response.trim() === "")
        )
          newErrors[index] = "This field is required.";
      }
    });
    // if (Object.keys(newErrors).length > 0) return setFieldErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);

      const firstErrorIndex = parseInt(Object.keys(newErrors)[0], 10);
      const ref = fieldRefs.current[firstErrorIndex];

      if (ref && typeof ref.scrollIntoView === "function") {
        ref.scrollIntoView({ behavior: "smooth", block: "center" });

        const focusable = ref.querySelector("input, textarea, [tabindex]");
        if (focusable instanceof HTMLElement) {
          focusable.focus();
        }
      }

      return;
    }

    let data;
    const items = tickets.map(
      (plan: { name: string; id: number; quantity: number }) => ({
        itemType: "Event_Plan",
        eventPlanId: plan.id,
        quantity: plan.quantity,
        details: values.ticketDetails?.[plan.name] || [],
      })
    );

    if (session?.data?.user.id) {
      data = {
        userId: session.data?.user.id,
        vendorId: vendor?.id,
        eventId: event?.id,
        currency: event?.Event_Plans?.[0].currency || "USD",
        items,
        form_response: values.form_response,
      };
    } else {
      data = {
        vendorId: vendor?.id,
        eventId: event?.id,
        items,
        currency: event?.Event_Plans?.[0].currency || "USD",
        form_response: values.form_response,
      };
    }

    setTicketData(data);
    if (isTerms) return setShowPreview(true);

    submitTicket(data);
  };

  const onSubmit2 = (values: z.infer<typeof formOrderTicket2>) => {
    let newErrors: { [key: number]: string } = {};

    // Custom field validation
    customFields?.forEach((field: any, index: number) => {
      if (field.required) {
        const response = values.form_response?.[index]?.response;
        if (
          !response ||
          (Array.isArray(response) && response.length === 0) ||
          (typeof response === "string" && response.trim() === "")
        )
          newErrors[index] = "This field is required.";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      const firstErrorIndex = parseInt(Object.keys(newErrors)[0], 10);
      const ref = fieldRefs.current[firstErrorIndex];

      if (ref && typeof ref.scrollIntoView === "function") {
        ref.scrollIntoView({ behavior: "smooth", block: "center" });
        const focusable = ref.querySelector("input, textarea, [tabindex]");
        if (focusable instanceof HTMLElement) {
          focusable.focus();
        }
      }

      return;
    }

    let data;

    const items = tickets.map(
      (plan: { name: string; id: number; quantity: number }) => {
        const contactDetails = Array(plan.quantity).fill({
          fullName: values.singleContact.fullName,
          phoneNumber: values.singleContact.phoneNumber,
          email: values.singleContact.email,
        });

        return {
          itemType: "Event_Plan",
          eventPlanId: plan.id,
          quantity: plan.quantity,
          details: contactDetails,
        };
      }
    );

    if (session?.data?.user.id) {
      data = {
        userId: session.data?.user.id,
        vendorId: vendor?.id,
        eventId: event?.id,
        currency: event?.Event_Plans?.[0].currency || "USD",
        items,
        form_response: values.form_response,
      };
    } else {
      data = {
        vendorId: vendor?.id,
        eventId: event?.id,
        currency: event?.Event_Plans?.[0].currency || "USD",
        items,
        form_response: values.form_response,
      };
    }

    setTicketData(data);
    console.log("values", data);

    if (isTerms) return setShowPreview(true);
    submitTicket(data);
  };

  const submitTicket = (data: any) =>
    mutation.mutate(data, {
      onSuccess: (response: any) => {
        console.log(response.data.data);
        setOrderId(response?.data?.data?.order?.id);
        if (response.data.data.paymentGateway === "PAYSTACK")
          handleSubmit({
            reference: response?.data?.data?.transaction?.reference,
            amount: response?.data?.data?.transaction?.amountPaid,
            email: response?.data?.data?.paymentDetails?.email,
          });
        // router.push(response.data.data.authorization_url);
        else if (response.data.data.paymentGateway === "STRIPE") {
          if (!guest)
            window.location.href = `/payment/stripe/${response.data.data.client_secret}/${response.data.data.order.id}/user`;
          else
            window.location.href = `/payment/stripe/${response.data.data.client_secret}/${response.data.data.order.id}/${event?.title}`;
        } else setIsResponse(response.data.data.order.id);
      },
      onError: (error) => {
        console.error("Error creating transaction:", error);
      },
    });

  const [discountedTotal, setDiscountedTotal] = useState(overallTotal);

  useEffect(() => {
    if (discountCode) {
      const matchedDiscount = discounts.find(
        (d: any) => d.code === discountCode && d.eventId === event.id
      );
      if (matchedDiscount) {
        setDiscount(matchedDiscount);
        let newTotal = overallTotal;

        if (matchedDiscount.type === "FLAT")
          newTotal = Math.max(0, overallTotal - matchedDiscount.value);
        else if (matchedDiscount.type === "PERCENTAGE")
          newTotal = overallTotal * (1 - matchedDiscount.value / 100);

        setDiscountedTotal(newTotal);
        setError(null);
      } else {
        setError("Invalid discount code.");
        setDiscountedTotal(overallTotal);
      }
    }
  }, [discountCode, overallTotal, event.id, discounts]);

  const handleDiscountChange = (e: any) => setDiscountCode(e.target.value);

  useEffect(() => {
    if (mutation.isError) setErrorModal(true);
  }, [mutation.isError]);

  return (
    <Dashboard className={`${guest ? "lg:px-16" : "mt-16"}`}>
      {!guest && (
        <DashboardHeader>
          <DashboardHeaderText>View Event</DashboardHeaderText>
          <span>
            <Button
              type="button"
              onClick={() => handleShare(event)}
              className="flex max-w-[100px] w-full sm:max-w-[150px] items-center gap-[8px]"
            >
              Invite
            </Button>
          </span>
        </DashboardHeader>
      )}

      {useSingleContact ? (
        <Form {...form2}>
          <form onSubmit={form2.handleSubmit(onSubmit2)} className="wrapper">
            <div className="grid grid-cols-1 md:grid-cols-[1fr,40%] gap-14 sm:gap-6 md:gap-10 relative mt-4 bg-gray-50 sm:bg-white max-w-screen-xl sm:p-4 mx-auto">
              <div className="sm:py-5">
                <h6>Ticket Details</h6>
                <div className="border-b pt-1 border-gray-200"></div>
                <div className="py-6 flex items-center gap-2">
                  <Checkbox
                    id="use-single-contact"
                    checked={useSingleContact}
                    onCheckedChange={(checked) =>
                      setUseSingleContact(!!checked)
                    }
                  />
                  <Label htmlFor="use-single-contact">
                    Send all tickets to one email address
                  </Label>
                </div>
                <div className="flex flex-col gap-3 my-2">
                  <div className="flex flex-col bg-white gap-2 mb-6 border-b pb-4 px-3 shadow-md">
                    <p className="text-red-700 font-medium">All Tickets</p>

                    <FormField
                      control={form2.control}
                      name={`singleContact.fullName`}
                      render={({ field }) => (
                        <FormItem>
                          <Label>Full Name</Label>
                          <Input placeholder="Stefan" {...field} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-col md:flex-row gap-3 max-w-full">
                      <FormField
                        control={form2.control}
                        name={`singleContact.phoneNumber`}
                        render={() => (
                          <FormItem>
                            <Label>Phone number</Label>
                            <PhoneInput
                              defaultCountry={defaultCountry}
                              placeholder="Enter phone number"
                              onChange={(value: any) => {
                                handlePhoneChange(0, value);
                                form2.setValue(
                                  "singleContact.phoneNumber",
                                  value ? formatPhoneNumberIntl(value) : null // ⬅️ set null
                                );
                              }}
                              value={values[0] || ""} // UI state can stay as empty string
                              countryCallingCodeEditable={false}
                              international
                            />

                            {phoneErrors[0] ? (
                              <FormMessage className="text-red-500">
                                {phoneErrors[0]}
                              </FormMessage>
                            ) : (
                              <FormMessage />
                            )}
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form2.control}
                        name={`singleContact.email`}
                        render={({ field }) => (
                          <FormItem>
                            <Label>Email</Label>
                            <Input placeholder="you@company.com" {...field} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {customFields?.length > 0 && (
                  <div className="mt-6">
                    <h6 className="text-lg font-semibold">
                      Registration Questions
                    </h6>
                    <div className="border-b border-gray-200 my-5"></div>

                    {customFields.map((field: any, index: number) => (
                      <FormField
                        key={field.id}
                        control={form.control}
                        name={`form_response.${index}.response`}
                        render={({ field: formField }) => (
                          <FormItem
                            className="mt-6 w-full"
                            ref={(el) => {
                              fieldRefs.current[index] = el;
                            }}
                          >
                            <div className="flex gap-2 items-center">
                              <p className="text-black">{index + 1}.</p>
                              <p className="text-black">
                                {field.label}{" "}
                                {field.required && (
                                  <span className="text-red-500">*</span>
                                )}
                              </p>
                            </div>

                            <input
                              type="hidden"
                              {...form.register(`form_response.${index}.label`)}
                              value={field.label}
                            />
                            <input
                              type="hidden"
                              {...form.register(
                                `form_response.${index}.fieldType`
                              )}
                              value={field.fieldType}
                            />

                            {field.fieldType === "dropdown" &&
                            field.options?.length > 0 ? (
                              <Select onValueChange={formField.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options
                                    .filter(
                                      (option: any) =>
                                        option && option.trim() !== ""
                                    )
                                    .map(
                                      (option: string, optionIndex: number) => (
                                        <SelectItem
                                          key={optionIndex}
                                          value={option}
                                        >
                                          {option}
                                        </SelectItem>
                                      )
                                    )}
                                </SelectContent>
                              </Select>
                            ) : field.fieldType === "checkbox" &&
                              field.options?.length > 0 ? (
                              <div className="flex flex-col gap-2">
                                {field.options
                                  .filter(
                                    (option: any) =>
                                      option && option.trim() !== ""
                                  )
                                  .map(
                                    (option: string, optionIndex: number) => (
                                      <div
                                        key={optionIndex}
                                        className="flex items-center gap-2"
                                      >
                                        <Checkbox
                                          checked={
                                            Array.isArray(formField.value) &&
                                            formField.value.includes(option)
                                          }
                                          onCheckedChange={(checked) => {
                                            const currentValue = Array.isArray(
                                              formField.value
                                            )
                                              ? formField.value
                                              : [];
                                            const newValue = checked
                                              ? [...currentValue, option]
                                              : currentValue.filter(
                                                  (val) => val !== option
                                                );
                                            formField.onChange(newValue);
                                          }}
                                        />
                                        <Label>{option}</Label>
                                      </div>
                                    )
                                  )}
                              </div>
                            ) : field.fieldType === "radio" ? (
                              <div className="space-y-2">
                                {field.options
                                  .filter(
                                    (option: any) =>
                                      option && option.trim() !== ""
                                  )
                                  .map((option: any, index: number) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2"
                                    >
                                      <input
                                        type="radio"
                                        name={`form_response.${index}.response`}
                                        id={`${field.id}-option-${index}`}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        value={option}
                                        checked={formField.value === option}
                                        onChange={() =>
                                          formField.onChange(option)
                                        }
                                      />
                                      <label
                                        htmlFor={`${field.id}-option-${index}`}
                                        className="text-sm text-gray-700 hover:text-red-700 cursor-pointer"
                                      >
                                        {option}
                                      </label>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <Textarea
                                className="h-24"
                                {...formField}
                                placeholder="Enter your response"
                              />
                            )}

                            {/* 🔹 Display Individual Field Errors Here */}
                            {fieldErrors[index] && (
                              <p className="text-red-500 text-sm">
                                {fieldErrors[index]}
                              </p>
                            )}

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white w-full border border-gray-200 rounded-lg py-2 px-4 sm:px-6">
                <h5>Order Summary</h5>

                <div className="flex flex-col gap-[10px] pt-2 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <Image
                      src={event?.media[0]}
                      alt="Image"
                      width={130}
                      height={130}
                      className="w-[100px] object-cover h-[100px] rounded-lg"
                    />
                    <div className="flex w-full flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <p>Title:</p>
                        <p className="text-black font-[500]">
                          {shortenText(event?.title, 15)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p>Event Host:</p>
                        <p className="text-black font-[500]">
                          {vendor?.User?.first_name} {vendor?.User?.last_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p>Ticket Type:</p>
                        <p className="text-red-700">{event?.event_ticketing}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-[14px]">{event?.description}</p>
                </div>

                <div className="flex flex-col gap-4 py-4 border-b border-gray-200">
                  <div className="flex gap-2 py-4">
                    <FormField
                      control={form.control}
                      name="discountCode"
                      render={({}) => (
                        <FormItem className="w-full">
                          <Input
                            placeholder="Insert Promo Code"
                            value={discountCode}
                            onChange={handleDiscountChange}
                          />
                          {error && (
                            <p className="text-red-700 relative top-1">
                              {error}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      onClick={() => setDiscountCode(discountCode)}
                      variant={"secondary"}
                      className="max-w-[108px]"
                    >
                      Apply code
                    </Button>
                  </div>
                  {tickets.map((item: any) => (
                    <div
                      key={item.name}
                      className="flex gap-2 items-center justify-between"
                    >
                      <h5>
                        {item.quantity} {item.name}
                      </h5>
                      <p className="font-medium">
                        {item.symbol}{" "}
                        {(item.quantity * item.price).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2 py-4">
                  <div className="flex gap-2 items-center justify-between">
                    <p className="text-black">Transaction fee</p>
                    <p className="text-black font-semibold">
                      {tickets[0]?.symbol || "₦"}{" "}
                      {totalPercentageFee?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 py-4">
                  <div className="flex gap-2 items-center justify-between">
                    <p className="text-black">Discount</p>
                    <p className="text-black font-semibold">
                      -{tickets[0]?.symbol || "₦"}{" "}
                      {discount?.value.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 py-4">
                  <div className="flex gap-2 items-center justify-between">
                    <p className="text-black">Total</p>
                    <p className="text-red-700 font-semibold">
                      {tickets[0]?.symbol || "₦"}{" "}
                      {discountedTotal
                        ? (discountedTotal + overallTotal).toLocaleString()
                        : overallTotal.toLocaleString()}
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="my-5 w-full"
                  disabled={
                    phoneErrors.some((error) => error) || mutation.isPending
                  }
                >
                  {mutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Confirm order"
                  )}
                </Button>

                <div className="text-xs sm:text-sm text-center pb-4 text-gray-800">
                  By placing your order, you agree to our company{" "}
                  <Link
                    href="/privacy"
                    className="text-red-500 hover:text-black"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-red-500 hover:text-black"
                  >
                    Conditions of Use
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </Form>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="wrapper">
            <div className="grid grid-cols-1 md:grid-cols-[1fr,40%] gap-14 sm:gap-6 md:gap-10 relative mt-4 bg-gray-50 sm:bg-white max-w-screen-xl sm:p-4 mx-auto">
              <div className="sm:py-5">
                <h6>Ticket Details</h6>
                <div className="border-b pt-1 border-gray-200"></div>

                <div className="py-6 flex items-center gap-2">
                  <Checkbox
                    id="use-single-contact"
                    checked={useSingleContact}
                    onCheckedChange={(checked) =>
                      setUseSingleContact(!!checked)
                    }
                  />
                  <Label htmlFor="use-single-contact">
                    Send all tickets to one email address
                  </Label>
                </div>

                {tickets &&
                  tickets.map((item: any) => (
                    <div className="flex flex-col gap-3 my-2" key={item.name}>
                      <p className="text-black font-semibold my-2">
                        Tickets: {item?.name}
                      </p>
                      <div>
                        {Array.from({ length: item?.quantity }).map(
                          (_, index) => (
                            <div
                              className="flex flex-col bg-white gap-2 mb-6 border-b pb-4 px-3 shadow-md"
                              key={index}
                            >
                              <p className="text-red-700 font-medium">
                                Ticket {index + 1}
                              </p>
                              <FormField
                                control={form.control}
                                name={`ticketDetails.${item.name}.${index}.fullName`}
                                render={({ field }) => (
                                  <FormItem>
                                    <Label>Owner&apos;s full name</Label>
                                    <Input placeholder="Stefan" {...field} />
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="flex flex-col md:flex-row gap-3 max-w-full">
                                <FormField
                                  control={form.control}
                                  name={`ticketDetails.${item.name}.${index}.phoneNumber`}
                                  render={() => (
                                    <FormItem className="">
                                      <Label>Phone number</Label>
                                      <PhoneInput
                                        defaultCountry={defaultCountry}
                                        placeholder="Enter phone number"
                                        onChange={(value: any) => {
                                          handlePhoneChange(index, value);
                                          form.setValue(
                                            `ticketDetails.${item.name}.${index}.phoneNumber`,
                                            value
                                              ? formatPhoneNumberIntl(value)
                                              : null // ⬅️ set null
                                          );
                                        }}
                                        value={values[index] || ""}
                                      />

                                      {phoneErrors[index] ? (
                                        <FormMessage className="text-red-500">
                                          {phoneErrors[index]}
                                        </FormMessage>
                                      ) : (
                                        <FormMessage />
                                      )}
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`ticketDetails.${item.name}.${index}.email`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <Label>Email</Label>
                                      <Input
                                        placeholder="you@company.com"
                                        {...field}
                                      />
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}

                {customFields?.length > 0 && (
                  <div className="mt-6">
                    <h6 className="text-lg font-semibold">
                      Registration Questions
                    </h6>
                    <div className="border-b border-gray-200 my-5"></div>

                    {customFields.map((field: any, index: number) => (
                      <FormField
                        key={field.id}
                        control={form.control}
                        name={`form_response.${index}.response`}
                        render={({ field: formField }) => (
                          <FormItem
                            className="mt-6 w-full"
                            ref={(el) => {
                              fieldRefs.current[index] = el;
                            }}
                          >
                            <div className="flex gap-2 items-center">
                              <p className="text-black">{index + 1}.</p>
                              <p className="text-black">
                                {field.label}{" "}
                                {field.required && (
                                  <span className="text-red-500">*</span>
                                )}
                              </p>
                            </div>

                            <input
                              type="hidden"
                              {...form.register(`form_response.${index}.label`)}
                              value={field.label}
                            />
                            <input
                              type="hidden"
                              {...form.register(
                                `form_response.${index}.fieldType`
                              )}
                              value={field.fieldType}
                            />

                            {field.fieldType === "dropdown" &&
                            field.options?.length > 0 ? (
                              <Select onValueChange={formField.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options
                                    .filter(
                                      (option: any) =>
                                        option && option.trim() !== ""
                                    )
                                    .map(
                                      (option: string, optionIndex: number) => (
                                        <SelectItem
                                          key={optionIndex}
                                          value={option}
                                        >
                                          {option}
                                        </SelectItem>
                                      )
                                    )}
                                </SelectContent>
                              </Select>
                            ) : field.fieldType === "checkbox" &&
                              field.options?.length > 0 ? (
                              <div className="flex flex-col gap-2">
                                {field.options
                                  .filter(
                                    (option: any) =>
                                      option && option.trim() !== ""
                                  )
                                  .map(
                                    (option: string, optionIndex: number) => (
                                      <div
                                        key={optionIndex}
                                        className="flex items-center gap-2"
                                      >
                                        <Checkbox
                                          checked={
                                            Array.isArray(formField.value) &&
                                            formField.value.includes(option)
                                          }
                                          onCheckedChange={(checked) => {
                                            const currentValue = Array.isArray(
                                              formField.value
                                            )
                                              ? formField.value
                                              : [];
                                            const newValue = checked
                                              ? [...currentValue, option]
                                              : currentValue.filter(
                                                  (val) => val !== option
                                                );
                                            formField.onChange(newValue);
                                          }}
                                        />
                                        <Label>{option}</Label>
                                      </div>
                                    )
                                  )}
                              </div>
                            ) : field.fieldType === "radio" ? (
                              <div className="space-y-2">
                                {field.options
                                  .filter(
                                    (option: any) =>
                                      option && option.trim() !== ""
                                  )
                                  .map((option: any, index: number) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2"
                                    >
                                      <input
                                        type="radio"
                                        name={`form_response.${index}.response`}
                                        id={`${field.id}-option-${index}`}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        value={option}
                                        checked={formField.value === option}
                                        onChange={() =>
                                          formField.onChange(option)
                                        }
                                      />
                                      <label
                                        htmlFor={`${field.id}-option-${index}`}
                                        className="text-sm text-gray-700 hover:text-red-700 cursor-pointer"
                                      >
                                        {option}
                                      </label>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <Textarea
                                className="h-24"
                                {...formField}
                                placeholder="Enter your response"
                              />
                            )}

                            {/* 🔹 Display Individual Field Errors Here */}
                            {fieldErrors[index] && (
                              <p className="text-red-500 text-sm">
                                {fieldErrors[index]}
                              </p>
                            )}

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white w-full border border-gray-200 rounded-lg py-2 px-4 sm:px-6">
                <h5>Order Summary</h5>

                <div className="flex flex-col gap-[10px] pt-2 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <Image
                      src={event?.media[0]}
                      alt="Image"
                      width={130}
                      height={130}
                      className="w-[100px] object-cover h-[100px] rounded-lg"
                    />
                    <div className="flex w-full flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <p>Title:</p>
                        <p className="text-black font-[500]">
                          {shortenText(event?.title, 15)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p>Event Host:</p>
                        <p className="text-black font-[500]">
                          {vendor?.User?.first_name} {vendor?.User?.last_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p>Ticket Type:</p>
                        <p className="text-red-700">{event?.event_ticketing}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-[14px]">{event?.description}</p>
                </div>

                <div className="flex flex-col gap-4 py-4 border-b border-gray-200">
                  <div className="flex gap-2 py-4">
                    <FormField
                      control={form.control}
                      name="discountCode"
                      render={({}) => (
                        <FormItem className="w-full">
                          <Input
                            placeholder="Insert Promo Code"
                            value={discountCode}
                            onChange={handleDiscountChange}
                          />
                          {error && (
                            <p className="text-red-700 relative top-1">
                              {error}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      onClick={() => setDiscountCode(discountCode)}
                      variant={"secondary"}
                      className="max-w-[108px]"
                    >
                      Apply code
                    </Button>
                  </div>
                  {tickets.map((item: any) => (
                    <div
                      key={item.name}
                      className="flex gap-2 items-center justify-between"
                    >
                      <h5>
                        {item.quantity} {item.name}
                      </h5>
                      <p className="font-medium">
                        {item.symbol}{" "}
                        {(item.quantity * item.price).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2 py-4">
                  <div className="flex gap-2 items-center justify-between">
                    <p className="text-black">Transaction fee</p>
                    <p className="text-black font-semibold">
                      {tickets[0]?.symbol || "₦"}{" "}
                      {totalPercentageFee?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 py-4">
                  <div className="flex gap-2 items-center justify-between">
                    <p className="text-black">Discount</p>
                    <p className="text-black font-semibold">
                      -{tickets[0]?.symbol || "₦"}{" "}
                      {discount?.value.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 py-4">
                  <div className="flex gap-2 items-center justify-between">
                    <p className="text-black">Total</p>
                    <p className="text-red-700 font-semibold">
                      {tickets[0]?.symbol || "₦"}{" "}
                      {discountedTotal
                        ? (discountedTotal + overallTotal).toLocaleString()
                        : overallTotal.toLocaleString()}
                    </p>
                  </div>
                </div>

                <Button
                  className="my-5 w-full"
                  type="submit"
                  disabled={
                    phoneErrors.some((error) => error) || mutation.isPending
                  }
                >
                  {mutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Confirm order"
                  )}
                </Button>

                <div className="text-xs sm:text-sm text-center pb-4 text-gray-800">
                  By placing your order, you agree to our company{" "}
                  <Link
                    href="/privacy"
                    className="text-red-500 hover:text-black"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-red-500 hover:text-black"
                  >
                    Conditions of Use
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </Form>
      )}

      {mutation.isError && (
        <AlertDialog open={errorModal}>
          <ErrorModal description={response}>
            <AlertDialogAction onClick={() => setErrorModal(false)}>
              Close
            </AlertDialogAction>
          </ErrorModal>
        </AlertDialog>
      )}

      {isResponse && (
        <TicketSuccessModal
          isResponse={isResponse}
          setIsResponse={setIsResponse}
          guest={session?.data?.user?.id ? false : true}
          event={{ ...event, reference, orderId }}
        />
      )}
      {showPreview && (
        <PreviewTerms
          termsAndConditions={event?.termsAndConditions}
          showPreview={showPreview}
          isTerms={isTerms}
          setShowPreview={setShowPreview}
          setIsTerms={setIsTerms}
          submitTicket={submitTicket}
          ticketData={ticketData}
        />
      )}
      {mutation.isPending && <LogoLoader />}
    </Dashboard>
  );
};

export default TicketSummary;
