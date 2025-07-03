import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "relative flex h-11 w-full rounded-lg border bg-white px-3 py-5 text-sm shadow-gray-300 transition-colors",
        "placeholder:text-foreground placeholder:text-gray-400",
        "focus:outline-none focus:ring-[3px] focus:ring-red-100 focus:border-red-300 focus:border-[2px]",
        "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
