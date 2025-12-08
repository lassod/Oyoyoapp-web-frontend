"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { formInviteEmail } from "@/app/components/schema/Forms";
import { Dashboard, DashboardContainerContent, DashboardHeader, DashboardHeaderText } from "@/components/ui/containers";
import { Copy, Loader2, PlusCircle, Search, Trash2 } from "lucide-react";
import { LogoLoader, SkeletonDemo } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGenerateAccessLink,
  useGetEmailInvitees,
  useGetLinkInvitees,
  usePostEmailInvite,
  useResendEmailInvite,
} from "@/hooks/events";
import { formatDate2, formatDatetoTime, formatTime, handleShare2 } from "@/lib/auth-helper";
import QRCode from "react-qr-code";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Empty } from "@/components/ui/table";

const TableArrangement = ({ event }: any) => {
  const [accessLink, setAccessLink] = useState<any>(null);

  const manageAccessData = [
    {
      value: "share",
      title: "Share & Invite",
      component: <Share event={event} accessLink={accessLink} setAccessLink={setAccessLink} />,
    },

    {
      value: "attendees",
      title: "Attendees",
      component: <Attendees id={event?.id} />,
    },
  ];

  return (
    <>
      <DashboardHeader>
        <DashboardHeaderText>Manage Event Access</DashboardHeaderText>
      </DashboardHeader>
      <Dashboard className='mx-auto bg-white mt-20'>
        <div>
          <h6 className='text-black font-semibold'>{event?.privacy || "Public"}</h6>
          <p className='border-b border-gray-200 pt-1 pb-2'>
            {event?.privacy === "Private"
              ? "This event is visible only to you and anyone with an invite link"
              : "This event is visible to everyone"}
          </p>
          <DashboardContainerContent className='hidden md:grid' type={1}>
            <div className='bg-white p-4 rounded-lg md:mt-3 md:ml-3'>
              <Attendees id={event?.id} />
            </div>
            <div className='bg-white p-4 md:p-5 flex flex-col gap-4'>
              <Share event={event} accessLink={accessLink} setAccessLink={setAccessLink} />
            </div>
          </DashboardContainerContent>

          <Tabs defaultValue='attendees' className='w-full mt-4 md:hidden'>
            <TabsList className='max-w-[879px] rounded-md bg-white text-gray-500'>
              {manageAccessData.map((item: any) => (
                <TabsTrigger value={item?.value} key={item?.value}>
                  {item?.title}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className='border-b border-gray-200 mt-2'></div>
            <div className='max-w-full'>
              {manageAccessData.map((item) => (
                <TabsContent value={item.value} key={item.title} className='max-w-full mx-auto my-2 md:pb-20'>
                  {item.component}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </Dashboard>
    </>
  );
};

export default TableArrangement;

const Attendees = ({ id }: any) => {
  const [activeTab, setActiveTab] = useState("Email");

  const attendeesTab = [
    {
      title: "Email",
      component: <Email id={id} />,
    },

    {
      title: "Link",
      component: <Link id={id} />,
    },
  ];

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-1'>
        <h6>Attendees</h6>
        <p>Manage your event attendees and their access links</p>
      </div>

      <Tabs onValueChange={setActiveTab} defaultValue={activeTab} className='w-full mt-4'>
        <TabsList className='w-fit border-b pb-2 rounded-md bg-white text-gray-500'>
          {attendeesTab.map((item: any, index: number) => (
            <TabsTrigger value={item.title} key={index}>
              {item.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {attendeesTab.map((item: any, index: number) => (
          <TabsContent value={item.title} key={index} className='max-w-full flex flex-col gap-3 mx-auto'>
            {item.component}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

const Email = ({ id }: any) => {
  const { data: attendees, status } = useGetEmailInvitees(id);
  const [searchTerm, setSearchTerm] = useState("");
  const resendInvite = useResendEmailInvite();

  const filteredAttendees = useMemo(() => {
    if (!attendees) return [];

    return attendees.filter((item: any) => {
      const fullName = item?.fullName || item?.User?.first_name + " " + item?.User?.last_name || "";
      const email = item?.email || item?.User?.email || "";
      return (
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [attendees, searchTerm]);

  return (
    <>
      <div className='relative my-4 w-full'>
        <Input
          className='pl-10'
          placeholder='Search attendees'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className='absolute left-3 top-[10px] text-gray-400 w-5 h-5' />
      </div>
      {status !== "success" ? (
        <SkeletonDemo />
      ) : filteredAttendees.length === 0 ? (
        <Empty title='No attendees found' />
      ) : (
        filteredAttendees.map((item: any, index: number) => (
          <div key={index} className='border p-2 sm:p-4 flex flex-col gap-2 rounded-lg'>
            <p className='font-medium'>{item?.fullName || `${item?.User?.first_name} ${item?.User?.last_name}`}</p>
            <p>{item?.email || item?.User?.email}</p>
            <h6 className='border flex gap-3 items-center text-sm sm:text-[15px] rounded-lg py-1 px-2'>
              {item?.status}: {formatDate2(item?.updatedAt)}{" "}
              <span className='text-green-700 bg-green-100 rounded-md px-2 py-1'>Sent</span>
            </h6>
            {!["Accepted", "Going"].includes(item?.status) && (
              <div className='flex flex-col gap-2'>
                <div className='flex items-center gap-2'>
                  <p>Link expires: </p>
                  {new Date(item?.expiresAt) > new Date() ? (
                    <p className='text-red-700'>{formatDate2(item?.expiresAt)}</p>
                  ) : (
                    <div className='flex gap-2 items-center'>
                      <p className='text-red-700'>Expired</p>
                    </div>
                  )}
                </div>
                {new Date(item?.expiresAt) > new Date() && (
                  <Button
                    variant='link-green'
                    size='no-padding'
                    disabled={resendInvite.isPending}
                    onClick={() => resendInvite.mutate({ id, inviteId: item?.id })}
                  >
                    Resend link
                  </Button>
                )}
              </div>
            )}
          </div>
        ))
      )}
      {resendInvite.isPending && <LogoLoader />}
    </>
  );
};

const Link = ({ id }: any) => {
  const { data: links, status } = useGetLinkInvitees(id);

  return (
    <>
      {status !== "success" ? (
        <SkeletonDemo />
      ) : links.length === 0 ? (
        <Empty title='No links found' />
      ) : (
        links.map((item: any, index: number) => (
          <div key={index} className='border p-2 sm:p-4 flex flex-col gap-2 rounded-lg'>
            <ShareLink referralLink={item?.accessUrl} data={item} />
          </div>
        ))
      )}
    </>
  );
};

const Share = ({ event, accessLink, setAccessLink }: any) => {
  const mutation = usePostEmailInvite();
  const generateLink = useGenerateAccessLink();

  const form = useForm({
    resolver: zodResolver(formInviteEmail),
    defaultValues: {
      invitations: [{ fullName: "", email: "" }],
      message: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "invitations",
  });

  const handleGenerateLink = () => {
    generateLink.mutate(
      { id: event?.id },
      {
        onSuccess: (res) => setAccessLink(res.data.data),
      }
    );
  };

  const onSubmit = (values: any) => {
    mutation.mutate(
      { ...values, id: event?.id },
      {
        onSuccess: () =>
          form.reset({
            invitations: [{ fullName: "", email: "" }],
            message: "",
          }),
      }
    );
  };

  return (
    <div className='flex flex-col gap-7'>
      <div className='border rounded-lg py-4 px-3 sm:px-4'>
        <h6>Share event link</h6>
        <p>Copy and share the {event?.privacy || "public"} invite link with your attendees</p>
        {accessLink ? (
          <ShareLink referralLink={accessLink?.accessUrl} />
        ) : (
          <Button
            disabled={generateLink.isPending}
            onClick={handleGenerateLink}
            className='max-w-[250px] flex gap-2 mt-4 w-full'
          >
            Generate link
            {generateLink.isPending && <Loader2 className='w-5 h-5 animate-spin' />}
          </Button>
        )}
      </div>

      <div className='border rounded-lg py-4 px-3 sm:px-4'>
        <h6>Invite via Email</h6>
        <p>Send an invitation email with a unique access link</p>

        <Form {...form}>
          <form className='bg-white mt-4 flex flex-col gap-4' onSubmit={form.handleSubmit(onSubmit)}>
            {fields.map((field: any, index: number) => (
              <div key={field.id} className='flex gap-4'>
                <div className='flex w-full flex-col gap-1'>
                  <FormField
                    control={form.control}
                    name={`invitations.${index}.fullName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <Input {...field} placeholder='Enter name' />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`invitations.${index}.email`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <Input {...field} placeholder='Enter email' />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {index !== 0 && (
                  <Trash2
                    onClick={() => remove(index)}
                    className='w-5 h-5 sm:w-6 sm:h-6 cursor-pointer text-red-700 hover:text-black mt-8'
                  />
                )}
              </div>
            ))}

            <Button
              type='button'
              variant='secondary'
              className='gap-2 mr-0 w-fit'
              onClick={() => append({ fullName: "", email: "" })}
            >
              <PlusCircle className='w-5 h-5' />
              Add Invitation
            </Button>

            <FormField
              control={form.control}
              name='message'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal message</FormLabel>
                  <Textarea {...field} placeholder='Enter message' />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type='submit'
              disabled={mutation.isPending}
              className='w-full flex gap-2 items-center max-w-[200px] mt-4'
            >
              Send Invites
              {mutation.isPending && <Loader2 className='w-5 h-5 animate-spin' />}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export const ShareLink = ({ referralLink, data }: any) => {
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast({
        variant: "success",
        title: "Success",
        description: `${text} copied to clipboard!`,
      });
    }
  };

  return (
    <div className='grid overflow-hidden grid-cols-[1fr,95px] items-center gap-3 sm:gap-6'>
      <div className='flex flex-col overflow-hidden'>
        <div className='border overflow-hidden relative px-4 py-2 rounded-lg flex flex-wrap items-center justify-between'>
          <h6>{referralLink || "--"}</h6>
          <div className='px-2 absolute bg-white right-0'>
            <Copy
              onClick={() => handleCopy("Referral link")}
              className='w-5 h-5 cursor-pointer hover:text-black text-gray-500'
            />
          </div>
        </div>
        {data && (
          <div className='flex flex-col gap-1 mt-[5px]'>
            <div className='flex items-center gap-[5px]'>
              <p>Link expires: </p>
              <p className='text-red-700'>{formatTime(data?.expiresAt)}</p>
            </div>
            <div className='flex items-center gap-2'>
              <p>Usage count: </p>
              <h6>{data?.usageCount}</h6>
            </div>
          </div>
        )}
      </div>

      <QRCode
        onClick={() => handleShare2(referralLink)}
        className='border rounded-lg shadow p-1'
        value={referralLink}
        size={95}
      />
    </div>
  );
};
