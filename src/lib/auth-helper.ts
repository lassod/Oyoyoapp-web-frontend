import axios from "axios";
import { addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { animateScroll as scroll } from "react-scroll";

export const generateReference = `txn_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
export const upcomingFilter = ["All Events", "Today", "Tomorrow", "This Week", "This Month", "Next Month"];

export const waitForThreeSeconds = () => new Promise((resolve) => setTimeout(resolve, 3000));

export const isToday = (date: string) => {
  const today = new Date();
  const eventDate = new Date(date);
  return today.toDateString() === eventDate.toDateString();
};

export const isTomorrow = (date: string) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const eventDate = new Date(date);
  return tomorrow.toDateString() === eventDate.toDateString();
};

export const isThisWeek = (date: string) => {
  const today = new Date();
  const eventDate = new Date(date);
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  const endOfWeek = new Date(today);

  startOfWeek.setDate(today.getDate() - dayOfWeek);
  endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));

  return eventDate >= startOfWeek && eventDate <= endOfWeek;
};

export const isThisMonth = (date: string) => {
  const today = new Date();
  const eventDate = new Date(date);
  return today.getMonth() === eventDate.getMonth() && today.getFullYear() === eventDate.getFullYear();
};

export const isNextMonth = (date: string) => {
  const today = new Date();
  const eventDate = new Date(date);
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);
  return nextMonth.getMonth() === eventDate.getMonth() && nextMonth.getFullYear() === eventDate.getFullYear();
};

export function formatDate(dateString: any) {
  const date = new Date(dateString);

  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();

  const suffix = (day: any) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return `${day}${suffix(day)} ${month} ${year}`;
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);

  let hours = date.getHours();
  const minutes = date.getMinutes();

  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;

  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  return `${hours}:${formattedMinutes} ${ampm}`;
}

export const formatDatetoTime = (data: any) => {
  const date = new Date(data);
  const africanTimeOptions: any = {
    timeZone: "Africa/Lagos",
    hour12: true,
    hour: "numeric",
    minute: "numeric",
  };

  const timeInAfrica = new Intl.DateTimeFormat("en-GB", africanTimeOptions).format(date);

  const dayOfWeek = new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(date);
  return `${dayOfWeek} ${timeInAfrica}`;
};

export function formatDate2(dateString: string, use24HourFormat: boolean = false): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" }); // e.g., Jan, Feb
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  if (use24HourFormat) {
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    return `${month} ${day}, ${year} at ${formattedHours}:${formattedMinutes}`;
  } else {
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${month} ${day}, ${year} at ${formattedHours}:${formattedMinutes} ${ampm}`;
  }
}

export const shortenText = (text: string, maxLength: number) => {
  if (text?.length > maxLength || 0) return `${text?.substring(0, maxLength)}...`;
  return text;
};

export const exportToCSV = (tableData: any[], filename: string) => {
  const headers = Object.keys(tableData[0]);
  const csvRows = [
    headers.join(","),
    ...tableData.map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(",")),
  ];

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const languages = [
  {
    item: "English (UK)",
  },
];

export const filterEventsByDate = (events: any, range: string, isPast = false, type = "Event") => {
  const now = new Date();
  let startDate: Date, endDate: Date;

  switch (range) {
    case "Today":
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    case "Tomorrow":
      startDate = addDays(now, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = addDays(now, 1);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "This Week":
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
      break;
    case "Next Week":
      startDate = startOfWeek(addDays(now, 7), { weekStartsOn: 1 });
      endDate = endOfWeek(addDays(now, 7), { weekStartsOn: 1 });
      break;
    case "This Month":
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
    case "Next Month":
      startDate = startOfMonth(addDays(now, 30));
      endDate = endOfMonth(addDays(now, 30));
      break;
    case "Next Year":
      startDate = startOfYear(addDays(now, 365));
      endDate = endOfYear(addDays(now, 365));
      break;
    case "Yesterday":
      startDate = subDays(now, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = subDays(now, 1);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "Last Week":
      startDate = startOfWeek(subDays(now, 7), { weekStartsOn: 1 });
      endDate = endOfWeek(subDays(now, 7), { weekStartsOn: 1 });
      break;
    case "Last Month":
      startDate = startOfMonth(subDays(now, 30));
      endDate = endOfMonth(subDays(now, 30));
      break;
    case "Last Year":
      startDate = startOfYear(subDays(now, 365));
      endDate = endOfYear(subDays(now, 365));
      break;
    default:
      return events;
  }

  const filteredEvents = events.filter((event: any) => {
    let eventDate;
    if (type === "bookmark") eventDate = new Date(event.Event.date);
    else eventDate = new Date(event.date);
    return isPast ? eventDate <= endDate && eventDate >= startDate : eventDate >= startDate && eventDate <= endDate;
  });

  return filteredEvents;
};

export const calculateEventDurationInDays = (event: any) => {
  const start = new Date(event.date);
  const end = new Date(event.endTime);

  const timeDifference = end.getTime() - start.getTime();

  const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

  return Math.round(daysDifference);
};

export const goToPrevPage = (currentPage: number, setPage: Function, setFilters: Function) => {
  if (currentPage > 1) {
    const newPage = currentPage - 1;
    setPage(newPage);
    setFilters((prevFilters: any) => ({ ...prevFilters, page: newPage }));
  }
};

export const goToNextPage = (currentPage: number, totalPages: number, setPage: Function, setFilters: Function) => {
  if (currentPage < totalPages) {
    const newPage = currentPage + 1;
    setPage(newPage);
    setFilters((prevFilters: any) => ({ ...prevFilters, page: newPage }));
  }
};

export const scrollToTop = () => scroll.scrollToTop();

export const scrollToBottom = () => scroll.scrollToBottom();

export const fetchFileFromUrl = async (url: string): Promise<File | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const filename = url.split("/").pop()?.split("?")[0] || "file";
    const file = new File([blob], filename, { type: blob.type });
    return file;
  } catch (error) {
    console.error(`Error fetching file from URL: ${url}`, error);
    return null;
  }
};

export const handleShare = async (event: any, type = "event") => {
  if (!event) return;
  console.log(event);
  try {
    if (navigator.canShare && navigator.canShare({ url: window.location.pathname })) {
      if (type === "stream")
        await navigator.share({ url: `${process.env.NEXT_PUBLIC_CLIENT_URL}/stream/${event?.id}` });
      else
        await navigator.share({
          url: `${process.env.NEXT_PUBLIC_CLIENT_URL}/guest/${event?.id}`,
        });
    }
  } catch (error) {
    console.error("Text sharing failed:", error);
  }
};

export const convertContentToMilestones = (content: string) => {
  try {
    const lines = content.split("\n");
    const milestones = [];
    let currentStage: any = null;
    let tasks: any = [];

    lines.forEach((line) => {
      line = line.trim();

      if (line.startsWith("####")) {
        if (currentStage && tasks.length > 0) {
          milestones.push({ stage: currentStage, tasks });
        }

        currentStage = line.replace("####", "").trim();
        tasks = [];
      } else if (line.startsWith("-")) {
        tasks.push(line.replace("-", "").trim());
      }
    });

    if (currentStage && tasks.length > 0) {
      milestones.push({ stage: currentStage, tasks });
    }

    return milestones;
  } catch (error) {
    console.error("Error converting content to milestones:", error);
    return [
      {
        stage: "Error",
        tasks: ["Failed to process the content."],
      },
    ];
  }
};

export const handleTicketCount = (adjustment: number, value: number, setValue: any) =>
  setValue(Math.max(0, Math.min(400, value + adjustment)));

export const detectCurrency = async (setCurrency: any) => {
  try {
    const response = await axios.get("https://ipinfo.io/json?token=91bf24b0f3206d");
    const countryCode = response.data.country;

    let detectedCurrency = "USD";

    switch (countryCode) {
      case "GB":
      case "IM":
      case "JE":
      case "GG":
        detectedCurrency = "GBP";
        break;
      case "NG":
        detectedCurrency = "NGN";
        break;
    }

    const params = new URLSearchParams(window.location.search);
    const savedCurrency = params.get("currency");

    if (!savedCurrency) {
      params.set("currency", detectedCurrency);
      window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
      setCurrency(detectedCurrency);
    } else {
      setCurrency(savedCurrency);
    }
  } catch (error) {
    console.error("Failed to fetch user location:", error);
    setCurrency("USD");
  }
};

export const handleShare2 = async (url: string) => {
  if (!url) return;
  try {
    if (navigator.canShare && navigator.canShare({ url })) {
      await navigator.share({
        url,
      });
    }
  } catch (error) {
    console.error("Text sharing failed:", error);
  }
};
