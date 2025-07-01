import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "rounded-full cursor-pointer hover:opacity-80 flex items-center w-fit px-2 py-1 font-medium text-xs",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-black",
        yellow: "bg-amber-50 border border-yellow-300 text-amber-700",
        success: "bg-green-50 border border-green-300 text-green-700",
        purple: "bg-purple-50 border border-purple-300 text-purple-700",
        blue: "bg-blue-100 text-blue-700",
        "success-50": "bg-green-50 text-green-700",
        "text-success": "px-0 text-green-700 font-normal text-[15px]",
        "text-success-medium": "px-0 text-green-500 font-normal text-[15px]",
        "text-success-light": "text-green-400 font-normal",
        "text-destructive-light": "text-red-400 font-normal",
        "text-destructive-medium": "px-0 text-red-500 font-normal text-[15px]",
        "text-destructive": "text-red-700 px-0 font-normal text-[15px]",
        "text-black": "text-black font-normal text-[15px]",
        "text-gray": "px-0 text-gray-600 font-normal text-[15px]",
        "text-purple": "text-purple-700 bg-purple-50 font-normal text-[14px]",
        destructive: "bg-red-50 border border-red-300 text-red-700",
        "destructive-50": "bg-red-50 text-red-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
