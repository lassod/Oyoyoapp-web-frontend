"use client";
import React, { useEffect, useState, useRef } from "react";
import { Dashboard, DashboardHeader, DashboardHeaderText } from "@/components/ui/containers";
import {
  useDeleteTask,
  useGetAiEvent,
  useUpdateTask,
  usePostTask,
  usePostTaskNote,
  usePostTaskVendor,
  useUpdateTaskNote,
  useDeleteTaskNote,
} from "@/hooks/aievent";
import { SkeletonCard1, SkeletonCard2 } from "@/components/ui/skeleton";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DownloadIcon, Loader2, Mail, MapPin, Phone, Star, Trash2, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import ReactMarkdown from "react-markdown";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput2, CommandItem, CommandList } from "@/components/ui/command";
import { useGetVendors } from "@/hooks/vendors";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useGetCategories } from "@/hooks/categories";
import Oyoyo from "../../../app/components/assets/images/Oyoyo.svg";

const AiEventPlanner = ({ event }: any) => {
  const { data: vendorsData } = useGetVendors();
  const { data: categories } = useGetCategories();
  const { data: initialPlanner, status: eventStatus, refetch, isFetching } = useGetAiEvent(event?.id);
  const [selectedStage, setSelectedStage] = useState<any>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isRefetch, setIsRefetch] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [note, setNote] = useState<any>(null);
  const [noteId, setNoteId] = useState<any>(null);
  const [planner, setPlanner] = useState(initialPlanner || []);
  const [vendors, setVendors] = useState<any>([]);
  const [VendorId, setVendorId] = useState<any>(null);
  const [taskId, setTaskId] = useState<any>(null);
  const [taskIdDel, setTaskIdDel] = useState<any>(null);
  const { mutation: postTask } = usePostTask();
  const { mutation: postTaskVendor } = usePostTaskVendor();
  const { mutation: postTaskNote } = usePostTaskNote();
  const { mutation: deleteTaskNote } = useDeleteTaskNote();
  const { mutation: updateTaskNote } = useUpdateTaskNote();
  const { mutation: deleteTask } = useDeleteTask();
  const { mutation: markCompleted } = useUpdateTask();
  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollableContainerRef.current) {
      scrollableContainerRef.current.lastElementChild?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (isRefetch) {
      refetch();
      setIsRefetch(false);
    }
  }, [isRefetch]);

  useEffect(() => {
    if (selectedStage) {
      const completedTasks = selectedStage?.Task?.filter((task: any) => task.status !== "Open").length;
      const totalTasks = selectedStage?.Task?.length;
      setPercentage(totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);
    }
  }, [selectedStage]);

  useEffect(() => {
    if (initialPlanner) setPlanner(initialPlanner);
  }, [initialPlanner]);

  useEffect(() => {
    if (vendorsData && categories) {
      const enrichedVendors = vendorsData.map((vendor: any) => {
        const category = categories.find((cat: any) => cat.id === vendor.CategoryId);
        return {
          ...vendor,
          categoryName: category ? category.name : "Unknown Category", // Fallback if no category is found
        };
      });
      setVendors(enrichedVendors);
    }
  }, [vendorsData, categories]);

  const totalTasks = planner?.reduce((sum: any, stage: any) => sum + stage?.Task?.length, 0);
  const completedTasks = planner?.reduce(
    (sum: any, stage: any) => sum + stage?.Task.filter((task: any) => task?.status !== "Open").length,
    0
  );
  const incompleteTasks = planner?.reduce(
    (sum: any, stage: any) => sum + stage?.Task?.filter((task: any) => task?.status === "Open").length,
    0
  );

  const totalCompletionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Countdown logic
  useEffect(() => {
    if (!event?.date) return;

    const calculateTimeLeft = () => {
      const eventDate = new Date(event.date).getTime();
      const now = new Date().getTime();
      const difference = eventDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, [event?.date]);

  const plannerData = [
    {
      title: "Attendees",
      value: event?.Event_Attendees?.length || 0,
    },
    {
      title: "Task Completion",
      value: `${totalCompletionPercentage || 0}%`,
    },
    {
      title: "Incomplete tasks",
      value: incompleteTasks || 0,
    },
  ];

  const handleTaskDelete = () => {
    if (!selectedStage || !taskIdDel) return;

    deleteTask.mutate(
      {
        taskId: taskIdDel,
      },
      {
        onSuccess: (res) => {
          setSelectedStage((prev: any) => ({
            ...prev,
            Task: prev.Task.filter((t: any) => t.id !== taskIdDel), // Remove the deleted task
          }));
          setTaskIdDel(null);
          setIsRefetch(true);
        },
      }
    );
  };

  const handleAddTask = () => {
    if (!newTaskTitle || !selectedStage) return;

    postTask.mutate(
      {
        task: newTaskTitle,
        StageId: `${selectedStage.id}`,
      },
      {
        onSuccess: (response) => {
          setSelectedStage((prev: any) => ({
            ...prev,
            Task: [...prev.Task, response.data.data], // Add the new task to Task array
          }));
          setNewTaskTitle("");
          setIsAddTaskModalOpen(false);
          setTimeout(() => {
            scrollToBottom();
          }, 100);
          setIsRefetch(true);
        },
      }
    );
  };

  const handleAddVendor = (item: any) => {
    setIsAddVendorOpen(true);
    setTaskId(item.id);
    setVendorId(item?.Vendor?.id || null); // Set the VendorId or null if it doesn't exist
  };

  const handleSaveNote = () => {
    if (!note) return;
    if (noteId)
      updateTaskNote.mutate(
        { note, taskId, noteId },
        {
          onSuccess: (response) => {
            const updatedPlanner = planner.map((stage: any) => {
              if (stage.id === selectedStage.id) {
                const updatedTasks = stage.Task.map((task: any) =>
                  task.id === taskId ? { ...task, Note: response.data.data } : task
                );
                return { ...stage, Task: updatedTasks };
              }
              return stage;
            });

            setPlanner(updatedPlanner);
            setSelectedStage(updatedPlanner.find((stage: any) => stage.id === selectedStage.id));
            setNote("");
            setNoteId(null);
            setIsRefetch(true);
            setTaskId(false);
          },
        }
      );
    else
      postTaskNote.mutate(
        { note, taskId },
        {
          onSuccess: (response) => {
            setSelectedStage((prev: any) => {
              return {
                ...prev,
                Task: prev.Task.map((t: any) => (t.id === taskId ? { ...t, Note: response.data.data } : t)),
              };
            });
            setNote("");
            setNoteId(null);
            setIsRefetch(true);
            setTaskId(false);
          },
        }
      );
  };

  const handleDeleteNote = () => {
    if (!taskId || !noteId) return;
    deleteTaskNote.mutate(
      { taskId, noteId },
      {
        onSuccess: (response) => {
          setSelectedStage((prev: any) => {
            return {
              ...prev,
              Task: prev.Task.map((t: any) => (t.id === taskId ? { ...t, Note: null } : t)),
            };
          });
          setNote("");
          setNoteId(null);
          setIsRefetch(true);
          setTaskId(null);
        },
      }
    );
  };

  const handleSaveVendor = () => {
    if (!VendorId) return;

    postTaskVendor.mutate(
      { VendorId, taskId },
      {
        onSuccess: (response) => {
          // Update the planner and selectedStage state
          // const updatedPlanner = planner.map((stage: any) => {
          //   if (stage.id === selectedStage.id) {
          //     const updatedTasks = stage.Task.map((task: any) =>
          //       task.id === taskId ? { ...task, Vendor: response.data.data } : task
          //     );
          //     return { ...stage, Task: updatedTasks };
          //   }
          //   return stage;
          // });
          // setPlanner(updatedPlanner);
          // setSelectedStage(updatedPlanner.find((stage: any) => stage.id === selectedStage.id));
          // setIsAddVendorOpen(false);
        },
      }
    );
  };

  const handleCheckboxChange = (taskId: number, stageId: number) => {
    const updatedPlanner = planner.map((stage: any) => {
      if (stage.id === stageId) {
        const updatedTasks = stage.Task.map((task: any) => {
          if (task.id === taskId && task.status === "Open") {
            markCompleted.mutate(
              { taskId, status: "Pending" },
              {
                onSuccess: (res) => {
                  setSelectedStage((prev: any) => {
                    return {
                      ...prev,
                      Task: prev.Task.map((t: any) =>
                        t.id === res.data.data.id ? { ...t, status: res.data.data.status } : t
                      ),
                    };
                  });
                  setIsRefetch(true);
                },
              }
            );
            return { ...task, status: "Pending" };
          } else if (task.id === taskId && task.status !== "Open") {
            markCompleted.mutate(
              { taskId, status: "Open" },
              {
                onSuccess: (res) => {
                  setSelectedStage((prev: any) => {
                    return {
                      ...prev,
                      Task: prev.Task.map((t: any) =>
                        t.id === res.data.data.id ? { ...t, status: res.data.data.status } : t
                      ),
                    };
                  });
                  setIsRefetch(true);
                },
              }
            );
            return { ...task, status: "Open" };
          } else if (task.status === "Open") {
            return { ...task, status: "Open" };
          }
          return task;
        });
        return { ...stage, Task: updatedTasks };
      }
      return stage;
    });

    // Update planner and selectedStage states
    setPlanner(updatedPlanner);
    setSelectedStage(updatedPlanner.find((stage: any) => stage.id === stageId));
  };

  if (eventStatus !== "success") return <SkeletonCard2 />;
  return (
    <>
      <DashboardHeader>
        <DashboardHeaderText>AI Event Planner</DashboardHeaderText>
        <Button className='mr-0' onClick={() => setIsOpen(true)}>
          View guests
        </Button>
      </DashboardHeader>
      <Dashboard className='mx-auto bg-white mt-20'>
        <div className='max-w-[896px] w-full grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3'>
          {plannerData.map((item: any) => (
            <div className='border flex flex-col gap-1 rounded-lg border-gray-200 p-4' key={item.title}>
              <p>{item.title}</p>
              <h5>{item?.value}</h5>
            </div>
          ))}
        </div>
        <div className='border-t mt-5 flex flex-col gap-1 rounded-lg border-gray-200 pt-5 p-4'>
          <p>Event Countdown</p>
          <h5>
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </h5>
        </div>
        {isFetching ? (
          <SkeletonCard1 />
        ) : (
          <div className='max-w-[1096px] w-full grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3'>
            {planner.map((item: any) => {
              const completedTasks = item.Task.filter((task: any) => task.status !== "Open").length;
              const totalTasks = item.Task.length;
              const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

              return (
                <div
                  className='grid border cursor-pointer hover:border-black rounded-lg border-gray-200 p-3 grid-cols-[79px,1fr] gap-4'
                  key={item?.stage}
                  onClick={() => setSelectedStage({ ...item, completionPercentage })}
                >
                  <Image
                    src={event?.media[0] || Oyoyo}
                    alt='Planner'
                    className='object-cover h-[92px] w-[79px] rounded-xl'
                    width={300}
                    height={399}
                  />
                  <div className='flex flex-col justify-between h-full b'>
                    <span>
                      <p className='text-red-700 font-semibold'>{completionPercentage}% COMPLETED</p>
                      <ReactMarkdown>{item.stage.replace(/Project Milestone Stage \d+: /, "")}</ReactMarkdown>
                    </span>
                    <p>
                      {completedTasks}/{totalTasks}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Dashboard>

      {selectedStage && (
        <AlertDialog open onOpenChange={(open) => setSelectedStage(open)}>
          <AlertDialogContent className='bg-transparent left-[50%] top-[50%] px-4 !overflow-hidden'>
            <div className='div p-4 sm:px-6 sm:pt-5 sm:pb-10 bg-white'>
              <AlertDialogHeader className='flex-row sticky top-[20px] justify-between gap-4'>
                <div className='flex gap-5 items-center'>
                  <X onClick={() => setSelectedStage(null)} className='w-5 h-5 cursor-pointer hover:text-red-700' />
                  <h6>Pre-event Planning</h6>
                </div>
                <h6>{percentage || 0}%</h6>
              </AlertDialogHeader>
              {/* <Slider value={percentage} /> */}

              <div
                style={{ maxHeight: "400px", overflowY: "auto" }}
                ref={scrollableContainerRef}
                className='flex overflow-auto flex-col gap-4 pr-2'
              >
                <div className='flex justify-end mt-10 mb-5'>
                  <div className='flex gap-3 items-center'>
                    <Button variant={"secondary"} onClick={() => setIsAddTaskModalOpen(true)} className='mr-0'>
                      Add Task
                    </Button>
                  </div>
                </div>
                {selectedStage?.Task?.map((item: any, index: number) => (
                  <div
                    key={index}
                    className='flex gap-4 flex-col p-3 border hover:border-black rounded-xl border-gray-200'
                  >
                    <div className='grid grid-cols-[10px,1fr] gap-5 w-full justify-between'>
                      <Checkbox
                        className='mt-1'
                        checked={item.status !== "Open"} // Checkbox is checked if the task is not "Open"
                        onCheckedChange={() => handleCheckboxChange(item.id, selectedStage.id)}
                        // disabled={item.status !== "Open"} // Disable the checkbox if the task is not "Open"
                      />
                      <div className='grid grid-cols-[1fr,10px] gap-5'>
                        <p>{item?.task}</p>
                        <Trash2
                          onClick={() => setTaskIdDel(item.id)}
                          className='text-red-600 cursor-pointer w-5 h-5 hover:text-black'
                        />
                      </div>
                    </div>
                    {item?.Vendor && (
                      <div className='flex p-2 w-full justify-between border rounded-lg gap-3 items-center'>
                        <div className='flex gap-5'>
                          <Image
                            src={item?.Vendor?.User?.avatar || "/noavatar.png"}
                            alt='Avatar'
                            width={400}
                            height={400}
                            className='object-cover w-[100px] h-[92px] rounded-xl'
                          />
                          <div className='flex flex-col gap-2'>
                            <p className='text-sm font-medium text-red-700'>{item?.Vendor?.categoryName}</p>
                            <h6 className='text-[14px] sm:text-[15px]'>
                              {item?.Vendor?.first_name} {item?.Vendor?.last_name}
                            </h6>
                            <p className='text-xs sm:text-sm'>
                              {item?.Vendor?.state}, {item?.Vendor?.country}
                            </p>
                          </div>
                        </div>
                        <span className='flex items-center'>
                          <Star fill='#F48E2F' className='h-4 w-4 text-[#F48E2F] ml-2' />
                          <p className='text-[#F48E2F] text-xs sm:text-sm font-[500] pl-1'>
                            {item?.Vendor?.averageRating || 0}
                          </p>
                        </span>
                      </div>
                    )}
                    {item?.Note && (
                      <div className='flex flex-col gap-1'>
                        <p className='text-black font-medium leading-normal'>Note</p>
                        <p className='text-sm'>{item?.Note?.note}</p>
                      </div>
                    )}
                    <div className='flex justify-center gap-3 items-center'>
                      <Button
                        className='m-0'
                        variant={"secondary"}
                        onClick={() => {
                          setTaskId(item.id);
                          if (item?.Note) {
                            setNote(item?.Note?.note);
                            setNoteId(item?.Note?.id);
                          }
                        }}
                      >
                        {item?.Note ? "Edit Note" : "Add Note"}
                      </Button>
                      <Button
                        onClick={() => handleAddVendor(item)}
                        className='m-0 bg-red-50 hover:text-white text-red-700'
                      >
                        {item?.Vendor ? "Change vendor" : "Add vendor"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {taskId && (
        <AlertDialog open onOpenChange={() => setTaskId(null)}>
          <AlertDialogContent className='bg-transparent left-[50%] top-[50%] px-4'>
            <div className='div p-4 sm:px-6 sm:py-5 bg-white'>
              <AlertDialogHeader className='flex-row mb-4 justify-between gap-4'>
                <h6>{noteId ? "Edit" : "Add"} Note</h6>
              </AlertDialogHeader>

              <Label className='mt-5'>Note</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className='mt-1'
                placeholder='Enter Note'
                required
              />

              <div className='flex justify-end mt-8 mb-5'>
                <div className='flex gap-3 items-center'>
                  {noteId && (
                    <>
                      {deleteTaskNote.isPending ? (
                        <Loader2 className='w-4 h-4 animate-spin' />
                      ) : (
                        <Trash2
                          onClick={handleDeleteNote}
                          className='w-5 h-5 text-red-700 hover:text-black cursor-pointer'
                        />
                      )}
                    </>
                  )}
                  <Button
                    variant={"secondary"}
                    onClick={() => {
                      setNote("");
                      setNoteId(null);
                      setTaskId(false);
                    }}
                    className='mr-0'
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={postTaskNote.isPending || updateTaskNote.isPending || !note}
                    onClick={handleSaveNote}
                    className='mr-0'
                  >
                    {postTaskNote.isPending || updateTaskNote.isPending ? (
                      <Loader2 className='w-4 h-4 animate-spin' />
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {isAddTaskModalOpen && (
        <AlertDialog open onOpenChange={(open) => setIsAddTaskModalOpen(open)}>
          <AlertDialogContent className='bg-transparent left-[50%] top-[50%] px-4'>
            <div className='div p-4 sm:px-6 sm:py-5 bg-white'>
              <AlertDialogHeader className='flex-row mb-4 justify-between gap-4'>
                <h6>Add Task</h6>
              </AlertDialogHeader>

              <Label className='mt-5'>Task title</Label>
              <Input
                type='text'
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className='mt-1'
                placeholder='Enter Title'
                required
              />

              <div className='flex justify-end mt-8 mb-5'>
                <div className='flex gap-3 items-center'>
                  <Button variant={"secondary"} onClick={() => setIsAddTaskModalOpen(false)} className='mr-0'>
                    Cancel
                  </Button>
                  <Button disabled={postTask.isPending} onClick={handleAddTask} className='mr-0'>
                    {postTask.isPending ? <Loader2 className='w-4 h-4 animate-spin' /> : "Submit"}
                  </Button>
                </div>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {taskIdDel && (
        <AlertDialog open onOpenChange={() => setTaskIdDel(null)}>
          <AlertDialogContent className='left-[50%] top-[50%]'>
            <div className='flex mt-6 justify-between items-center'>
              <h6>Delete Task</h6>
              <AlertDialogCancel>
                <X className='w-5 h-5 cursor-pointer hover:text-red-700' />
              </AlertDialogCancel>
            </div>
            <p>Are you sure you want to delete this task?</p>
            <AlertDialogFooter>
              <Button disabled={deleteTask.isPending} onClick={handleTaskDelete} className='w-full mt-4'>
                {deleteTask.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : "Delete"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {isAddVendorOpen && (
        <AlertDialog open onOpenChange={(open) => setIsAddVendorOpen(open)}>
          <AlertDialogContent className='bg-transparent left-[50%] top-[50%] px-4'>
            <div className='div p-4 sm:px-6 sm:py-5 bg-white'>
              <AlertDialogHeader className='flex-row justify-between gap-4'>
                <div className='flex gap-5 items-center'>
                  <X onClick={() => setIsAddVendorOpen(false)} className='w-5 h-5 cursor-pointer hover:text-red-700' />
                  <h6>Add vendor</h6>
                </div>
              </AlertDialogHeader>

              <div className='flex justify-end my-5'>
                <Button disabled={!VendorId} onClick={handleSaveVendor} className='mr-0'>
                  {postTaskVendor.isPending ? <Loader2 className='w-4 h-4 animate-spin' /> : "Save changes"}
                </Button>
              </div>

              <Command>
                <CommandInput2 placeholder='Search vendors by name...' />
                <CommandList>
                  <CommandEmpty>No vendor found.</CommandEmpty>
                  <CommandGroup>
                    <p className='text-black'>Recommended Vendors</p>
                    {vendors.map((vendor: any) => (
                      <CommandItem
                        className={cn(
                          "flex justify-between p-2 mt-2 rounded-lg transition-all",
                          vendor.id === VendorId && "border border-red-700"
                        )}
                        value={vendor.id}
                        key={vendor.id}
                        onSelect={() => setVendorId(vendor.id)}
                      >
                        <div className='flex gap-5'>
                          <Image
                            src={vendor?.User?.avatar || "/noavatar.png"}
                            alt='Avatar'
                            width={400}
                            height={400}
                            className='object-cover w-[100px] h-[92px] rounded-xl'
                          />
                          <div className='flex flex-col gap-2'>
                            <p className='text-sm font-medium text-red-700'>{vendor.categoryName}</p>
                            <h6 className='text-[14px] sm:text-[15px]'>
                              {vendor.first_name} {vendor.last_name}
                            </h6>
                            <p className='text-xs sm:text-sm'>
                              {vendor.state}, {vendor.country}
                            </p>
                          </div>
                        </div>
                        <span className='flex items-center'>
                          <Star fill='#F48E2F' className='h-4 w-4 text-[#F48E2F] ml-2' />
                          <p className='text-[#F48E2F] text-xs sm:text-sm font-[500] pl-1'>
                            {vendor?.averageRating || 0}
                          </p>
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {isOpen && <ViewGuest data={event?.Event_Attendees} isOpen={isOpen} setIsOpen={setIsOpen} />}
    </>
  );
};

export default AiEventPlanner;

export const ViewGuest = ({ data, isOpen, setIsOpen }: any) => {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const handleDownloadCSV = () => {
    const csvRows = [];
    const headers = ["Full Name", "Email", "Phone", "State", "Country"];
    csvRows.push(headers.join(",")); // Add headers

    data.forEach((item: any) => {
      const user = item.User;
      const fullname = `${user?.first_name} ${user?.last_name}` || item?.orderItem?.fullName;
      const row = [
        fullname || "--",
        user?.email || item?.orderItem?.email || "--",
        user?.phone || item?.orderItem?.phoneNumber || "--",
        user?.state || "--",
        user?.country || "--",
      ];
      csvRows.push(row.join(","));
    });

    // Convert to CSV format
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    // Create a link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = "Registered_Guests.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className='bg-transparent left-[50%] top-[50%] px-4'>
        <div ref={contentRef} className='px-4 sm:px-6 bg-white'>
          <AlertDialogHeader className='flex-row justify-between gap-4 sticky py-5 bg-white top-0'>
            <div className='flex gap-5'>
              <AlertDialogCancel>
                <X className='w-5 h-5 cursor-pointer hover:text-red-700' />
              </AlertDialogCancel>
              <h6>Registered Guests</h6>
            </div>
            <DownloadIcon className='w-5 h-5 cursor-pointer hover:text-red-700' onClick={handleDownloadCSV} />
          </AlertDialogHeader>
          <p className='text-black mt-5 mb-3'>Total Registered Guests {data?.length}</p>

          <div className='flex flex-col gap-4'>
            {data?.map((guest: any, index: number) => (
              <div key={index} className='flex gap-4 pt-7 pb-4 border-b border-gray-200'>
                <Image
                  src={guest?.User?.avatar || "/noavatar.png"}
                  alt='Avatar'
                  width={400}
                  height={500}
                  className='object-cover h-[64px] w-[66px] rounded-full'
                />
                <div className='flex flex-col'>
                  <p className='text-black font-semibold'>
                    {guest?.User?.first_name || guest?.orderItem?.fullName} {guest?.User?.last_name}
                  </p>
                  <p className='flex gap-2 items-center'>
                    <Mail className='text-red-700 h-4 w-4' />
                    {guest?.User?.email || guest?.orderItem?.email}
                  </p>
                  <p className='flex gap-2 items-center'>
                    <Phone className='text-red-700 h-4 w-4' />
                    {guest?.User?.phone || guest?.orderItem?.phoneNumber || "--"}
                  </p>
                  <p className='flex gap-2 items-center'>
                    <MapPin className='text-red-700 h-4 w-4' />
                    {guest?.User?.state} {guest?.User?.country || "--"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
