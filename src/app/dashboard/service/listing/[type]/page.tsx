"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { AddButton, AddButtonContainer, Button, FileDisplay } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightCircleIcon, Check, ChevronDown, Loader2, PlusCircle, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DashboardContainer, DashboardContainerContent } from "@/components/ui/containers";
import { FormsContainer, StepsContainer } from "@/components/ui/containers";
import { formSchemaService } from "@/app/components/schema/Forms";
import { useGetVendorServices } from "@/hooks/vendors";
import { useSession } from "next-auth/react";
import { AlertDialog, AlertDialogAction, ErrorModal } from "@/components/ui/alert-dialog";
import { ServiceHeader, Steps } from "@/app/components/business/serviceData/ServiceData";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useGetServiceCategories } from "@/hooks/categories";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useGetServiceTypes } from "@/hooks/types";
import { useGetVendorShop } from "@/hooks/shop";
import { usePostServices, useUpdateServices } from "@/hooks/services";
import { useGetVendorByUserId } from "@/hooks/guest";
import { useToast } from "@/components/ui/use-toast";

const ListService = ({ params }: any) => {
  const { type, isEdit } = params;
  const [errorModal, setErrorModal] = useState(true);
  const [isServiceCategory, setIsServiceCategory] = useState(false);
  const [isServiceType, setIsServiceType] = useState(false);
  const [isShop, setIsShop] = useState(false);
  const { mutation, response } = usePostServices();
  const { data: categories } = useGetServiceCategories();
  const { data: serviceTypes } = useGetServiceTypes();
  const { data: session, status } = useSession();
  const { data: vendor } = useGetVendorByUserId(session?.user?.id);
  const { data: shop, status: shopStatus } = useGetVendorShop(vendor?.id);
  const { data: service } = useGetVendorServices(vendor?.id);
  const { mutation: update } = useUpdateServices(service?.[0]?.id);
  const [selectedTab, setSelectedTab] = useState("Basic");
  const [selectedPlan, setSelectedPlan] = useState("Basic");
  const navigation = useRouter();
  const [media, setMedia] = useState<(File | string)[]>([]);
  // const [tags, setTags] = useState<any>([]);
  const [items, setItems] = useState<any>({
    Basic: [],
    Standard: [],
    Premium: [],
  });

  const { toast } = useToast();

  useEffect(() => {
    if (shopStatus === "error" && !shop?.id) setIsShop(true);
    else if (shop && !shop?.id) setIsShop(true);
  }, [shopStatus, shop]);

  useEffect(() => {
    if (type !== "new" && shop && service) {
      const servicePlans = service[0]?.Service_Plans || [];
      if (servicePlans?.length === 2) setSelectedPlan("Standard");
      else if (servicePlans?.length === 3) setSelectedPlan("Premium");

      form.reset({
        shopId: shop.id.toString() || "",
        tagline: service[0]?.tagline || "",
        description: service[0]?.description || "",
        serviceTypeId: service[0]?.service_TypeId?.toString() || "",
        serviceCategoryId: service[0]?.service_CategoryId?.toString() || "",
        ...servicePlans.reduce((acc: any, plan: any) => {
          const planName = plan.name.toLowerCase();
          acc[`${planName}Name`] = plan.package_name || "";
          acc[`${planName}Description`] = plan.package_description || "";
          acc[`${planName}Price`] = plan.price?.toString() || "0";
          return acc;
        }, {}),
      });
      setMedia(service?.[0]?.media || []);
      setItems(
        servicePlans.reduce(
          (acc: any, plan: any) => {
            acc[plan.name] = plan.items || [];
            return acc;
          },
          { Basic: [], Standard: [], Premium: [] }
        )
      );
    }
    if (type === "new" && shop)
      form.reset({
        shopId: shop.id.toString() || "",
      });
  }, [type, shop, service]);

  const listProductData = {
    new: type === "new" && true,
    step: "Step 2 of 5",
    title: "List a Service",
    text: "Add your first product to Oyoyo by providing a detailed description, uploading high-quality photos, and setting the right pricing. This will be the cornerstone of your online store.",
  };

  const form = useForm<any>({
    resolver: zodResolver(formSchemaService),
  });
  const handleFileChange = (newFiles: File[]) => {
    if (newFiles.length > 0) setMedia((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => setMedia((prev) => prev.filter((_, i) => i !== index));

  const onSubmit = (values: any) => {
    if (!items[selectedTab] || items[selectedTab].length === 0)
      return toast({
        variant: "destructive",
        title: "Add item",
        description: `Please add at least one item for the ${selectedTab} plan.`,
      });

    const plans = Object.keys(tabFields).map((tab) => {
      const tabData = tabFields[tab].reduce((acc: any, field: any) => {
        acc[field.name] = values[field.name];
        return acc;
      }, {});

      return {
        name: tab,
        package_name: tabData[`${tab.toLowerCase()}Name`],
        package_description: tabData[`${tab.toLowerCase()}Description`],
        is_active: !!tabData[`${tab.toLowerCase()}Price`],
        price: tabData[`${tab.toLowerCase()}Price`] || "0",
        items: items[tab], // Include dynamic items
      };
    });

    const data = {
      tagline: values.tagline,
      description: values.description,
      // shopId: parseInt(values.shopId),
      serviceTypeId: parseInt(values.serviceTypeId),
      serviceCategoryId: parseInt(values.serviceCategoryId),
      media,
      plans: plans.filter((plan) => plan.is_active), // Include only active plans
      vendorId: vendor.id,
    };

    if (type !== "new" && service?.length > 0)
      update.mutate(data, {
        onSuccess: () => {
          // if (isEdit) window.location.reload();
          // else window.location.href = "/dashboard/service/payment";
        },
      });
    else
      mutation.mutate(data, {
        onSuccess: () => {
          if (type === "new") window.location.href = "/dashboard/listing";
          else window.location.href = "/dashboard/service/payment";
        },
      });
  };

  useEffect(() => {
    if (mutation.isError) setErrorModal(true);
  }, [mutation.isError]);

  const handleValueChange = (value: string) => {
    setSelectedPlan(value);
    const selectedIndex = plans.indexOf(value);
    const availableTabs = plans.slice(0, selectedIndex + 1);
    setSelectedTab(availableTabs[0]);
  };

  // const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === "Enter") {
  //     e.preventDefault();
  //     const tag = e.currentTarget.value.trim();
  //     if (tag && !tags.includes(tag)) {
  //       const updatedTags = [...tags, tag];
  //       setTags(updatedTags);
  //       form.setValue("tags", updatedTags);
  //       e.currentTarget.value = "";
  //     }
  //   }
  // };

  // const handleRemoveTag = (tag: string) => {
  //   const updatedTags = tags.filter((s: any) => s !== tag);
  //   setTags(updatedTags);
  //   form.setValue("tags", updatedTags);
  // };

  // if (shopStatus !== "success") return <SkeletonCard2 />;
  if (status === "loading") return <SkeletonCard2 />;
  if (session?.user?.accountType === "PERSONAL") {
    navigation.back(); // Redirect user back but don't render void
    return null; // Return null to render nothing while navigating
  }
  return (
    <>
      <div className='dashBG'></div>

      <div className='relative mx-auto'>
        {!isEdit && <ServiceHeader />}
        <FormsContainer className={`${isEdit && "flex pt-0 md:mt-0 mt-0 lg:pl-0 pl-0"}`}>
          {!isEdit && (
            <StepsContainer>
              <Steps data={listProductData} />
            </StepsContainer>
          )}

          <DashboardContainer className={`${isEdit && "pt-0"}`}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <DashboardContainerContent>
                  <h6>Listing Details</h6>
                  <FormField
                    control={form.control}
                    name='tagline'
                    render={({ field }) => (
                      <FormItem>
                        <Label>Title</Label>
                        <Input placeholder='Add product title' {...field} />
                        {form.formState.errors.tagline ? (
                          <FormMessage />
                        ) : (
                          <FormDescription>Include keywords to drive sales</FormDescription>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='serviceCategoryId'
                    render={({ field }) => (
                      <FormItem>
                        <Label>Service category</Label>
                        <Popover open={isServiceCategory} onOpenChange={setIsServiceCategory}>
                          <PopoverTrigger className='w-full' asChild>
                            <Button variant='combobox' role='combobox' className={cn(!field.value && "text-gray-400")}>
                              {field.value
                                ? categories?.find((category: any) => category?.id === parseInt(field.value))?.name
                                : "Select a category"}
                              <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className='w-full p-0'>
                            <Command>
                              <CommandInput placeholder='Search countries...' />
                              <CommandList>
                                <CommandEmpty>No category found.</CommandEmpty>
                                <CommandGroup>
                                  {categories?.map((category: any) => (
                                    <CommandItem
                                      value={category.id}
                                      key={category.id}
                                      onSelect={() => {
                                        form.setValue("serviceCategoryId", category.id.toString());
                                        setIsServiceCategory(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          category.id === parseInt(field.value) ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {category.name}
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

                  <FormField
                    control={form.control}
                    name='serviceTypeId'
                    render={({ field }) => (
                      <FormItem>
                        <Label>Service Type</Label>
                        <Popover open={isServiceType} onOpenChange={setIsServiceType}>
                          <PopoverTrigger className='w-full' asChild>
                            <Button variant='combobox' role='combobox' className={cn(!field.value && "text-gray-400")}>
                              {field.value
                                ? serviceTypes?.find((type: any) => type?.id === parseInt(field.value))?.name
                                : "Select a type"}
                              <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className='w-full p-0'>
                            <Command>
                              <CommandInput placeholder='Search countries...' />
                              <CommandList>
                                <CommandEmpty>No type found.</CommandEmpty>
                                <CommandGroup>
                                  {serviceTypes?.map((type: any) => (
                                    <CommandItem
                                      value={type.id}
                                      key={type.id}
                                      onSelect={() => {
                                        form.setValue("serviceTypeId", type.id.toString());
                                        setIsServiceType(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          type.id === parseInt(field.value) ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {type.name}
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
                  <FormField
                    control={form.control}
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <Label>Description</Label>
                        <Textarea placeholder='Enter description' {...field} />
                        <FormDescription>
                          Begin by providing a concise summary highlighting the most outstanding qualities of your
                          product.
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <Select onValueChange={handleValueChange} defaultValue={selectedPlan}>
                    <Label>Number of plans</Label>
                    <SelectTrigger className={cn(!selectedPlan && "text-gray-400")}>
                      <SelectValue placeholder='Select number of plans' />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan: string, index: number) => (
                        <SelectItem value={plan} key={plan}>
                          {index + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div>
                    <div className='flex space-x-4 border-b'>
                      {plans
                        .slice(0, plans.indexOf(selectedPlan) + 1) // Show tabs up to the selected plan
                        .map((option) => (
                          <button
                            type='button'
                            key={option}
                            className={`px-4 py-2 hover:text-black ${
                              selectedTab === option ? "border-b-2 border-red-500 font-semibold" : "text-gray-500"
                            }`}
                            onClick={() => setSelectedTab(option)}
                          >
                            {option}
                          </button>
                        ))}
                    </div>

                    {tabFields[selectedTab]?.map((field: any) => (
                      <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                          <FormItem>
                            {field.type === "input" ? (
                              <Input placeholder={field.placeholder} className='mb-2 mt-4' {...formField} />
                            ) : (
                              <Textarea placeholder={field.placeholder} className='my-2' {...formField} />
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}

                    <div>
                      {items[selectedTab].map((item: any, index: number) => (
                        <div
                          key={index}
                          className='grid grid-cols-[1fr,20px] mt-3 w-full items-center gap-2 sm:gap-4 mb-2'
                        >
                          <FormField
                            control={form.control}
                            name={`${selectedTab.toLowerCase()}Items`}
                            render={({ field }) => (
                              <FormItem>
                                <Input
                                  placeholder={`Item ${index + 1}`}
                                  {...field}
                                  value={item}
                                  onChange={(e) => {
                                    const newItems = [...items[selectedTab]];
                                    newItems[index] = e.target.value;
                                    setItems((prev: any) => ({ ...prev, [selectedTab]: newItems }));
                                  }}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <button
                            type='button'
                            className='text-red-500 hover:text-red-700'
                            onClick={() => {
                              setItems((prev: any) => {
                                const newItems = [...prev[selectedTab]];
                                newItems.splice(index, 1); // Remove the item at the current index
                                return { ...prev, [selectedTab]: newItems };
                              });
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        type='button'
                        className='flex items-center mt-3 gap-2 text-red-700 hover:text-black'
                        onClick={() => {
                          setItems((prev: any) => ({
                            ...prev,
                            [selectedTab]: [...prev[selectedTab], ""],
                          }));
                        }}
                      >
                        <PlusCircle className='w-5 h-5' /> Add Item
                      </button>
                      <p className='bg-green-50 border border-green-500 text-green-500 p-3 rounded-lg mt-3 text-sm max-w-[350px]'>
                        Click on “Add item” to include benefits that comes with the package.
                      </p>
                    </div>
                  </div>
                </DashboardContainerContent>

                <DashboardContainerContent>
                  <AddButtonContainer className='mt-4'>
                    <h6>Photos</h6>
                    <p className='text-sm'>
                      Add up to 3 photos, so buyers can see every detail, do not upload images that are not clear
                      enough.
                    </p>
                    <AddButton title='Add photos' onFileChange={handleFileChange} isMultiple={true} type={2} />
                    <FileDisplay files={media} onRemove={handleRemoveFile} isMultiple={true} />
                  </AddButtonContainer>
                </DashboardContainerContent>

                {/* <DashboardContainerContent>
                  <h6 className='mt-2'>Tags</h6>
                  <Input type='text' placeholder='Type and press Enter to add a tag' onKeyDown={handleAddTag} />
                  <FormMessage>Max. of 2 tags</FormMessage>
                  <div className='flex gap-2 flex-wrap'>
                    {tags.length > 0 &&
                      tags?.map((tag: any, index: number) => (
                        <div className='flex gap-2 bg-red-100 text-red-700 rounded-lg px-4 py-1' key={index}>
                          {tag}
                          <XCircle
                            onClick={() => handleRemoveTag(tag)}
                            className='w-4 h-4 text-red-500 hover:text-black cursor-pointer'
                          />
                        </div>
                      ))}
                  </div>
                </DashboardContainerContent> */}

                {/* 
                  <div>
                    <h6>Video (optional)</h6>
                    <p>
                      Showcase your product using a 10 - 15 seconds video. You can choose to upload a click or embed it.
                    </p>
                    <span className='flex flex-col gap-1 items-center border border-dashed border-[#be1732] bg-[#fce5e4] rounded-md mt-3 justify-center max-w-[563px] h-[245px]'>
                      <Image src={Video} alt='Video' />
                      <p className='text-[#be1732]'>Add a video (max. file size: 50MB)</p>
                    </span>
                  </div> */}
                {/* 
                <div className='flex justify-between py-5'>
                  <h6>Variations</h6>
                  <span className='flex items-center space-x-2'>
                    <Switch id='airplane-mode' />
                  </span>
                </div> */}

                <div className='flex mt-4 w-[350px] mx-auto gap-[16px]'>
                  <Button disabled={mutation.isPending || update.isPending} type='submit' className='mt-4'>
                    {mutation.isPending || update.isPending ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <div className='flex gap-2 items-center'>
                        {type !== "new" && service?.length > 0 ? "Update" : "Next"}
                        <ArrowRightCircleIcon className='ml-2 h-4 w-4' />
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DashboardContainer>
        </FormsContainer>
        {mutation.isError && (
          <AlertDialog open={errorModal}>
            <ErrorModal description={response}>
              <AlertDialogAction onClick={() => setErrorModal(false)}>Close</AlertDialogAction>
            </ErrorModal>
          </AlertDialog>
        )}
      </div>
    </>
  );
};

export default ListService;

const plans = ["Basic", "Standard", "Premium"];

const tabFields: any = {
  Basic: [
    { name: "basicName", placeholder: "Basic product name", type: "input" },
    { name: "basicDescription", placeholder: "Basic product description", type: "textarea" },
    { name: "basicPrice", placeholder: "Enter price", type: "input" },
  ],
  Standard: [
    { name: "standardName", placeholder: "Standard product name", type: "input" },
    { name: "standardDescription", placeholder: "Standard product description", type: "textarea" },
    { name: "standardPrice", placeholder: "Enter price", type: "input" },
  ],
  Premium: [
    { name: "premiumName", placeholder: "Premium product name", type: "input" },
    { name: "premiumDescription", placeholder: "Premium product description", type: "textarea" },
    { name: "premiumPrice", placeholder: "Enter price", type: "input" },
  ],
};
