"use client";

import React,{useState} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export type TimePickerProps = {  
  className?: string;  
  selected?: Date | null;  
  onSelect?: (date: Date) => void;  
  disabled?: (date: Date) => boolean;  
  initialFocus?: boolean;  
  show24Hour?: boolean; // New prop to choose between 12-hour and 24-hour format  
};  

const TimePicker: React.FC<TimePickerProps> = ({  
  className,  
  selected,  
  onSelect,  
  disabled,  
  initialFocus,  
  show24Hour = false,  
}) => {  
  const [hours, setHours] = useState(selected ? selected.getHours() : 12);  
  const [minutes, setMinutes] = useState(selected ? selected.getMinutes() : 0);  
  const [isAM, setIsAM] = useState(selected ? selected.getHours() < 12 : true);  

  const handleHourChange = (event: React.ChangeEvent<HTMLSelectElement>) => {  
    setHours(Number(event.target.value));  
  };  

  const handleMinuteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {  
    setMinutes(Number(event.target.value));  
  };  

  const handleAMPMChange = () => {  
    setIsAM(!isAM);  
  };  

  const handleSubmit = () => {  
    const hour = show24Hour ? hours : (isAM ? hours : hours + 12) % 24;  
    const date = new Date();  
    date.setHours(hour, minutes, 0, 0);  
    if (onSelect) {  
      onSelect(date);  
    }  
  };  

  return (  
    <div className="h-10 flex gap-4 items-center px-8 w-full">  
      <select className="border-none w-full" value={show24Hour ? hours : (isAM ? hours : hours % 12)} onChange={handleHourChange}>  
        {Array.from({ length: show24Hour ? 24 : 12 }, (_, i) => (  
          <option key={i} value={i + (show24Hour ? 0 : 1)}>  
            {show24Hour ? i : i === 0 ? 12 : i}  hr
          </option>  
        ))}  
      </select>  
      :  
      <select value={minutes} onChange={handleMinuteChange}>  
        {Array.from({ length: 60 }, (_, i) => (  
          <option key={i} value={i}>  
            {i < 10 ? `0${i}` : i}  secs
          </option>  
        ))}  
      </select>  
      {!show24Hour && (  
        <div>  
          <button onClick={handleAMPMChange}>{isAM ? 'AM' : 'PM'}</button>  
        </div>  
      )}  
      <button onClick={handleSubmit}>Select Time</button>  
    </div>  
  );  
};  

TimePicker.displayName = "TimePicker";

export { Calendar, TimePicker };
