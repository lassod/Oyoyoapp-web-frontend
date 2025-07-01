"use client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { formSchemaTables } from "@/app/components/schema/Forms";
import { Dashboard, DashboardHeader, DashboardHeaderText } from "@/components/ui/containers";
import { usePostTableArrangement } from "@/hooks/table-arrangement";
import { Loader2 } from "lucide-react";

const NewTable = ({ event }: any) => {
  const { mutation } = usePostTableArrangement();

  const form = useForm<z.infer<typeof formSchemaTables>>({
    resolver: zodResolver(formSchemaTables),
  });

  const onSubmit = async (values: z.infer<typeof formSchemaTables>) => {
    mutation.mutate(
      { eventId: event?.id, NumOfTables: parseInt(values.NumOfTables), NumOfGuests: parseInt(values.NumOfGuests) },
      {
        onSuccess: () => (window.location.href = "table-arrangement"),
      }
    );
  };

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
              <FormField
                control={form.control}
                name='NumOfTables'
                render={({ field }) => (
                  <FormItem>
                    <Label>Number of tables</Label>
                    <Input placeholder='2' {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='NumOfGuests'
                render={({ field }) => (
                  <FormItem>
                    <Label>Number of guests</Label>
                    <Input placeholder='2' {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='relative w-full h-12 mt-6'>
                <Button disabled={mutation.isPending} className='mr-0 max-w-[200px]' type='submit'>
                  {mutation.isPending ? <Loader2 className='w-4 h-4 animate-spin' /> : "Submit"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Dashboard>
    </>
  );
};

export default NewTable;
