"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, XCircle, Pen } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formSchemaShop } from "@/app/components/schema/Forms";
import { FileUploadSingle } from "@/app/components/business/FileUpload";
import { usePostShop, useUpdateShop, useGetVendorShop } from "@/hooks/shop";
import { useGetVendorByUserId } from "@/hooks/guest";
import { AlertDialog, AlertDialogAction, ErrorModal } from "@/components/ui/alert-dialog";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";

export const Store = ({ isOverview = false }: any) => {
  const [image, setImage] = useState<File | null>(null);
  const [errorModal, setErrorModal] = useState(true);
  const { mutation, response } = usePostShop();
  const { mutation: update, response: updateRes } = useUpdateShop();
  const { data: session } = useSession();
  const [editImage, setEditImage] = useState(false);
  const { data: vendor } = useGetVendorByUserId(session?.user?.id);
  const { data: shop } = useGetVendorShop(vendor?.id);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchemaShop>>({
    resolver: zodResolver(formSchemaShop),
  });

  useEffect(() => {
    if (shop) {
      form.reset({
        name: shop?.name || "",
        username: shop?.username || "",
        description: shop?.description || "",
      });
    }
  }, [shop]);

  const onSubmit = async (values: z.infer<typeof formSchemaShop>) => {
    if (!vendor?.id)
      return toast({
        variant: "destructive",
        title: "An error occured!.",
        description: "Your vendor status as not approved, You can't add a store",
      });

    if (shop)
      update.mutate(
        {
          id: shop?.id,
          image,
          ...values,
        },
        {
          onSuccess: () => {
            if (isOverview) window.location.href = "service/listing/setup";
            else window.location.reload();
          },
        }
      );
    else
      mutation.mutate(
        {
          ...values,
          image,
          vendorId: vendor?.id,
          country: vendor?.User?.country,
          currency: vendor?.User?.preferredCurrency || "NGN",
        },
        {
          onSuccess: () => {
            if (isOverview) window.location.href = "service/listing/setup";
            else window.location.reload();
          },
        }
      );
  };

  useEffect(() => {
    if (mutation.isError) setErrorModal(true);
  }, [mutation.isError]);

  return (
    <div className=' flex flex-col justify-center items-center gap-[30px] w-full'>
      <div className={`flex flex-col gap-[30px] w-full ${isOverview ? "max-w-[900px]" : "max-w-[640px]"}`}>
        {!isOverview && (
          <div className='justify-self-start my-[15px]'>
            <h6>Store information</h6>
            <p className='my-[5px] text-sm '>Manage informations related to your store here</p>
          </div>
        )}
        {!isOverview && <div className='border-b border-gray-200 mb-3'></div>}
        <div
          className={`flex flex-col gap-[15px] rounded-lg bg-transparent shadow-sm dark:bg-surface-dark ${
            !isOverview && "sm:px-[30px]"
          } py-[15px]`}
        >
          {/* <div className='flex gap-[10px] '>
            <Switch id='airplane-mode' />

            <p className='text-black'>Go Live</p>
          </div>

          <div className='flex gap-[10px] '>
            <Switch id='airplane-mode' />
            <p className='text-black'>Someone follows me</p>
          </div> */}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className='flex flex-col gap-4'>
                {(!editImage && image) || (!editImage && shop?.image) ? (
                  <div className='max-w-[200px] max-h-[200px] overflow-hidden mt-[-20px] rounded-md relative top-0'>
                    <div className='bg-white rounded p-[2px] shadow-xl absolute top-0 right-0'>
                      <Pen
                        className='cursor-pointer h-4 md:h-5 hover:text-red-700'
                        onClick={() => setEditImage(true)}
                      />
                    </div>
                    <Image
                      src={image ? URL.createObjectURL(image) : shop.image}
                      alt={`file-preview`}
                      width={510}
                      height={510}
                      className='object-cover'
                    />
                  </div>
                ) : (
                  <div className='w-full relative overflow-hidden mt-[-30px]'>
                    {editImage && (
                      <div className='bg-white z-10 rounded p-[2px] shadow-xl absolute top-0 right-0'>
                        <XCircle
                          className='cursor-pointer h-4 md:h-5 hover:text-red-700'
                          onClick={() => setEditImage(false)}
                        />
                      </div>
                    )}
                    <FileUploadSingle onUploadSuccess={setImage} setEditImage={setEditImage} />
                  </div>
                )}
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <Label>Shop Name</Label>
                      <Input placeholder='Enter name' {...field} /> <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='username'
                  render={({ field }) => (
                    <FormItem>
                      <Label>Shop Username</Label>
                      <Input placeholder='Choose username' {...field} />
                      {form.formState.errors.username ? (
                        <FormMessage />
                      ) : (
                        <FormDescription>Between 4-20 characters</FormDescription>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <Label>Description</Label>
                      <Textarea placeholder='Enter description' {...field} />
                      {form.formState.errors.username ? (
                        <FormMessage />
                      ) : (
                        <FormDescription>150 characters only</FormDescription>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              <div className='mt-6'>
                {!shop ? (
                  <Button disabled={mutation.isPending} type='submit' className='mr-0'>
                    {mutation.isPending ? <Loader2 className='h-4 w-5 animate-spin' /> : "Save"}
                  </Button>
                ) : (
                  <Button disabled={update.isPending} type='submit' className='mr-0'>
                    {update.isPending ? <Loader2 className='h-4 w-5 animate-spin' /> : "Update"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
        {/* <div className='shadow-sm rounded-lg px-5  '>
          <div className='my-[15px]'>
            <h6>Policies</h6>
            <p>Update your shipping policies</p>
          </div>

          <div className='flex justify-between items-center p-4 border border-gray-300 rounded-lg'>
            <div>
              <p className='text-black font-semibold'>Returns & exchanges within 30 days.</p>
              <p className='text-gray-500 text-sm'>0 active listings use this policy</p>
            </div>
            <span className='text-red-600'>
              <Pencil className='h-5 w-5' />
            </span>
          </div>

          <div className='mx-auto block mt-[30px] pt-[20px] pb-[15px] '>
            <div className='flex flex-col justify-start w-full  mt-5'>
              <div className='flex justify-start w-full  mb-[10px] '>
                <Button className='mx-[0px] w-[150px]' variant={"secondary"}>
                  Change Policy
                </Button>
              </div>
            </div>
          </div>
        </div> */}
      </div>
      {mutation.isError && (
        <AlertDialog open={errorModal}>
          <ErrorModal description={response || updateRes}>
            <AlertDialogAction onClick={() => setErrorModal(false)}>Close</AlertDialogAction>
          </ErrorModal>
        </AlertDialog>
      )}
      {/* {isOnboard && (
        <AlertDialog open={errorModal}>
          <ErrorModal
            description={`You KYC status is ${
              onboardStatus?.kycRecord?.status || "Not started"
            }, you can't create a store`}
          >
            <AlertDialogAction
              onClick={() => {
                router.push("/dashboard/wallet/verification");
              }}
            >
              View KYC status
            </AlertDialogAction>
          </ErrorModal>
        </AlertDialog>
      )} */}
    </div>
  );
};
