"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Loader2, XCircle } from "lucide-react";
import { AddButton, AddButtonContainer, Button, FileDisplay } from "@/components/ui/button";
import { formSchemaSupport } from "@/app/components/schema/Forms";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialogCancel, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import {
  usePostSupportTicket,
  useDeleteSupportTicket,
  useUpdateSupportTicket,
  useGetSupportCategories,
} from "@/hooks/support";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const NewTicket = ({ data, edit }: any) => {
  const { data: session } = useSession();
  const { data: categories } = useGetSupportCategories();
  const { mutation: update } = useUpdateSupportTicket();
  const { mutation: post } = usePostSupportTicket();
  const [images, setImages] = useState<(File | string)[]>([]);

  const onSubmit = (values: z.infer<typeof formSchemaSupport>) => {
    if (edit === "edit")
      update.mutate({
        ...values,
        userId: session?.user?.id,
        images: data?.id,
        categoryId: parseInt(values.categoryId),
      });
    else
      post.mutate({
        ...values,
        userId: session?.user?.id,
        images: images,
        categoryId: parseInt(values.categoryId),
      });
  };

  const form = useForm<z.infer<typeof formSchemaSupport>>({
    resolver: zodResolver(formSchemaSupport),
  });

  useEffect(() => {
    if (session) {
      if (edit === "edit") {
        form.reset({
          subject: data?.subject || "",
          categoryId: data?.categoryId || 0,
          description: data?.description || "",
        });
        setImages(data?.images);
      }
    }
  }, [session]);

  const handleFileChange = (newFiles: File[]) => {
    if (newFiles.length > 0) setImages((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='flex relative flex-col gap-3'>
        <div className='flex sticky top-0 pt-4 pb-2 z-50 bg-white justify-between items-center'>
          <h6>{edit === "edit" ? "View ticket" : "Contact Support"}</h6>
          {edit !== "support" && (
            <AlertDialogCancel>
              <XCircle className='hover:text-red-700' />
            </AlertDialogCancel>
          )}
        </div>
        <FormField
          control={form.control}
          name='subject'
          render={({ field }) => (
            <FormItem className='mt-2'>
              <FormLabel>Subject</FormLabel>
              <Input placeholder='Enter subject' {...field} />
              <FormMessage className='relative top-1' />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='categoryId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ticket category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className={`${!field.value && "text-gray-400"}`}>
                  <SelectValue
                    placeholder={
                      field.value
                        ? categories?.find((category: any) => category.id === parseInt(field.value))?.name
                        : "Select Category"
                    }
                  >
                    {field.value
                      ? categories?.find((category: any) => category.id === parseInt(field.value))?.name
                      : "Select Category"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((item: any) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name}
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
          name='description'
          render={({ field }) => (
            <FormItem className='mt-2'>
              <FormLabel>Description</FormLabel>
              <Textarea placeholder='Enter details...' {...field} />
              <FormMessage className='relative top-1' />
            </FormItem>
          )}
        />

        <AddButtonContainer>
          <AddButton title='Upload image (PNG, JPG format)' onFileChange={handleFileChange} isMultiple={true} />
          <FileDisplay files={images} onRemove={handleRemoveFile} isMultiple={true} />
        </AddButtonContainer>

        <AlertDialogFooter>
          {edit !== "edit" && (
            <Button className='w-full'>{post.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : "Send"}</Button>
          )}
        </AlertDialogFooter>
      </form>
    </Form>
  );
};

export const DeleteTicket = ({ id }: any) => {
  const { mutation } = useDeleteSupportTicket();
  return (
    <div>
      <div className='grid grid-cols-[48px,1fr,25px] items-start gap-4'>
        <div className='rounded-full w-[48px] h-[48px] p-[10px] flex items-center justify-center bg-[#FFFAEB]'>
          <div className='rounded-full w-[32px] h-[32px] p-[5px] flex items-center justify-center bg-yellow-100'>
            <AlertTriangle className='text-red-700' />
          </div>
        </div>
        <div>
          <h6>Delete Ticket</h6>
          <p className='leading-normal mt-2'>
            By choosing delete, your ticket will be permanently deleted from the platform.
          </p>
        </div>

        <AlertDialogCancel>
          <XCircle className='hover:text-red-700' />
        </AlertDialogCancel>
      </div>
      <AlertDialogFooter>
        <Button disabled={mutation.isPending} onClick={() => mutation.mutate(id)} className='w-full mt-10'>
          {mutation.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : "Delete"}
        </Button>
      </AlertDialogFooter>
    </div>
  );
};
