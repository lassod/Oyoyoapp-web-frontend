"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useGetService, usePostServiceReview } from "@/hooks/services";
import { SkeletonCard2, SkeletonDemo } from "@/components/ui/skeleton";
import { useGetUser } from "@/hooks/user";
import { Dashboard } from "@/components/ui/containers";
import { BadgeCheck, Loader2, Star, UserPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { useGetFollowers, usePostFollow } from "@/hooks/follow";
import { useEffect, useState } from "react";
import { useGetVendorServices, useGetVendorReviews, useGetVendorById, useGetVendorRating } from "@/hooks/vendors";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { formSchemaReview } from "@/app/components/schema/Forms";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/app/components/business/Review";
import { FaTrophy } from "react-icons/fa6";
import { formatDescription } from "@/app/components/dashboard/EventSummary";

const ViewMarket = ({ params }: any) => {
  const navigation = useRouter();
  const { marketId } = params;

  // Fetching data
  const { data: service, isLoading: serviceLoading } = useGetService(marketId);
  const { data: user, isLoading: userLoading } = useGetUser();
  const { data: vendorService, isLoading: vendorServiceLoading } = useGetVendorServices(service?.VendorId);
  const { data: rating, isLoading: ratingLoading } = useGetVendorRating(service?.VendorId);
  const { data: vendor, isLoading: vendorLoading } = useGetVendorById(service?.VendorId);
  const { data: reviews, isLoading: reviewsLoading } = useGetVendorReviews(service?.VendorId);
  const { data: followers, isLoading: followersLoading } = useGetFollowers(vendor?.vendor?.UserId);

  const [activeService, setActiveService] = useState<any>([]);
  const [isFollowed, setIsFollowed] = useState(false);
  const { mutation: review } = usePostServiceReview();
  const { mutation: toggleFollow } = usePostFollow();
  const [showAllComments, setShowAllComments] = useState(false);
  const [comments, setComments] = useState<any>([]); // Start as empty

  const form = useForm<z.infer<typeof formSchemaReview>>({
    resolver: zodResolver(formSchemaReview),
  });

  // Update comments when reviews are fetched
  console.log(service);
  console.log(vendor);
  useEffect(() => {
    if (reviews) setComments(reviews);
  }, [reviews]);

  // Check if the user is followers the vendor
  useEffect(() => {
    if (followers && user) {
      const follow = followers.some((follow: any) => follow.followerId === user.id);
      setIsFollowed(follow);
    }
  }, [followers, user]);

  // Set active service plans
  useEffect(() => {
    if (vendorService) setActiveService(vendorService[0]?.Service_Plans);
  }, [vendorService]);

  // Handle follow/unfollow
  const handleFollowToggle = (action: string) => {
    toggleFollow.mutate(
      {
        userId: vendor?.vendor?.User?.id,
        action: action,
      },
      {
        onSuccess: () => setIsFollowed((prev) => !prev),
      }
    );
  };

  // Handle review submission
  const onSubmit = (values: z.infer<typeof formSchemaReview>) => {
    const comment = {
      comment: values.comment,
      rating: values.rating,
      User: {
        avatar: user?.avatar,
        first_name: user?.first_name,
        last_name: user?.last_name,
      },
      Service: service,
    };

    review.mutate(
      {
        id: service?.id,
        VendorId: service?.VendorId,
        ...values,
      },
      {
        onSuccess: () => setComments([comment, ...comments]),
      }
    );
  };

  const displayedComments = showAllComments ? comments : comments.slice(0, 4);

  if (serviceLoading || userLoading || vendorLoading || vendorServiceLoading || followersLoading || ratingLoading)
    return <SkeletonCard2 />;

  return (
    <Dashboard className='bg-white'>
      <div className='flex flex-col gap-[10px] sm:pb-20'>
        <div className='flex flex-col gap-[30px]'>
          <div className='flex flex-col sm:flex-row gap-4 items-center sm:items-start'>
            <div className='relative max-w-[108px] w-full h-[108px] border-white bg-red-100 rounded-full shadow-md overflow-hidden'>
              <Image
                src={service?.Vendor?.avatar || vendor?.vendor?.User?.avatar || "/noavatar.png"}
                width={400}
                height={400}
                alt='Avatar'
                className='max-w-full h-full'
              />
            </div>
            <div className='flex flex-col items-center sm:items-start gap-2'>
              <h6 className='flex items-center gap-2'>
                {vendor?.vendor?.first_name || vendor?.vendor?.User?.first_name}{" "}
                {vendor?.vendor?.last_name || vendor?.vendor?.User?.last_name}
                <FaTrophy
                  fill={`${
                    rating?.rankingStatus === "Diamond"
                      ? "#76A1EE"
                      : rating?.rankingStatus === "Gold"
                      ? "#FFC400"
                      : rating?.rankingStatus === "Silver"
                      ? "#C1C5B8"
                      : "#CD7F32"
                  }`}
                  className=''
                />
                {service?.Vendor?.status === "Approved" && <BadgeCheck fill='#b30909' className='text-white' />}
              </h6>
              <div className='flex items-center gap-[6px]'>
                <span
                  onClick={() => navigation.push(`rating/${service?.VendorId}`)}
                  className='flex items-center cursor-pointer hover:bg-black bg-red-700 px-4 py-1 rounded-full'
                >
                  <p className='text-[14px] text-white font-[400] pr-2 border-r border-white'>
                    {rating?.vendorRating?.totalGigs || "--"} Jobs
                  </p>
                  <p className='text-[14px] text-white font-[400] pl-2'>
                    {rating?.vendorRating?.completionPercentage || "--"} Completion
                  </p>
                </span>
                <span className='flex items-center'>
                  <Star fill='#F48E2F' className='h-5 w-5 text-[#F48E2F] ml-2' />
                  <p className='text-[#F48E2F] font-[500] pl-1'>{rating?.vendorRating?.rating || 0}</p>
                </span>
              </div>
              <span className='flex items-center'>
                <p className='text-[12px] font-[400] pr-2 border-r border-gray-200'>
                  @{vendor?.vendor?.User?.username}
                </p>
                <p className='text-[12px] pl-2'>
                  {vendor?.vendor?.User?.state} {vendor?.vendor?.User?.country}
                </p>
              </span>
              <span className='max-w-[500px]'>{service?.tagline}</span>

              <span className='flex items-center justify-center mt-2 w-full gap-[12px]'>
                {isFollowed ? (
                  <Button
                    disabled={toggleFollow.isPending}
                    className='m-0 px-5 sm:px-7'
                    onClick={() => handleFollowToggle("unfollow")}
                  >
                    <UserPlus className='mr-2 w-[17px]' />
                    Following
                  </Button>
                ) : (
                  <Button
                    disabled={toggleFollow.isPending}
                    className='m-0 px-5 sm:px-7'
                    onClick={() => handleFollowToggle("follow")}
                  >
                    <UserPlus className='mr-2 w-[17px]' />
                    Follow {vendor?.vendor?.User?.first_name}
                  </Button>
                )}
                {/* <Button variant='secondary'>
                  <LucideMessageSquareMore className='mr-2 w-[17px]' />
                  Message Jason
                </Button> */}
              </span>
            </div>
          </div>
          <div className='max-w-[700px]'>
            <p className='font-[500] mb-2 text-black'>Shop Details</p>
            <p>{service?.description}</p>
          </div>

          <Tabs defaultValue='Listing' className='w-full mt-4'>
            <TabsList className='grid max-w-[329px] grid-cols-2 h-10 items-center justify-center rounded-md bg-white p-1 text-gray-500'>
              {storeTab.map((item) => (
                <TabsTrigger value={item} key={item}>
                  {item}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className='border-b border-gray-200 mt-2'></div>
            {storeTab.map((item) => (
              <TabsContent value={item} key={item}>
                {item !== "Store Reviews" ? (
                  <Tabs defaultValue='Basic'>
                    <TabsList className='max-w-[329px] mt-5 pb-3 items-center rounded-md bg-white text-gray-500'>
                      {activeService?.map((store: any) => (
                        <TabsTrigger
                          value={store.name}
                          key={store.name}
                          className='rounded-sm py-2 px-5  data-[state=active]:border-b-[4px] data-[state=active]:border-red-700 data-[state=active]:text-red-700'
                        >
                          {store.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {activeService?.map((store: any) => (
                      <TabsContent value={store.name} key={store.name}>
                        <div className='flex flex-col gap-5 mt-[10px] max-w-[1000px]'>
                          <div>
                            <p className='text-black font-[500] mb-1'>Package name</p>
                            <p>{store.package_name}</p>
                          </div>
                          <div>
                            <p className='text-black font-[500] mb-1'>Package price</p>
                            <p className='text-red-700 text-lg font-medium'>
                              {store.symbol} {store.price}
                            </p>
                          </div>
                          <div>
                            <p className='text-black font-[500] mb-1'>Description</p>
                            <p>{formatDescription(store?.package_description)}</p>
                          </div>
                          <div className='max-w-full relative overflow-hidden'>
                            {vendorService && (
                              <div className='flex gap-5 w-full overflow-x-auto scrollbar-hide pb-4'>
                                {vendorService[0]?.media?.map((image: string, index: number) => (
                                  <Image
                                    key={index}
                                    src={image}
                                    width={400}
                                    height={400}
                                    alt='Image'
                                    className='w-[200px] sm:w-[350px] object-cover h-[200px] sm:h-[300px] rounded-lg flex-shrink-0'
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          <Button className='mt-5' onClick={() => navigation.push(`${marketId}/${store.name}`)}>
                            Order {store.name} package
                          </Button>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                ) : (
                  <div>
                    <div className='flex mt-5 mb-2 items-center justify-between gap-4'>
                      <p className='text-black font-medium'>Reviews({comments.length || 0})</p>
                      {comments.length > 4 && (
                        <p
                          onClick={() => setShowAllComments((prev) => !prev)}
                          className='text-red-700 cursor-pointer hover:underline'
                        >
                          {showAllComments ? "See Some" : "See All"}
                        </p>
                      )}
                    </div>
                    {reviewsLoading ? (
                      <SkeletonDemo />
                    ) : (
                      <div>
                        {comments.length > 0 ? (
                          <div className='grid grid-cols-1 sm:grid-cols-2 gap-8 py-10 border-b border-gray-200'>
                            {displayedComments?.map((review: any, index: number) => (
                              <div key={index} className='flex flex-col gap-3 border-b border-gray-200 pb-5'>
                                <div className='flex gap-3'>
                                  <Image
                                    src={review?.User?.avatar || "/noavatar.png"}
                                    width={100}
                                    height={100}
                                    alt='Avatar'
                                    className='w-[50px] h-[50px] rounded-full'
                                  />
                                  <div>
                                    <p className='font-medium text-black'>
                                      {review?.User?.first_name} {review?.User?.last_name}
                                    </p>
                                    <span className='flex gap-[2px]'>
                                      {Array.from({ length: review.rating || 0 }).map((_, index) => (
                                        <Star fill='#F48E2F' className='text-[#F48E2F] h-4 w-4 m-0' key={index} />
                                      ))}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <p className='text-black font-[500] mb-2'>Description</p>
                                  <p>{review?.comment}</p>
                                </div>
                                <div className='border flex gap-[3px] items-center'>
                                  <Image
                                    className='object-cover h-[50px] w-[50px]'
                                    src={review?.Service?.media[0]}
                                    alt='Image'
                                    width={300}
                                    height={300}
                                  />
                                  <div className='flex flex-col gap-[1px]'>
                                    <p className='text-xs'>{review?.Service?.tagline}</p>
                                    <p className='text-xs'>Type: Service</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className='relative'>
                            <h6 className='mt-5'>No Reviews</h6>
                          </div>
                        )}
                      </div>
                    )}

                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='flex flex-col max-w-[800px] w-full lg:flex-row gap-2 items-center mt-5'
                      >
                        <FormField
                          control={form.control}
                          name='comment'
                          render={({ field }) => (
                            <FormItem className='mt-4 w-full'>
                              <Textarea placeholder='Enter comment' className='h-20 w-full' {...field} />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className='flex flex-col justify-between gap-3'>
                          <FormField
                            control={form.control}
                            name='rating'
                            render={() => (
                              <FormItem className='mt-4'>
                                <StarRating onRatingSelect={(value) => form.setValue("rating", value)} />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type='submit' className='mr-0 mt-4 lg:m-0'>
                            {review.isPending ? <Loader2 className='w-4 h-4 animate-spin' /> : "Send message"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </Dashboard>
  );
};

export default ViewMarket;

const storeTab = ["Listing", "Store Reviews"];
