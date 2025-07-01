"use client";
import React, { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { SkeletonCard2, SkeletonCard1 } from "@/components/ui/skeleton";
import { Dashboard } from "@/components/ui/containers";
import EventCard from "@/app/components/dashboard/EventCard";
import { useGetSpecificEvents } from "@/hooks/events";
import { useSession } from "next-auth/react";
import { Info, MapPinIcon, Phone, X } from "lucide-react";
import { useGetUser } from "@/hooks/user";
import Image from "next/image";
import { filterEventsByDate } from "@/lib/auth-helper";
import { FilterMenu } from "../../components/dashboard/FilterMenu";
import empty from "../../components/assets/images/empty.svg";
import { usePathname, useRouter } from "next/navigation";
import ViewEvent from "@/components/dashboard/events/ViewEvent";
import TicketSummary from "@/components/dashboard/events/TicketSummary";
import { Button } from "@/components/ui/button";
import { useGetOnboardingStatus } from "@/hooks/wallet";
import { FaInfoCircle } from "react-icons/fa";

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [eventsNearMe, setEventsNearMe] = useState([]);
  const [filterUpcoming, setFilterUpcoming] = useState("");
  const [filterTrending, setFilterTrending] = useState("");
  const [filterPast, setFilterPast] = useState("");
  const [event, setEvent] = useState<any>(null);
  const [ticket, setTicket] = useState<any>(null);
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const { data: user } = useGetUser();
  const router = useRouter();
  const [kycInfo, setKycInfo] = useState<any>(null);
  const { data: kycData, status: kycStatus } = useGetOnboardingStatus();

  useEffect(() => {
    if (kycStatus === "success") {
      if (kycData.kycRecord?.status === "IN_REVIEW") setKycInfo("KYC is in review. You'll be notified if successful");
      else if (kycData.kycRecord?.status === "PENDING")
        setKycInfo("KYC application is pending. You'll be notified if successful");
      else if (kycData.kycRecord?.status === "REJECTED")
        setKycInfo("KYC application was rejected. You'll be notified if successful");
      else if (kycData.kycRecord?.status === "APPROVED") setKycInfo(null);
    }
  }, [kycStatus, kycData]);

  useEffect(() => {
    if (event) sessionStorage.setItem("selectedEvent", JSON.stringify(event));
    if (ticket) sessionStorage.setItem("selectedTicket", JSON.stringify(ticket));
  }, [event, ticket]);

  const {
    data: upcomingEnv,
    isLoading: upcomingLoading,
    refetch: isUpcomingRefecth,
    isFetching: isUpcomingFetching,
  } = useGetSpecificEvents("upcoming");
  const {
    data: trendingEnv,
    isLoading: trendingLoading,
    refetch: isTrendingRefecth,
    isFetching: isTrendingFetching,
  } = useGetSpecificEvents("trending");
  const {
    data: pastEnv,
    isLoading: pastLoading,
    refetch: isPastRefecth,
    isFetching: isPastFetching,
  } = useGetSpecificEvents("past");
  const {
    data: nearMeEnv,
    isLoading: nearMeLoading,
    refetch: isNearRefecth,
    isFetching: isNearFetching,
  } = useGetSpecificEvents("near-me");

  useEffect(() => {
    isUpcomingRefecth();
    isTrendingRefecth();
    isPastRefecth();
    isNearRefecth();

    const savedEvent = sessionStorage.getItem("selectedEvent");
    const savedTicket = sessionStorage.getItem("selectedTicket");
    if (savedEvent) setEvent(JSON.parse(savedEvent));
    if (savedTicket) setTicket(JSON.parse(savedTicket));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (upcomingEnv) setUpcomingEvents(filterEventsByDate(upcomingEnv, filterUpcoming));
  }, [upcomingEnv, filterUpcoming]);
  useEffect(() => {
    if (trendingEnv) setTrendingEvents(filterEventsByDate(trendingEnv, filterTrending));
  }, [trendingEnv, filterTrending]);
  useEffect(() => {
    if (pastEnv) setPastEvents(filterEventsByDate(pastEnv, filterPast, true));
  }, [pastEnv, filterPast]);

  const plugin1 = React.useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));

  useEffect(() => {
    if (upcomingEnv) setUpcomingEvents(upcomingEnv);
  }, [upcomingEnv]);
  useEffect(() => {
    if (pastEnv) setPastEvents(pastEnv);
  }, [pastEnv]);
  useEffect(() => {
    if (trendingEnv) setTrendingEvents(trendingEnv);
  }, [trendingEnv]);
  useEffect(() => {
    if (nearMeEnv) setEventsNearMe(nearMeEnv);
  }, [nearMeEnv]);

  if (isLoading) return <SkeletonCard2 />;
  if (status === "loading") return <SkeletonCard2 />;
  return (
    <>
      {pathname === "/dashboard/events/view" && event ? (
        <ViewEvent event={event} setTicket={setTicket} />
      ) : pathname === "/dashboard/events/completed" && event ? (
        <ViewEvent event={{ ...event, completed: true }} setTicket={setTicket} />
      ) : pathname === "/dashboard/events/view-ticket" && event && ticket ? (
        <TicketSummary event={event} ticket={ticket} />
      ) : (
        <Dashboard className='bg-white'>
          {session?.user?.accountType !== "PERSONAL" ? (
            <div className='space-y-2'>
              <div>
                <h3 className='mb-2'>Home</h3>
                <p>Explore the top events on Oyoyo</p>
              </div>
              {kycInfo && (
                <div className='border rounded-xl bg-red-50 p-2 sm:p-4 grid grid-cols-[20px,1fr,20px]  gap-2 sm:gap-4'>
                  <FaInfoCircle className='text-red-50 sm:w-5 sm:h-5 mt-1 fill-red-600' />
                  <div className='space-y-2'>
                    <h4 className='font-semibold'>KYC Verification</h4>
                    <p>{kycInfo}</p>
                    <Button variant='destructive' onClick={() => router.push("/dashboard/wallet/verification")}>
                      Proeed
                    </Button>
                  </div>
                  <X className='cursor-pointer hover:text-primary' onClick={() => setKycInfo(false)} />
                </div>
              )}
            </div>
          ) : (
            <div className='flex gap-4 items-start'>
              <div className='relative max-w-[108px] w-full h-[108px] border-white bg-red-100 rounded-full shadow-md overflow-hidden'>
                <Image
                  src={user?.image || "/noavatar.png"}
                  width={400}
                  height={400}
                  alt='Avatar'
                  className='max-w-full h-full'
                />
              </div>
              <div className='flex flex-col gap-3'>
                <h5 className='flex items-center gap-2'>
                  {user?.first_name || "--"} {user?.last_name}
                </h5>
                <span className='flex items-center'>
                  <div className='pr-4 border-r border-gray-200'>
                    <p className='leading-normal text-center text-black'>{user?._count?.following || 0}</p>
                    <p className='text-center leading-normal text-[sm] font-[400]'>Following</p>
                  </div>
                  <div className='pl-4'>
                    <p className='text-black leading-normal text-center'>{user?._count?.followers || 0}</p>
                    <p className='text-center leading-normal text-[sm]'>Followers</p>
                  </div>
                </span>
                <p className='text-black'>{user?.bio || "--"}</p>
                <span className='flex items-center'>
                  <div className='pr-4 flex items-center gap-2 border-r border-gray-200'>
                    <Phone className='w-[20px] text-gray-500' />
                    <p className='leading-normal text-black'>{user?.phone || "--"}</p>
                  </div>
                  <div className='pl-4 flex items-center gap-2'>
                    <MapPinIcon className='w-[20px] text-gray-500' />
                    <p className='text-black leading-normal'>
                      {user?.state} {user?.country || "--"}
                    </p>
                  </div>
                </span>
              </div>
            </div>
          )}
          <div>
            <div className='flex flex-col gap-10 pt-4 pb-10'>
              <div className='flex flex-col gap-1 '>
                <h4 className='mb-2'>Upcoming Events</h4>
                <FilterMenu
                  type={1}
                  filterDateRange={filterUpcoming}
                  placeholder={"Filter by Date"}
                  setFilterDateRange={setFilterUpcoming}
                />

                {upcomingLoading ? (
                  <SkeletonCard1 />
                ) : (
                  <Carousel onMouseLeave={plugin1.current.reset}>
                    <div className='absolute z-[1] top-[50%] w-full flex items-center'>
                      <CarouselPrevious className='left-[-8px] sm:left-[-18px]' />
                      <CarouselNext className=' right-[-8px] sm:right-[-18px]' />
                    </div>
                    <CarouselContent className='flex mt-4 relative gap-4 pb-4'>
                      {upcomingEvents.length > 0 ? (
                        upcomingEvents.map((item: any) => (
                          <CarouselItem
                            key={item?.id}
                            className='relative max-w-[320px] p-0 rounded-lg overflow-hidden'
                          >
                            <EventCard item={item} setEvent={setEvent} isFetching={isUpcomingFetching} />
                          </CarouselItem>
                        ))
                      ) : (
                        <div className='flex flex-col items-center justify-center w-full h-[150px] gap-4'>
                          <Image src={empty} alt='empty' width={100} height={100} className='w-[100px] h-auto' />
                          <p className='text-[#666666] text-center'>No Event</p>
                        </div>
                      )}
                    </CarouselContent>
                  </Carousel>
                )}
              </div>
              <div className='flex flex-col gap-1'>
                <div className='flex flex-col gap-4 md:mt-4 mb-5'>
                  <h4>Trending Events</h4>
                  <FilterMenu
                    type={1}
                    filterDateRange={filterTrending}
                    placeholder={"Filter by Date"}
                    setFilterDateRange={setFilterTrending}
                  />
                </div>
                {trendingLoading ? (
                  <SkeletonCard1 />
                ) : (
                  <Carousel>
                    <div className='absolute z-[1] top-[50%] w-full flex items-center'>
                      <CarouselPrevious className='left-[-8px] sm:left-[-18px]' />
                      <CarouselNext className=' right-[-8px] sm:right-[-18px]' />
                    </div>
                    <CarouselContent className='flex relative gap-4 pb-4'>
                      {trendingEvents.length > 0 ? (
                        trendingEvents.map((item: any) => (
                          <CarouselItem
                            key={item?.id}
                            className='relative max-w-[320px] p-0 rounded-lg overflow-hidden'
                          >
                            <EventCard item={item} setEvent={setEvent} isFetching={isTrendingFetching} />
                          </CarouselItem>
                        ))
                      ) : (
                        <div className='flex flex-col items-center justify-center w-full h-[150px] gap-4'>
                          <Image src={empty} alt='empty' width={100} height={100} className='w-[100px] h-auto' />
                          <p className='text-[#666666] text-center'>No Event</p>
                        </div>
                      )}
                    </CarouselContent>
                  </Carousel>
                )}
              </div>
              <div className='flex flex-col gap-1'>
                <div className='flex flex-col gap-4 md:mt-4 mb-5'>
                  <h4>Past Events</h4>
                  <FilterMenu
                    type={2}
                    filterDateRange={filterPast}
                    placeholder={"Filter by Date"}
                    setFilterDateRange={setFilterPast}
                  />
                </div>
                {pastLoading ? (
                  <SkeletonCard1 />
                ) : (
                  <Carousel>
                    <div className='absolute z-[1] top-[50%] w-full flex items-center'>
                      <CarouselPrevious className='left-[-8px] sm:left-[-18px]' />
                      <CarouselNext className=' right-[-8px] sm:right-[-18px]' />
                    </div>
                    <CarouselContent className='flex relative gap-4 pb-4'>
                      {pastEvents.length > 0 ? (
                        pastEvents.map((item: any) => (
                          <CarouselItem
                            key={item?.id}
                            className='relative max-w-[320px] p-0 rounded-lg overflow-hidden'
                          >
                            <EventCard item={item} setEvent={setEvent} isFetching={isPastFetching} />
                          </CarouselItem>
                        ))
                      ) : (
                        <div className='flex flex-col items-center justify-center w-full h-[150px] gap-4'>
                          <Image src={empty} alt='empty' width={100} height={100} className='w-[100px] h-auto' />
                          <p className='text-[#666666] text-center'>No Event</p>
                        </div>
                      )}
                    </CarouselContent>
                  </Carousel>
                )}
              </div>
            </div>
            {nearMeLoading ? (
              <SkeletonCard1 />
            ) : (
              <Carousel>
                <h4 className=' md:mt-4'>Events Near You</h4>
                <div className='absolute z-[1] top-[50%] w-full flex items-center'>
                  <CarouselPrevious className='left-[-8px] sm:left-[-18px]' />
                  <CarouselNext className=' right-[-8px] sm:right-[-18px]' />
                </div>
                <CarouselContent className='flex relative gap-4 pb-4'>
                  {eventsNearMe.length > 0 ? (
                    eventsNearMe?.map((item: any) => (
                      <CarouselItem key={item?.id} className='relative max-w-[320px] p-0 rounded-lg overflow-hidden'>
                        <EventCard item={item} setEvent={setEvent} isFetching={isNearFetching} />
                      </CarouselItem>
                    ))
                  ) : (
                    <div className='flex flex-col items-center justify-center w-full h-[150px] gap-4'>
                      <Image src={empty} alt='empty' width={100} height={100} className='w-[100px] h-auto' />
                      <p className='text-[#666666] text-center'>No Event</p>
                    </div>
                  )}
                </CarouselContent>
              </Carousel>
            )}
          </div>
        </Dashboard>
      )}
    </>
  );
};

export default DashboardPage;
