"use client";
import { Button } from "@/components/ui/button";
import ReactPlayer from "react-player/lazy";
import { ArrowRightCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const Onboarding = () => {
  const navigation = useRouter();

  return (
    <div className='bg-gray-50'>
      <div className='py-5 px-4 bg-white'>
        <div className='flex font-medium items-start max-w-[1300px] mx-auto'>
          <p className='text-black'>Getting Started on Oyoyo</p>
        </div>
      </div>
      <div className='bg-white flex flex-col gap-2 items-center justify-center max-w-[964px] py-5 px-4 md:px-20 mx-auto mt-5 rounded-lg'>
        <h6>Welcome to Oyoyo 🎉</h6>
        <p className='leading-normal text-center'>
          We&apos;re excited to have you join our platform as a new seller. This video will guide you through the
          essential steps to help you get started and maximize your success on Oyoyo. Let&apos;s dive in!
        </p>
        <div className='video shadow-xl w-full bg-black rounded-lg my-6'>
          <ReactPlayer width='100%' height={500} controls url='https://www.youtube.com/watch?v=kLVXFa8CuuE' />
        </div>
        <p className='text-center leading-normal'>
          Here are some important things to take note of as a seller. You can choose watch the video or skip directly to
          your dashboard.
        </p>
      </div>
      <div className='py-5 px-4 mt-5 bg-white'>
        <section className='max-w-[1300px] flex items-end justify-end mx-auto'>
          <div className='flex max-w-[350px]'>
            <Button onClick={() => navigation.push(`/dashboard/home`)}>
              Next <ArrowRightCircleIcon className='ml-2 w-4' />
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Onboarding;
