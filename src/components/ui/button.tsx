"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import Add from "../../app/components/assets/images/add-button-red.svg";
import Gallery from "../../app/components/assets/images/gallery-add.svg";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { XCircle } from "lucide-react";

const buttonVariants = cva(
  "flex items-center justify-center whitespace-nowrap rounded-[30px] text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-red-700 text-primary-foreground hover:bg-primary/90",
        secondary: "bg-white text-black border border-gray-300 hover:bg-primary/90 hover:text-white",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "flex max-w-full items-center justify-start border border-gray-300 rounded-lg bg-transparent px-3 py-5 bg-white hover:bg-gray-100",
        combobox:
          "bg-white hover:bg-white !px-3 justify-between font-normal text-black border border-gray-300 rounded-lg hover:border-black w-full max-w-full",
        ghost: "flex items-center hover:bg-accent w-auto hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "w-full bg-green-500 hover:bg-green-600 text-white",
        "link-green": "text-green-500 hover:underline",
        "link-red": "text-red-700 hover:underline",
        "link-gray": "text-gray-600 hover:text-red-700",
        select: "bg-white border shadow-[#1018280D] text-black hover:bg-gray-50",
      },
      size: {
        default: "h-10 px-4 sm:px-6 py-2",
        "no-padding": "w-fit",
        sm: "flex w-full justify-between h-9 px-3 sm:px-3",
        lg: "h-full rounded-md px-4 py-4 w-full",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        type='button'
        // type="submit"
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

const AddButtonContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-3 mt-2", className)}>
      {children}
    </div>
  )
);
AddButtonContainer.displayName = "AddButtonContainer";

const AddButton = ({ title, onFileChange, isMultiple = false, type = 1 }: any) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isMultiple) {
      if (event.target.files && event.target.files.length > 0) {
        const files = Array.from(event.target.files); // Convert FileList to an array
        onFileChange(files); // Pass the files array to the parent
      }
    } else {
      if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0];
        onFileChange(file);
      }
    }
  };

  return (
    <>
      {type === 1 ? (
        <label className='flex gap-4 items-center overflow-hidden cursor-pointer'>
          <input
            className='hidden'
            type='file'
            multiple
            accept='image/png, image/jpeg, image/gif'
            name='image'
            onChange={handleFileChange}
          />
          <Image src={Add} alt='Add' />
          <p className=' text-red-700 hover:text-black'>{title}</p>
        </label>
      ) : (
        <label className='bg-red-100 flex flex-col px-3 py-8 hover:bg-red-50 hover:border-solid rounded-xl border border-dashed max-w-[150px] border-red-700 gap-2 items-center overflow-hidden cursor-pointer'>
          <input
            className='hidden'
            type='file'
            multiple
            accept='image/png, image/jpeg, image/gif'
            name='image'
            onChange={handleFileChange}
          />
          <Image src={Gallery} alt='Photo' />
          <p className=' text-red-700 hover:text-black'>{title}</p>
        </label>
      )}
    </>
  );
};

const FileDisplay = ({ files, file, onRemove, isMultiple = false }: any) => {
  return (
    <>
      {isMultiple ? (
        <div className='flex gap-2 flex-wrap'>
          {files.map((file: any, index: number) => (
            <div key={index} className='relative'>
              <XCircle
                onClick={() => onRemove(index)}
                className='h-5 w-5 absolute top-1 left-1 text-red-700 cursor-pointer'
              />
              <Image
                src={typeof file === "string" ? file : URL.createObjectURL(file)}
                alt={`file-preview-${index}`}
                width={110}
                height={110}
                className='max-w-[110px] rounded-md h-[110px] object-cover'
              />
            </div>
          ))}
        </div>
      ) : (
        <>
          {file && (
            <div className='flex relative gap-2 flex-wrap'>
              <XCircle
                onClick={() => onRemove()}
                className='h-5 w-5 absolute top-1 left-1 text-red-700 cursor-pointer'
              />
              <Image
                src={file && URL.createObjectURL(file)}
                alt={`file-preview`}
                width={110}
                height={110}
                className='max-w-[110px] rounded-md h-[110px] object-cover'
              />
            </div>
          )}
        </>
      )}
    </>
  );
};

export { Button, AddButtonContainer, AddButton, FileDisplay, buttonVariants };
