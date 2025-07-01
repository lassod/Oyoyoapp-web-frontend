"use client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProp {
  title?: string;
  open?: boolean;
  isClose?: boolean;
  setOpen?: any;
  description?: string;
  className?: string;
  children?: any;
  icon?: any;
  variant?: "Success" | "Delete" | "Logout" | "Hide" | "Reset";
}

export const CustomModal = ({ title, children, open, setOpen, isClose, className, description }: ModalProp) => {
  if (!open) return null;
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) setOpen(false);
      }}
    >
      <DialogContent
        title={title}
        description={description}
        isClose={isClose}
        isOverlay={true}
        className={cn("px-[10px] sm:max-w-[500px] w-full sm:bg-white gap-0", className)}
      >
        <div className={cn("sm:max-w-[500px] p-3 sm:p-5 w-full bg-white max-h-[90vh] overflow-y-auto", className)}>
          {children}
        </div>
        <div className='bg-white h-4 w-full sticky bottom-0'></div>
      </DialogContent>
    </Dialog>
  );
};

export const NavDropdown = ({ title, children, open, setOpen, className, isClose = true }: ModalProp) => {
  if (!open) return null;
  return (
    <>
      <div
        className={cn(
          "absolute overflow-hidden max-w-[426px] w-full right-0 lg:right-[80px] mt-[370px] border rounded-[20px] bg-background z-[999]",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className='relative w-full'>
          {title && (
            <div className='flex sticky top-0 bg-background z-20 justify-between border-b gap-10 p-4 md:p-6 items-center'>
              <h4 className='font-bold'>{title}</h4>
              {isClose && <X onClick={() => setOpen(false)} className='h-5 cursor-pointer sm:h-6 w-5 sm:w-6' />}
            </div>
          )}
          <div className='overflow-auto relative max-h-[40vh] p-2 sm:p-4'>{children}</div>
        </div>
      </div>
      <div onClick={() => setOpen(false)} className='fixed inset-0 z-50 bg-black/40'></div>
    </>
  );
};
