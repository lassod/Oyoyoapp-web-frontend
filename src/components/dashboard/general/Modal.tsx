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

export const NavDropdown = ({
  title,
  children,
  open,
  setOpen,
  className,
  isClose = true,
}: ModalProp) => {
  if (!open) return null;

  return (
    <>
      {/* Panel */}
      <div
        className={cn(
          // Anchor near top-right; adjust `right-*` to where your bell lives
          "fixed right-4 top-16 sm:right-[80px] z-[999]",
          // Width that never exceeds viewport; prevents horizontal scroll
          "w-[min(92vw,560px)]",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl border bg-background shadow-lg">
          {/* Optional simple title bar (we're not using it for Notifications to avoid double header) */}
          {title && (
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h4 className="font-semibold">{title}</h4>
              {isClose && (
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-md hover:bg-muted"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Single scroll container */}
          <div className="relative max-h-[70vh] overflow-y-auto overflow-x-hidden">
            {children}
          </div>
        </div>
      </div>

      {/* Backdrop (z below panel) */}
      <div
        onClick={() => setOpen(false)}
        className="fixed inset-0 z-[998] bg-black/40"
      />
    </>
  );
};
