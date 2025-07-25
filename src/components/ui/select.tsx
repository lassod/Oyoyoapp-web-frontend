"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp, ChevronsUpDown, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "./button";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between gray-300 px-3 py-5 rounded-lg shadow-none border border-gray-300 bg-background !text-sm xl:text-sm ring-offset-background placeholder:text-gray-400 focus:outline-none focus:border-black disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

interface Option {
  label: string;
  value: string | number;
}

interface CustomSelectProps {
  options: (string | Option)[];
  value: string | number | (string | number)[] | undefined;
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
  isMulti?: boolean;
}

function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select option(s)",
  className,
  isMulti = false,
}: CustomSelectProps) {
  const normalizedOptions: Option[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  console.log(value);

  if (isMulti) {
    const arrayValue = Array.isArray(value) ? value : [];

    const toggleValue = (v: string) => {
      const exists = arrayValue.includes(v);
      const updated = exists
        ? arrayValue.filter((val) => val !== v)
        : [...arrayValue, v];
      onChange(updated);
    };

    return (
      <div className={cn("w-full space-y-2", className)}>
        <p className="text-sm text-gray-400">{placeholder}</p>
        <div className="flex flex-wrap gap-1 sm:gap-2 text-sm">
          {normalizedOptions.map((option) => {
            const isSelected = arrayValue.includes(option.value);
            return (
              <div
                key={option.value}
                onClick={() => toggleValue(option.value.toString())}
                className={cn(
                  "cursor-pointer border px-2 sm:px-4 py-1 rounded-full",
                  isSelected
                    ? "bg-primary text-white border-primary"
                    : "border-gray-300  hover:bg-gray-50"
                )}
              >
                {option.label}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Select
      value={value !== undefined ? String(value) : undefined}
      onValueChange={onChange}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {normalizedOptions.map((option) => (
          <SelectItem key={option.value} value={String(option.value)}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

type Option2 =
  | {
      label: string | any;
      value: string;
    }
  | string
  | number;

type SelectProps = {
  options: Option2[];
  value: string | string[] | any;
  onChange: (value: string | string[]) => void;
  className?: string;
  btnClassName?: string;
  optionClassName?: string;
  placeHolder?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  isArray?: boolean;
};

const CustomSelect2 = ({
  options,
  value,
  onChange,
  className,
  placeHolder,
  variant,
  size,
  btnClassName,
  optionClassName,
  isArray = false,
}: SelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionClick = (optionValue: string) => {
    if (isArray) {
      const currentValues = Array.isArray(value) ? value : [];
      const isSelected = currentValues.includes(optionValue);

      if (isSelected) {
        // Remove from selection
        const newValues = currentValues.filter((v) => v !== optionValue);
        onChange(newValues);
      } else {
        // Add to selection
        onChange([...currentValues, optionValue]);
      }
    } else {
      onChange(optionValue);
      setOpen(false);
    }
  };

  const removeSelectedItem = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isArray && Array.isArray(value)) {
      const newValues = value.filter((v) => v !== optionValue);
      onChange(newValues);
    }
  };

  const renderButtonContent = () => {
    if (isArray) {
      const selectedValues = Array.isArray(value) ? value : [];

      if (selectedValues.length === 0) {
        return (
          <span className="text-gray-500">
            {placeHolder || "Select options"}
          </span>
        );
      }

      if (selectedValues.length === 1) {
        const found = options.find((opt) =>
          typeof opt === "object"
            ? opt.value === selectedValues[0]
            : String(opt) === String(selectedValues[0])
        );
        const label = typeof found === "object" ? found.label : String(found);

        return (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
              {label}
              <X
                className="w-3 h-3 cursor-pointer hover:text-green-600"
                onClick={(e) => removeSelectedItem(selectedValues[0], e)}
              />
            </span>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
            {selectedValues.length} selected
          </span>
        </div>
      );
    } else {
      // Single select logic
      const found = options.find((opt) =>
        typeof opt === "object"
          ? opt.value === value
          : String(opt) === String(value)
      );

      if (!value || !found) {
        return (
          <span className="text-gray-500">
            {placeHolder || "Select an option"}
          </span>
        );
      }

      return (
        <span className="text-green-800">
          {typeof found === "object" ? found.label : String(found)}
        </span>
      );
    }
  };

  const isOptionSelected = (optionValue: string) => {
    if (isArray) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return String(value) === String(optionValue);
  };

  return (
    <div
      ref={ref}
      className={`relative inline-block w-full text-sm ${className}`}
    >
      <Button
        size={size ? size : "default"}
        variant={variant ? variant : "select"}
        type="button"
        className={`gap-2 relative h-11 justify-between ${btnClassName}`}
        onClick={() => setOpen(!open)}
      >
        <div className="flex-1 min-w-0 text-left">{renderButtonContent()}</div>
        {variant === "select" ? (
          <ChevronsUpDown className="w-5 h-5 text-gray-400 fill-gray-400 flex-shrink-0" />
        ) : (
          <>
            {open ? (
              <ChevronUp className="w-5 h-5 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 flex-shrink-0" />
            )}
          </>
        )}
      </Button>

      {open && (
        <ul
          className={`absolute right-0 z-10 py-3 px-1 mt-2 bg-white border rounded-xl shadow-lg max-h-[350px] overflow-auto ${
            optionClassName ? optionClassName : "w-full"
          }`}
        >
          {options.map((opt) => {
            const option =
              typeof opt === "object"
                ? opt
                : { label: String(opt), value: String(opt) };
            const selected = isOptionSelected(option.value);

            return (
              <li
                key={option.value}
                onClick={() => handleOptionClick(String(option.value))}
                className={`flex gap-2 whitespace-nowrap items-center justify-between px-4 py-2 cursor-pointer rounded-lg transition-colors ${
                  selected
                    ? isArray
                      ? "bg-green-50 text-green-800 hover:bg-green-100"
                      : "bg-green-50 text-green-800 hover:bg-green-100"
                    : "hover:bg-gray-50 hover:text-gray-900"
                } ${optionClassName ? optionClassName : "w-full"}`}
              >
                <span className="flex-1">{option.label}</span>
                {selected && (
                  <Check
                    className={`w-5 h-5 ${
                      isArray ? "text-green-600" : "text-green-600"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Multi-select tags display below button when many items selected */}
      {isArray && Array.isArray(value) && value.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {value.map((selectedValue) => {
            const found = options.find((opt) =>
              typeof opt === "object"
                ? opt.value === selectedValue
                : String(opt) === String(selectedValue)
            );
            const label =
              typeof found === "object" ? found.label : String(found);

            return (
              <span
                key={selectedValue}
                className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium"
              >
                {label}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-green-600"
                  onClick={(e) => removeSelectedItem(selectedValue, e)}
                />
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  CustomSelect2,
  CustomSelect,
};
