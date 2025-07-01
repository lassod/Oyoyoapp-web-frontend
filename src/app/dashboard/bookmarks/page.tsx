"use client";
import React, { useEffect, useState } from "react";
import { Dashboard } from "@/components/ui/containers";
import EventCard from "@/app/components/dashboard/EventCard";
import { useGetUserBookmarks } from "@/hooks/bookmark";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { filterEventsByDate, upcomingFilter } from "@/lib/auth-helper";
import { FaFilter } from "react-icons/fa";

const Bookmarks = () => {
  const [bookMarkedEvents, setBookMarked] = useState([]);
  const { data: bookmarkedEnv, status } = useGetUserBookmarks();
  const [filteredEvents, setFilteredEvents] = useState([]); // Store filtered events
  const [currentPage, setCurrentPage] = useState(1); // Manage current page
  const eventsPerPage = 10;

  // Pagination logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents?.slice(indexOfFirstEvent, indexOfLastEvent); // Get only the events for the current page
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  // Pagination navigation functions
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Handle select change and apply date filter
  const handleSelectChange = (selectedValue: string) => {
    setFilteredEvents(filterEventsByDate(bookMarkedEvents, selectedValue, false, "bookmark")); // Use the external function to filter
  };

  // Set the bookmarked events on initial load
  useEffect(() => {
    if (bookmarkedEnv) {
      setBookMarked(bookmarkedEnv);
      setFilteredEvents(bookmarkedEnv); // Initialize filtered events
    }
  }, [bookmarkedEnv]);

  // Show loading state if data is not yet available
  if (status !== "success") return <SkeletonCard2 />;
  return (
    <Dashboard className='flex flex-col gap-[10px] pb-20 bg-white'>
      <h5>Bookmarks</h5>
      <Select onValueChange={(event) => handleSelectChange(event)}>
        <SelectTrigger className='flex max-w-[180px] gap-3 hover:border-red-700 hover:text-red-700 items-center py-[5px] px-4 rounded-lg cursor-pointer'>
          <FaFilter className='w-4 h-4 cursor-pointer' />
          <SelectValue placeholder='Filter by Date' />
        </SelectTrigger>
        <SelectContent>
          {upcomingFilter.map((item: string) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className='flex flex-col gap-10'>
        <div className='grid my-[25px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          {currentEvents?.length > 0 ? (
            currentEvents.map((item: any) => <EventCard key={item.Event.id} item={item.Event} />)
          ) : (
            <h6>No Bookmarks</h6>
          )}
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={goToPrevPage} isActive={currentPage !== 1} />
            </PaginationItem>
            <PaginationItem>
              <p className='flex text-black items-center justify-center text-sm'>
                Page {currentPage} of {totalPages}
              </p>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext onClick={goToNextPage} isActive={currentPage !== totalPages} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </Dashboard>
  );
};

export default Bookmarks;
