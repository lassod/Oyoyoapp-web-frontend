import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type = "text", value, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      value={value ?? ""}
      className={cn(
        "-mb-2 flex h-10 w-full rounded-lg outline-none border border-gray-300 bg-white px-3 py-5 text-sm shadow-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:border-black",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
