import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { XCircle, ChevronDown, XIcon, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput2,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import Image from "next/image";

const multiSelectVariants = cva(
  "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
  {
    variants: {
      variant: {
        default: "border-foreground/10 text-foreground bg-white hover:bg-card/80",
        secondary: "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        inverted: "inverted bg-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  options: {
    User: any;
    label: string;
    value: string;
    id: number;
    username: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  onValueChange: (value: string[]) => void;
  defaultValue?: string[];
  placeholder?: string;
  animation?: number;
  maxCount?: number;
  asChild?: boolean;
  className?: string;
}

export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      placeholder = "Select options",
      animation = 0,
      maxCount = 4,
      asChild = false,
      className,
      ...props
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] = React.useState<string[]>(defaultValue);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [isAnimating] = React.useState(false);

    React.useEffect(() => {
      if (JSON.stringify(selectedValues) !== JSON.stringify(defaultValue)) {
        setSelectedValues(defaultValue);
      }
    }, [defaultValue, selectedValues]);
    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        setIsPopoverOpen(true);
      } else if (event.key === "Backspace" && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues];
        newSelectedValues.pop();
        setSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
      }
    };

    const toggleOption = (value: any) => {
      const display = selectedValues.includes(value.first_name && value.last_name)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, `${value.first_name} ${value.last_name}`];
      setSelectedValues(display);
      onValueChange(display);
    };

    const handleClear = () => {
      setSelectedValues([]);
      onValueChange([]);
    };

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev);
    };

    const clearExtraOptions = () => {
      const newSelectedValues = selectedValues.slice(0, maxCount);
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            onClick={handleTogglePopover}
            className={cn(
              "flex w-full p-1 rounded-lg border min-h-12 h-auto items-center justify-between bg-inherit hover:bg-inherit",
              className
            )}
          >
            {selectedValues?.length > 0 ? (
              <div className='flex justify-between items-center w-full'>
                <div className='flex flex-wrap items-center'>
                  {selectedValues?.slice(0, maxCount).map((value) => {
                    const option = options?.find((o) => o.value === value);
                    const IconComponent = option?.icon;
                    return (
                      <Badge
                        key={value}
                        variant='destructive-50'
                        className={cn(
                          "bg-red-50 border text-red-700 border-foreground/1 hover:bg-transparent",
                          isAnimating ? "animate-bounce" : "",
                          multiSelectVariants({ variant, className })
                        )}
                        style={{ animationDuration: `${animation}s` }}
                      >
                        {IconComponent && <IconComponent className='h-4 w-4 mr-2' />}
                        {value}
                        {/* <XCircle
                          className="ml-2 h-4 w-4 cursor-pointer"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleOption(value);
                          }}
                        /> */}
                      </Badge>
                    );
                  })}
                  {selectedValues?.length > maxCount && (
                    <Badge
                      className={cn(
                        "bg-transparent text-red-700 border hover:bg-transparent",
                        isAnimating ? "animate-bounce" : "",
                        multiSelectVariants({ variant, className })
                      )}
                      style={{ animationDuration: `${animation}s` }}
                    >
                      {`+ ${selectedValues?.length - maxCount} more`}
                      <XCircle
                        className='ml-2 h-4 w-4 cursor-pointer'
                        onClick={(event) => {
                          event.stopPropagation();
                          clearExtraOptions();
                        }}
                      />
                    </Badge>
                  )}
                </div>
                <div className='flex items-center justify-between'>
                  <XIcon
                    className='h-4 mx-2 cursor-pointer text-muted-foreground'
                    onClick={(event) => {
                      event.stopPropagation();
                      handleClear();
                    }}
                  />
                  <Separator orientation='vertical' className='flex min-h-6 h-full' />
                  <ChevronDown className='h-4 mx-2 cursor-pointer text-muted-foreground' />
                </div>
              </div>
            ) : (
              <div className='flex items-center justify-between w-full mx-auto'>
                <span className='text-sm font-[400] text-gray-400 mx-3'>{placeholder}</span>
                <ChevronDown className='h-4 cursor-pointer text-muted-foreground mx-2' />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-full p-2 sm:p-4' align='start' onEscapeKeyDown={() => setIsPopoverOpen(false)}>
          <Command>
            <CommandInput2 placeholder='Search...' onKeyDown={handleInputKeyDown} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {/* <CommandItem
                  key="all"
                  onSelect={toggleAll}
                  style={{ pointerEvents: "auto", opacity: 1 }}
                  className="cursor-pointer"
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selectedValues.length === options?.length
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </div>
                  <span>(Select All)</span>
                </CommandItem> */}
                <p className='text-black mb-2'>Recommended Vendors</p>
                {options?.map((option: any) => {
                  // const isSelected = selectedValues.includes(
                  //   option?.User?.first_name && " " && option?.User?.last_name
                  // );
                  return (
                    <CommandItem
                      key={option?.User?.username}
                      onSelect={() => toggleOption(option?.User)}
                      style={{ pointerEvents: "auto", opacity: 1 }}
                      className='flex justify-between items-center gap-4 py-2 rounded-lg cursor-pointer'
                    >
                      <div className='flex gap-5'>
                        <Image
                          src={option?.User?.avatar || "/noavatar.png"}
                          alt='Avatar'
                          width={400}
                          height={400}
                          className='object-cover w-[80px] sm:w-[100px] h-[72px] sm:h-[92px] rounded-xl'
                        />
                        <div className='flex flex-col gap-2'>
                          <p className='text-sm font-medium text-red-700'>{option.categoryName}</p>
                          <h6 className='text-[14px] sm:text-[15px]'>
                            {option.first_name} {option.last_name}
                          </h6>
                          <p className='text-xs sm:text-sm'>
                            {option.state}, {option.country}
                          </p>
                        </div>
                      </div>
                      <span className='flex items-center'>
                        <Star fill='#F48E2F' className='h-4 w-4 text-[#F48E2F] ml-2' />
                        <p className='text-[#F48E2F] text-xs sm:text-sm font-[500] pl-1'>
                          {option?.averageRating || 0}
                        </p>
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <div className='flex items-center justify-between'>
                  {selectedValues.length > 0 && (
                    <>
                      <CommandItem
                        onSelect={handleClear}
                        style={{ pointerEvents: "auto", opacity: 1 }}
                        className='flex-1 justify-center cursor-pointer'
                      >
                        Clear
                      </CommandItem>
                      <Separator orientation='vertical' className='flex min-h-6 h-full' />
                    </>
                  )}
                  <CommandSeparator />
                  <CommandItem
                    onSelect={() => setIsPopoverOpen(false)}
                    style={{ pointerEvents: "auto", opacity: 1 }}
                    className='flex-1 justify-center cursor-pointer '
                  >
                    Close
                  </CommandItem>
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
        {/* {animation > 0 && selectedValues.length > 0 && <WandSparkles className={cn("cursor-pointer my-2 text-foreground bg-background w-3 h-3", isAnimating ? "" : "text-muted-foreground")} onClick={() => setIsAnimating(!isAnimating)} />} */}
      </Popover>
    );
  }
);

MultiSelect.displayName = "MultiSelect";
