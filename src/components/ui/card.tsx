import * as React from "react";
import { cn } from "@/lib/utils";
import { Item } from "@radix-ui/react-accordion";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
);
CardFooter.displayName = "CardFooter";

interface CardWalletProp {
  title: any;
  header: any;
}

const CardWallet = ({ title, header }: CardWalletProp) => {
  return (
    <div className='py-2 xl:py-3 px-2 xl:px-5 hover:bg-red-700 hover:border-red-700 [&>p]:hover:text-white [&>h6]:hover:text-white relative flex flex-col p-[12px] gap-[10px] rounded-[8px] border border-gray-200'>
      <p>{title}</p>
      <h6>{header}</h6>
    </div>
  );
};

const CardWallet2 = ({ title, icon, icon2, header, percent, price, symbol }: any) => {
  const icon1 = { icon: icon };
  const icon3 = { icon: icon2 };

  return (
    <div className='[&>.icon]:hover:bg-[#fbfafc50] [&>.iconDetails]:hover:bg-white [&>span]:hover:bg-white [&>.icon2]:hover:bg-white [&>.icon2]:hover:text-red-700 overflow-x-hidden bg-white hover:bg-red-700 max-w-[400px] relative flex flex-col p-5 rounded-sm gap-[20px] border border-gray-100 hover:border-red-700'>
      <div className='flex items-center gap-2'>
        <div className='icon bg-red-50 flex relative items-center justify-center icon w-[25.68px] h-[25.68px] rounded-full'>
          <div className='iconDetails flex items-center justify-center w-[16px] h-[16px] rounded-full'>
            <icon1.icon className='w-[12.5px] text-red-700 h-[12.5px]' />
          </div>
        </div>
        <span className='text-[13px] font-semibold'>{title}</span>
      </div>
      <div className='flex flex-col gap-3'>
        <h3>{header && symbol ? `${symbol} ${header.toFixed(2)}` : header || "--"}</h3>

        <div className='flex items-center gap-1 justify-between'>
          <div className='flex items-center gap-1'>
            <div className='icon2 bg-red-700 text-white w-[17px] h-[17px] rounded-full p-[1px]'>
              <icon3.icon className='w-full h-full' />
            </div>
            <h4 className='text-sm leading-none m-0'>{percent}%</h4>
          </div>
          <h4 className='text-sm leading-none m-0'>+{price} this week</h4>
        </div>
      </div>
    </div>
  );
};

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardWallet, CardWallet2 };
