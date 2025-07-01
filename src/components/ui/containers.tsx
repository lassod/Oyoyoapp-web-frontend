"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowLeftCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSidebar } from "./sidebar/sidebar";
import { Reveal1 } from "@/app/components/animations/Text";

const Dashboard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children }, ref) => (
    <div ref={ref} className={cn("px-4 sm:px-6 lg:px-8 mx-auto flex flex-col gap-[10px] pb-20 pt-24", className)}>
      {children}
    </div>
  )
);
Dashboard.displayName = "Dashboard";

const DashboardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children }, ref) => {
    const { state } = useSidebar();
    return (
      <div
        ref={ref}
        className={cn(
          `max-w-[1680px] border-b border-gray-200 bg-white z-10 px-4 lg:px-8 flex justify-between items-center mx-auto fixed top-[62px] sm:top-[72px] left-0 right-0 h-[76px] ${
            state === "collapsed" ? "lg:left-[70px]" : "lg:left-[240px]"
          }`,
          className
        )}
      >
        {children}
      </div>
    );
  }
);
DashboardHeader.displayName = "DashboardHeader";

const DashboardHeaderText = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const navigation = useRouter();
  return (
    <div onClick={() => navigation.back()} className={cn(`flex items-center gap-4 ${className}`)}>
      <ArrowLeftCircle className='cursor-pointer hover:text-red-700 h-5 w-5' />
      {children}
    </div>
  );
};

DashboardHeaderText.displayName = "DashboardHeaderText";

const DashboardContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children }, ref) => (
    <div ref={ref} className={cn("relative md:bg-white w-full lg:max-w-[780px] pt-5 md:px-8 pb-14", className)}>
      {children}
    </div>
  )
);
DashboardContainer.displayName = "DashboardContainer";

const LandingContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, id, children }, ref) => (
    <div
      id={id}
      ref={ref}
      className={cn(
        "flex flex-col gap-8 md:gap-16 py-20 px-4 lg:px-6 max-w-[1280px] mx-auto relative top-36 md:top-44",
        className
      )}
    >
      {children}
    </div>
  )
);
LandingContainer.displayName = "LandingContainer";

interface DashboardProps {
  className?: string;
  type?: number;
  children?: any;
}
const DashboardContainerContent = React.forwardRef<HTMLDivElement, DashboardProps>(
  ({ className, type, children }, ref) => (
    <div
      ref={ref}
      className={cn(
        `py-5 ${
          type === 1
            ? "grid bg-white md:bg-gray-50 gap-4 md:grid-cols-[1fr,50%] md:py-0"
            : "flex flex-col gap-4 border-b border-gray-200 md:py-8"
        }`,
        className
      )}
    >
      {children}
    </div>
  )
);
DashboardContainerContent.displayName = "DashboardContainerContent";

const FormsContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children }, ref) => {
    const { state } = useSidebar();
    return (
      <div
        ref={ref}
        className={cn(
          `relative grid grid-cols-1 md:grid-cols-2 md:mt-[49px] pt-24 pl-4 pr-4 lg:pr-0 ${
            state === "collapsed" ? "lg:pl-[5px]" : "lg:pl-[165px]"
          }`,
          className
        )}
      >
        {children}
      </div>
    );
  }
);

FormsContainer.displayName = "FormsContainer";

const StepsContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center pt-24 my-5 mx-auto relative w-full max-h-[713px] md:max-w-[498px] lg:max-w-[538px]",
        className
      )}
    >
      {children}
    </div>
  )
);
StepsContainer.displayName = "StepsContainer";

const LandingTitle = ({ header, title, text }: { header?: string; title: string; text?: string }) => {
  return (
    <div className='flex mx-auto flex-col justify-between items-center gap-2'>
      {header && <p className='text-red-700 text-center text-sm md:text-[16px] font-[600]'>{header}</p>}
      <Reveal1>
        <h2 className='text-center text-black font-[600] text-[17.5px] md:text-[28px]'>{title}</h2>
      </Reveal1>
      <p className='max-w-[522px text-sm md:text-[15px]  text-center'>{text}</p>
    </div>
  );
};

const LandingWrapper = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children }, ref) => (
    <div ref={ref} className={cn("grid grid-cols-1 md:grid-cols-2 items-center gap-7 md:gap-14", className)}>
      {children}
    </div>
  )
);
LandingWrapper.displayName = "LandingWrapper";

export {
  Dashboard,
  DashboardHeader,
  DashboardHeaderText,
  DashboardContainer,
  DashboardContainerContent,
  FormsContainer,
  StepsContainer,
  LandingContainer,
  LandingWrapper,
  LandingTitle,
};
