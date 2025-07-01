"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import { useGetUser } from "@/hooks/user";
import Link from "next/link";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Dashboard, DashboardHeader, DashboardHeaderText } from "@/components/ui/containers";
import { formSchemaDeliveryDetails } from "@/app/components/schema/Forms";
import { useGetVendorServices } from "@/hooks/vendors";
import { shortenText } from "@/lib/auth-helper";
import { usePostOrder } from "@/hooks/orders";
import { Loader2 } from "lucide-react";
import { useGetDiscounts } from "@/hooks/discount";
import { useRouter } from "next/navigation";
import { useGetService } from "@/hooks/services";

const PackageDetails = ({ params }: any) => {
  const { marketId, package_name } = params;
  const { data: service, isLoading } = useGetService(marketId);
  const { data: user, isLoading: userLoading } = useGetUser();
  const { data: vendorService } = useGetVendorServices(service?.VendorId);
  const [activeService, setActiveService] = useState<any>([]);
  const { mutation } = usePostOrder();
  const [discount, setDiscount] = useState<any>(null);
  const { data: discounts } = useGetDiscounts();
  const [discountCode, setDiscountCode] = useState("");
  const [error, setError] = useState<any>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchemaDeliveryDetails>>({
    resolver: zodResolver(formSchemaDeliveryDetails),
  });
  console.log(vendorService);

  useEffect(() => {
    if (vendorService) {
      const servicePlans = vendorService[0]?.Service_Plans.filter((item: any) => item.name === package_name);
      setActiveService(servicePlans);
    }
  }, [vendorService]);

  useEffect(() => {
    if (user)
      form.reset({
        fullname: `${user?.first_name} ${user?.last_name || user?.username}`,
        phone: user?.phone !== null ? user.phone : "",
        city: user?.state !== null ? user.state : "",
        location: user?.country !== null ? user.country : "",
        email: user?.email,

        orderTypeId: activeService[0]?.id,
        orderType: "Service_Plans",
        quantity: 1,
        vendorId: vendorService && vendorService[0]?.VendorId,
      });
  }, [user, activeService]);

  const totalPrice = activeService[0]?.price;
  const [discountedTotal, setDiscountedTotal] = useState(totalPrice);

  // Apply discount code and update total
  useEffect(() => {
    if (discountCode) {
      const matchedDiscount = discounts.find((d: any) => d.code === discountCode && d.eventId === service?.id);
      if (matchedDiscount) {
        setDiscount(matchedDiscount); // Set discount details if valid
        let newTotal = totalPrice;

        // Apply discount based on type
        if (matchedDiscount.type === "FLAT") {
          newTotal = Math.max(0, totalPrice - matchedDiscount.value); // Ensures no negative values
        } else if (matchedDiscount.type === "PERCENTAGE") {
          newTotal = totalPrice * (1 - matchedDiscount.value / 100);
        }

        setDiscountedTotal(newTotal.toFixed(2)); // Update the discounted total
        setError(null); // Clear any errors
      } else {
        setError("Invalid discount code.");
        setDiscountedTotal(totalPrice); // Reset total if invalid
      }
    }
  }, [discountCode, totalPrice, service, discounts]);

  const handleDiscountChange = (e: any) => setDiscountCode(e.target.value);

  const onSubmit = (values: z.infer<typeof formSchemaDeliveryDetails>) => {
    console.log(values);
    mutation.mutate(values, {
      onSuccess: () => router.push("/dashboard/market"),
      // onSuccess: (response) => setIsResponse(response.data.data.order.id),
    });
  };

  console.log(form.formState.errors);

  // Return skeleton if still loading
  if (userLoading || isLoading) return <SkeletonCard2 />;

  return (
    <Dashboard className='relative mx-auto mt-[55px]'>
      {/* HEADER */}
      <DashboardHeader>
        <DashboardHeaderText>View Event</DashboardHeaderText>
      </DashboardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='mt-2'>
          <div className='grid sm:grid-cols-2 gap-5 '>
            <div>
              <h6>Delivery Details</h6>
              <div className='border-b border-gray-200'></div>

              <div className='flex flex-col gap-3 my-2'>
                <div>
                  <p className='text-black font-medium my-2'>Personal Information</p>
                  <FormField
                    control={form.control}
                    name='fullname'
                    render={({ field }) => (
                      <FormItem>
                        <Label>Owners full name</Label>
                        <Input placeholder='Stefan' {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='grid grid-cols-2 gap-3 max-w-full'>
                  <FormField
                    control={form.control}
                    name='phone'
                    render={() => (
                      <FormItem>
                        <Label>Phone number</Label>
                        <FormField
                          control={form.control}
                          name='phone'
                          render={({ field }) => (
                            <FormItem className='w-full'>
                              <Input placeholder='+1 (555) 98363' {...field} />
                              <FormMessage className='top-1' />
                            </FormItem>
                          )}
                        />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <Label>Email</Label>
                        <Input placeholder='you@company.com' {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className='flex flex-col gap-3 my-2'>
                <div>
                  <p className='text-black font-medium my-2'>Delivery Address</p>
                  <FormField
                    control={form.control}
                    name='shippingAddress'
                    render={({ field }) => (
                      <FormItem>
                        <Label>House address</Label>
                        <Input placeholder='Enter Address' {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='grid sm:grid-cols-3 gap-3 max-w-full'>
                  <FormField
                    control={form.control}
                    name='location'
                    render={({ field }) => (
                      <FormItem>
                        <Label>Location</Label>
                        <Input placeholder='Enter your location' {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='city'
                    render={({ field }) => (
                      <FormItem>
                        <Label>City</Label>
                        <Input placeholder='Enter your city' {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='billAddress'
                    render={({ field }) => (
                      <FormItem>
                        <Label>Zip code</Label>
                        <Input placeholder='Enter your zip code' {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className='my-2'>
                <p className='text-black font-medium mt-5 sm:mt-2 mb-2'>Additional details</p>
                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <Label>Note</Label>
                      <Textarea placeholder='Enter any more information you want to give the vendor' {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div>
              <div className='bg-white border-gray-200 rounded-lg py-4 sm:py-2 px-4 sm:px-6'>
                <h3 className='border-b border-gray-200 py-1 px-2'>Order Summary</h3>

                <div className='flex flex-col gap-[10px] p-6 border-b border-gray-200'>
                  <div className='flex items-center gap-3'>
                    <div className='w-[100px] h-[100px] overflow-hidden rounded-lg'>
                      <Image
                        src={vendorService && vendorService[0]?.media[0]}
                        className='h-full object-cover'
                        width={400}
                        height={400}
                        alt='Service'
                      />
                    </div>
                    <div className='flex flex-col gap-2'>
                      <div className='flex items-center gap-2'>
                        <p>Title:</p>
                        <p className='text-black font-medium'>
                          {activeService[0]?.package_name ? shortenText(activeService[0]?.package_name, 15) : "--"}
                        </p>
                      </div>
                      <div className='flex gap-2'>
                        <p>Vendor:</p>
                        <p className='text-black text-left w-full font-[500]'>
                          {vendorService && vendorService[0]?.Vendor?.User?.first_name}{" "}
                          {vendorService && vendorService[0]?.Vendor?.User?.last_name}
                        </p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <p>Package:</p>
                        <p className='text-red-700'>{activeService[0]?.name || "--"}</p>
                      </div>
                    </div>
                  </div>
                  <p className='text-[12px]'>{activeService[0]?.package_description || "--"}</p>
                </div>

                <div className='flex flex-col gap-4 py-4 border-b border-gray-200'>
                  <div className='flex gap-2 py-4'>
                    <FormField
                      control={form.control}
                      name='promo_code'
                      render={({}) => (
                        <FormItem className='w-full'>
                          <Input placeholder='Insert Promo Code' value={discountCode} onChange={handleDiscountChange} />
                          {error && <p className='text-red-700 relative top-1'>{error}</p>}
                        </FormItem>
                      )}
                    />
                    <Button
                      type='button'
                      onClick={() => setDiscountCode(discountCode)}
                      variant={"secondary"}
                      className='max-w-[108px]'
                    >
                      Apply code
                    </Button>
                  </div>
                  <div className='flex gap-2 items-center justify-between'>
                    <p className='text-black font-medium'>{activeService[0]?.name || "--"} package</p>
                    <p className='font-medium'>
                      {activeService[0]?.symbol ? `${activeService[0]?.symbol}${activeService[0]?.price}` : "--"}
                    </p>
                  </div>
                  <div className='flex gap-2 items-center justify-between'>
                    <p className='text-black font-medium'>Discount</p>
                    <p className='font-medium'>{activeService[0]?.symbol ? `-${activeService[0]?.symbol}0` : "--"}</p>
                  </div>
                </div>
                <div className='flex flex-col gap-2 py-4'>
                  <div className='flex gap-2 items-center justify-between'>
                    <p className='text-black font-medium'>Total</p>
                    <p className='text-red-700 font-medium'>
                      {`${activeService[0]?.symbol} ${discountedTotal ? discountedTotal : totalPrice}`}
                    </p>
                  </div>
                </div>

                <Button disabled={mutation.isPending} className='my-5 max-w-full' type='submit'>
                  {mutation.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : "Confirm order"}
                </Button>

                <div className='text-[12px] text-gray-600 sm:text-sm text-center mb-4'>
                  By placing your order, you agree to our company{" "}
                  <Link href='/privacy' className='hover:text-black text-red-500'>
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href='/terms' className='hover:text-black text-red-500'>
                    Conditions of Use
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>

      {/* {isResponse && (
        <AlertDialog open onOpenChange={(open) => setIsResponse(open)}>
          <SuccessModal
            title='Order sent successfully'
            description='Awaiting confirmation from the vendor'
            setIsResponse={setIsResponse}
            url='/dashboard/market'
          >
            <AlertDialogAction
              onClick={() => (window.location.href = `/dashboard/orders/${isResponse}`)}
              className='mt-4'
            >
              View order
            </AlertDialogAction>
          </SuccessModal>
        </AlertDialog>
      )} */}
    </Dashboard>
  );
};

export default PackageDetails;
