"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { formSchemaEditTables, formGuest, formAddTables } from "@/app/components/schema/Forms";
import { Dashboard, DashboardHeader, DashboardHeaderText } from "@/components/ui/containers";
import {
  useAddTable,
  useDeleteTable,
  useEditTable,
  useGetEventTableArrangements,
  usePostTableArrangement,
  useUpdateGuest,
} from "@/hooks/table-arrangement";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { AlertTriangle, Check, ChevronDown, Edit2, Loader2, Plus, PlusCircle, Trash2, XCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Empty from "@/components/assets/images/dashboard/empty.svg";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ViewGuest } from "./AiEventPlanner";

const TableArrangement = ({ event }: any) => {
  const { mutation } = usePostTableArrangement();
  const { data: tableArrangements, status } = useGetEventTableArrangements(event?.id);
  const [table, setTable] = useState<any>(null);
  const [tables, setTables] = useState<any>([]);
  const [isGuest, setIsGuest] = useState(false);
  const [isTable, setIsTable] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [tableId, setTableId] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (tableArrangements?.data?.Tables?.length) setTables(tableArrangements.data.Tables);
  }, [tableArrangements]);

  const form = useForm<z.infer<typeof formSchemaEditTables>>({
    resolver: zodResolver(formSchemaEditTables),
  });

  const onSubmit = async (values: z.infer<typeof formSchemaEditTables>) => {
    mutation.mutate(values, {
      onSuccess: () => (window.location.href = "table-arrangement"),
    });
  };

  if (status !== "success") return <SkeletonCard2 />;
  return (
    <>
      <DashboardHeader>
        <DashboardHeaderText>Seating plans</DashboardHeaderText>
      </DashboardHeader>
      <Dashboard className='mx-auto bg-white mt-20'>
        <div className='max-w-[596px] mx-auto w-full'>
          <h6 className='text-black font-semibold'>Add Tables</h6>
          <p className='border-b border-gray-200 pt-1 pb-2'>Kindly fill the following form</p>

          <Form {...form}>
            <form
              className='bg-white mt-4 flex flex-col gap-3 shadow-md p-5 rounded-lg'
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <Accordion type='single' collapsible>
                {tables.length > 0 ? (
                  tables.map((table: any, index: number) => (
                    <AccordionItem
                      className='border rounded-lg border-gray-200 mb-4 p-3'
                      value={table.tableId.toString()}
                      key={table.tableId}
                    >
                      <AccordionTrigger className='relative items-start'>
                        <div className='flex flex-col'>
                          <p className='text-black font-semibold'>Table {index + 1}</p>
                          <h6 className='text-black font-semibold text-lg'>{table.label || "No Name"}</h6>
                          <ul className='ml-6 mt-2 list-disc text-sm text-gray-500'>
                            <div className='flex gap-2'>
                              <li>{table?.guests?.length || 0} Guests</li>
                              <Button onClick={() => setIsOpen(true)} className='h-5 text-xs !px-4'>
                                View guests
                              </Button>
                            </div>
                            <li>{table?.numOfSeats || 0} Seats</li>
                          </ul>
                        </div>
                        <p className='sm:text-sm text-xs font-normal absolute right-[20px] text-red-700'>
                          Edit table details
                        </p>
                      </AccordionTrigger>
                      <AccordionContent className='mt-4 flex flex-col gap-4'>
                        <div className='flex justify-between mt-3'>
                          <button
                            onClick={() => {
                              setTable(table);
                              setIsGuest(true);
                            }}
                            className='flex items-center gap-2 text-red-700 hover:text-black'
                          >
                            <PlusCircle className='w-5 h-5' />
                            Create Guest List
                          </button>
                          <div className='flex gap-2 items-center'>
                            <Edit2
                              onClick={() => {
                                setIsTable(true);
                                setIsEdit(true);
                                setTable(table);
                              }}
                              className='hover:text-red-700 cursor-pointer w-5 h-5 text-black'
                            />
                            <Trash2
                              onClick={() => setTableId(table.tableId)}
                              className='text-red-700 cursor-pointer w-5 h-5 hover:text-black'
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))
                ) : (
                  <div className='flex flex-col gap-2 justify-center items-center my-5'>
                    <Image src={Empty} alt='Empty' className='w-20 h-20' />
                    <p className='text-gray-500'>No tables available</p>
                  </div>
                )}
              </Accordion>
              <Button variant={"secondary"} className='gap-2 ml-0' onClick={() => setIsTable(true)}>
                <PlusCircle className='w-5 h-5' />
                Add table
              </Button>
            </form>
          </Form>
        </div>
      </Dashboard>

      {isTable && (
        <AlertDialog open onOpenChange={setIsTable}>
          <AlertDialogContent>
            <AddTable
              table={table}
              setTable={setTable}
              isEdit={isEdit}
              setTables={setTables}
              setIsTable={setIsTable}
              setIsEdit={setIsEdit}
              tables={tables}
              id={tableArrangements?.data?.id}
            />
          </AlertDialogContent>
        </AlertDialog>
      )}
      {isGuest && (
        <AlertDialog open onOpenChange={setIsGuest}>
          <AlertDialogContent>
            <CreateGuest data={event?.Event_Attendees} table={table} />
          </AlertDialogContent>
        </AlertDialog>
      )}
      {tableId && (
        <AlertDialog open onOpenChange={() => setTableId(null)}>
          <AlertDialogContent>
            <DeleteTable
              tableId={tableId}
              seatArrangementId={tableArrangements?.data?.id}
              setTables={setTables}
              setTableId={setTableId}
            />
          </AlertDialogContent>
        </AlertDialog>
      )}
      {isOpen && <ViewGuest data={event?.Event_Attendees} isOpen={isOpen} setIsOpen={setIsOpen} />}
    </>
  );
};

export default TableArrangement;

const AddTable = ({ id, table, tables, setTable, setTables, setIsTable, isEdit, setIsEdit }: any) => {
  const { mutation } = useAddTable();
  const { mutation: editTable } = useEditTable();
  const [isOpenPosition, setIsOpenPosition] = useState(false);

  useEffect(() => {
    if (table)
      form.reset({
        numOfSeats: table?.numOfSeats?.toString() || "",
        position: table?.position || "",
        Category: table?.Category || "",
        label: table?.label || "",
      });
  }, [table]);

  const form = useForm<z.infer<typeof formAddTables>>({
    resolver: zodResolver(formAddTables),
  });

  const onSubmit = (values: z.infer<typeof formAddTables>) => {
    if (isEdit) editTable.mutate({ ...values, numOfSeats: parseInt(values.numOfSeats), id: table?.tableId });
    else
      mutation.mutate(
        { ...values, numOfSeats: parseInt(values.numOfSeats), id },
        {
          onSuccess: (res) => {
            console.log(res.data.data.Tables);
            setTables(res.data.data.Tables);
            setIsTable(false);
            setIsEdit(false);
            setTable(null);
          },
        }
      );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-3'>
        <div className='flex mt-4 justify-between items-center'>
          <h6>{isEdit ? "Edit" : "Add"} Table</h6>
          <XCircle
            onClick={() => {
              setIsTable(false);
              setIsEdit(false);
              setTable(null);
            }}
            className='hover:text-red-600'
          />
        </div>

        <FormField
          control={form.control}
          name='label'
          render={({ field }) => (
            <FormItem>
              <FormLabel>label</FormLabel>
              <Input {...field} placeholder='Enter table name' />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='numOfSeats'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Seats</FormLabel>
              <Input {...field} placeholder='5' />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='Category'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className={cn(!field.value && "text-gray-400")}>
                  <SelectValue placeholder={field.value || "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category: string, index: number) => (
                    <SelectItem value={category} key={index}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='position'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position</FormLabel>
              <Popover open={isOpenPosition} onOpenChange={setIsOpenPosition}>
                <PopoverTrigger asChild>
                  <Button variant='combobox'>
                    {field.value
                      ? positions.find((pos) => pos.value === field.value)?.label || "Select position"
                      : "Select position"}
                    <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-full p-0'>
                  <Command>
                    <CommandInput placeholder='Search positions...' />
                    <CommandList>
                      <CommandEmpty>No position found.</CommandEmpty>
                      <CommandGroup>
                        {positions.map((item) => {
                          const isSelected = tables.some((table: any) => table.position === item.value);
                          return (
                            <CommandItem
                              key={item.value}
                              value={item.value}
                              disabled={isSelected} // Disable if already selected
                              className={isSelected ? "opacity-50 cursor-not-allowed" : ""}
                              onSelect={() => {
                                if (!isSelected) {
                                  form.setValue("position", item.value);
                                  setIsOpenPosition(false);
                                }
                              }}
                            >
                              <Check
                                className={cn("mr-2 h-4 w-4", item.value === field.value ? "opacity-100" : "opacity-0")}
                              />
                              {item.label}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <AlertDialogFooter>
          <Button className='w-full mt-4' disabled={mutation.isPending || editTable.isPending}>
            {mutation.isPending || editTable.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : "Proceed"}
          </Button>
        </AlertDialogFooter>
      </form>
    </Form>
  );
};

const CreateGuest = ({ data, table }: any) => {
  const { mutation } = useUpdateGuest();
  const [isOpenGuest, setIsOpenGuest] = useState(false);
  const [guestId, setGuestId] = useState(0);
  console.log(data);
  console.log(table);

  const onSubmit = () => mutation.mutate({ guestId, id: table?.tableId });

  const form = useForm<z.infer<typeof formGuest>>({
    resolver: zodResolver(formGuest),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-3'>
        <div className='flex mt-4 justify-between items-center'>
          <h6>Add Guest</h6>
          <AlertDialogCancel>
            <XCircle className='hover:text-red-600' />
          </AlertDialogCancel>
        </div>

        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem className='mt-5'>
              <Popover open={isOpenGuest} onOpenChange={setIsOpenGuest}>
                <PopoverTrigger asChild>
                  <Button variant='combobox'>
                    {field.value ? field.value : "Select Guest Name"}
                    <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-full p-0'>
                  <Command>
                    <CommandInput placeholder='Search guest...' />
                    <CommandList>
                      <CommandEmpty>No guest found.</CommandEmpty>
                      <CommandGroup>
                        {data?.map((item: any) => (
                          <CommandItem
                            value={item.User.first_name}
                            key={item.id}
                            onSelect={() => {
                              form.setValue("name", `${item.User.first_name} ${item.User.last_name}`);
                              setGuestId(item.id);
                              setIsOpenGuest(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", item.id === guestId ? "opacity-100" : "opacity-0")} />
                            <div className='w-full grid grid-cols-[32px,1fr] gap-2'>
                              <Image
                                alt='Avatar'
                                width={300}
                                height={300}
                                src={item?.User?.avatar || "/noavatar.png"}
                                className='rounded-full w-8 h-8 object-cover'
                              />
                              <p className='text-black'>
                                {item.User.first_name} {item.User.last_name}
                              </p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <AlertDialogFooter>
          <Button className='w-full mt-4' disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : "Proceed"}
          </Button>
        </AlertDialogFooter>
      </form>
    </Form>
  );
};

const DeleteTable = ({ tableId, seatArrangementId, setTables, setTableId }: any) => {
  const { mutation } = useDeleteTable();

  console.log(tableId, seatArrangementId);
  return (
    <div>
      <div className='grid grid-cols-[48px,1fr,25px] pt-5 items-start gap-4'>
        <div className='rounded-full w-[48px] h-[48px] p-[10px] flex items-center justify-center bg-[#FFFAEB]'>
          <div className='rounded-full w-[32px] h-[32px] p-[5px] flex items-center justify-center bg-yellow-100'>
            <AlertTriangle className='text-red-700' />
          </div>
        </div>
        <div>
          <h6>Delete Table</h6>
          <p className='leading-normal mt-2'>Are you sure you want to delete this table</p>
        </div>

        <AlertDialogCancel>
          <XCircle className='hover:text-red-700' />
        </AlertDialogCancel>
      </div>
      <AlertDialogFooter>
        <Button
          disabled={mutation.isPending}
          onClick={() =>
            mutation.mutate(
              { tableId, seatArrangementId },
              {
                onSuccess: (res) => {
                  setTables(res.data.data.Tables);
                  setTableId(null);
                },
              }
            )
          }
          className='w-full mt-6'
        >
          {mutation.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : "Delete"}
        </Button>
      </AlertDialogFooter>
    </div>
  );
};

const categories = ["VIP", "RESERVED", "REGULAR"];
const positions = [
  { label: "North West (Position 1)", value: "NORTH_WEST_1" },
  { label: "North West (Position 2)", value: "NORTH_WEST_2" },
  { label: "North East (Position 1)", value: "NORTH_EAST_1" },
  { label: "North East (Position 2)", value: "NORTH_EAST_2" },
  { label: "North Central (Position 1)", value: "NORTH_CENTRAL_1" },
  { label: "North Central (Position 2)", value: "NORTH_CENTRAL_2" },
  { label: "Centre West (Position 1)", value: "CENTRE_WEST_1" },
  { label: "Centre West (Position 2)", value: "CENTRE_WEST_2" },
  { label: "Centre East (Position 1)", value: "CENTRE_EAST_1" },
  { label: "Centre East (Position 2)", value: "CENTRE_EAST_2" },
  { label: "Centre Centre (Position 1)", value: "CENTRE_CENTRE_1" },
  { label: "Centre Centre (Position 2)", value: "CENTRE_CENTRE_2" },
  { label: "South West (Position 1)", value: "SOUTH_WEST_1" },
  { label: "South West (Position 2)", value: "SOUTH_WEST_2" },
  { label: "South East (Position 1)", value: "SOUTH_EAST_1" },
  { label: "South East (Position 2)", value: "SOUTH_EAST_2" },
  { label: "South South (Position 1)", value: "SOUTH_SOUTH_1" },
  { label: "South South (Position 2)", value: "SOUTH_SOUTH_2" },
];
