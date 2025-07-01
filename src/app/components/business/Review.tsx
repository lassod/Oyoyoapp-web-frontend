"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { formSchemaReview } from "@/app/components/schema/Forms";
import { Star, ThumbsUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialogCancel, AlertDialogContent } from "@/components/ui/alert-dialog";
import { usePostServiceReview } from "@/hooks/services";

export const Review = ({ VendorId }: any) => {
  const { mutation: review } = usePostServiceReview();

  const form = useForm<z.infer<typeof formSchemaReview>>({
    resolver: zodResolver(formSchemaReview),
  });

  console.log(VendorId);
  const onSubmit = (values: z.infer<typeof formSchemaReview>) => {
    console.log(values);

    review.mutate(
      {
        VendorId,
        ...values,
      },
      {
        onSuccess: () => {
          form.reset();
          window.location.reload();
        },
      }
    );
  };

  return (
    <AlertDialogContent className='left-[50%] top-[50%]'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='grid grid-cols-[40px,1fr] gap-5 mt-4 items-start'>
          <div className={`p-[5px]  rounded-full w-10 bg-[#FFFAEB]`}>
            <div className='flex items-center justify-center p-[5px] rounded-full w-full bg-[#FFF3CD]'>
              <ThumbsUp className='w-4 text-red-600' />
            </div>
          </div>
          <div>
            <h6>Rate this Vendor</h6>
            <FormField
              control={form.control}
              name='rating'
              render={() => (
                <FormItem className='mt-4'>
                  <StarRating onRatingSelect={(value) => form.setValue("rating", value)} />
                </FormItem>
              )}
            />
            {/* Review Text Area */}
            <FormField
              control={form.control}
              name='comment'
              render={({ field }) => (
                <FormItem className='mt-4'>
                  <Textarea placeholder='Enter response' className='h-20 w-full' {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex mt-3 items-end justify-end'>
              <div className='flex gap-2 max-w-[353px] items-end'>
                <AlertDialogCancel>
                  <Button variant={"secondary"} type='button' className='mr-0 mt-5'>
                    Cancel
                  </Button>
                </AlertDialogCancel>
                <Button type='submit' className='mr-0 mt-5'>
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </AlertDialogContent>
  );
};

export const StarRating = ({ onRatingSelect }: { onRatingSelect: (rating: number) => void }) => {
  const [rating, setRating] = React.useState<number>(0);

  const handleRating = (ratingValue: number) => {
    setRating(ratingValue);
    onRatingSelect(ratingValue); // Pass the selected rating back to the parent
  };

  return (
    <div className='flex'>
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={index}
            fill={starValue <= rating ? "#FFD700" : "none"}
            className='cursor-pointer h-7 ml-1 w-7 text-[#FFD700]'
            onClick={() => handleRating(starValue)}
          />
        );
      })}
    </div>
  );
};
