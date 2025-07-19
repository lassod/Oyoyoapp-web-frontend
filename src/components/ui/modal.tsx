"use client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProp {
  title?: string;
  open?: boolean;
  isClose?: boolean;
  setOpen?: any;
  description?: string;
  className?: string;
  className2?: string;
  children?: any;
  icon?: any;
  variant?: "Success" | "Delete" | "Logout" | "Hide" | "Reset";
}

export const CustomModal = ({
  title,
  children,
  open,
  setOpen,
  isClose,
  className,
  description,
}: ModalProp) => {
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
        className={cn(
          "px-[10px] sm:max-w-[500px] w-full sm:bg-white gap-0",
          className
        )}
      >
        <div
          className={cn(
            "sm:max-w-[500px] p-3 sm:p-5 w-full bg-white max-h-[90vh] overflow-y-auto",
            className
          )}
        >
          {children}
        </div>
        <div className="bg-white h-4 w-full sticky bottom-0"></div>
      </DialogContent>
    </Dialog>
  );
};
