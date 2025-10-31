"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DashboardContainerContent, DashboardHeader, DashboardHeaderText } from "@/components/ui/containers";
import { SkeletonCard2 } from "@/components/ui/skeleton";
import { formatDate, shortenText } from "@/lib/auth-helper";
import { useGetService } from "@/hooks/services";
import { useGetServiceCategoryById, useGetServiceTypeById } from "@/hooks/categories";
import ListService from "../../service/listing/[type]/page";

const ViewListing = ({ params }: any) => {
  const { id } = params;
  const [edit, setEdit] = useState(false);
  const { data: service, status } = useGetService(parseInt(id));
  const { data: category } = useGetServiceCategoryById(service?.service_CategoryId);
  const { data: type } = useGetServiceTypeById(service?.service_TypeId);
  const [comments, setComments] = useState<any>([]);
  const [showAllComments, setShowAllComments] = useState(false);

  useEffect(() => {
    if (service) setComments(service?.Reviews);
  }, [service]);

  const displayedComments = showAllComments ? comments || [] : (comments || []).slice(0, 5);

  if (status !== "success") return <SkeletonCard2 />;
  else
    return (
      <div className='relative mx-auto mt-36'>
        <DashboardHeader>
          <DashboardHeaderText>{edit ? "Edit Listing" : "View Listing"}</DashboardHeaderText>

          <div className='flex items-center gap-4'>
            {/* <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className='flex items-center cursor-pointer rounded-full border border-gray-700 text-gray-700 hover:border-red-700 hover:text-red-700 w-6 h-6 p-1'>
                      <MoreHorizontal className='w-4.5' />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem>Deactivate Listing</DropdownMenuItem>
                    <DropdownMenuItem style={{ color: "red", fontWeight: "500" }}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu> */}

            <span className='flex items-center gap-[10px]'>
              {/* <Button type='button' variant={"secondary"} className='max-w-[115px] sm:max-w-[140px]'>
                    <Eye className='h-[20px] w-[20px]' />
                    Live Preview
                  </Button> */}

              {edit ? (
                <Button
                  type='button'
                  onClick={() => setEdit(false)}
                  variant={"secondary"}
                  className='max-w-[115px] sm:max-w-[140px]'
                >
                  Cancel
                </Button>
              ) : (
                <Button type='button' onClick={() => setEdit(true)} className='max-w-[115px] sm:max-w-[140px]'>
                  Edit Listing
                </Button>
              )}
            </span>
          </div>
        </DashboardHeader>

        <DashboardContainerContent type={1}>
          {edit ? (
            <div className='bg-white p-4 rounded-lg md:mt-3 md:ml-3'>
              <ListService
                params={{
                  type: "add",
                  isEdit: true,
                }}
              />
            </div>
          ) : (
            <div className='section1'>
              <div className='wrapper1'>
                <h2>Listing Details</h2>
                <div>
                  <p>Title</p>

                  <p className='text-black font-medium mt-2'>{service?.tagline}</p>
                </div>
                <div>
                  <p>Description</p>
                  <p className='text-black font-medium mt-2'>{service?.description}</p>
                </div>
                <div className='flex gap[40px] justify-between'>
                  <div>
                    <p>Product Type</p>
                    <p className='text-black font-medium mt-2'>{type?.name}</p>
                  </div>
                  <div>
                    <p>Tags/Keywords</p>
                    <p className='text-black font-medium'>--</p>
                  </div>
                  <div>
                    <p>Product Category</p>
                    <p className='text-black font-medium'>{category?.name}</p>
                  </div>
                </div>
              </div>

              <div className='wrapper2'>
                <h2>Imagery & Video</h2>
                <div>
                  <div className='grid gap-2 grid-cols-3 mt-2'>
                    {service?.media?.map((media: string, index: number) => (
                      <Image
                        key={index}
                        height={350}
                        width={350}
                        src={media}
                        alt='Selected file'
                        className='w-full h-[150px] min-h-full object-cover'
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className='wrapper3'>
                <h2>Variations</h2>
                <table className='rounded-lg'>
                  <thead>
                    <tr>
                      <th>Variant</th>
                      <th>Price</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {service?.Service_Plans?.map((plan: any) => (
                      <tr>
                        <td>{shortenText(plan?.package_name, 12)}</td>
                        <td>
                          {plan?.symbol} {plan?.price?.toLocaleString()}
                        </td>
                        <td>{shortenText(plan?.package_description, 25)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* <div className='wrapper4'>
              <h2>Personalisation</h2>
              <div>
                <p>Instructions for buyers</p>
                <span>...</span>
              </div>
              <div>
                <p>Optional</p>
                <span>Yes</span>
              </div>
            </div> */}
            </div>
          )}

          <div className='bg-white p-4 md:p-5 flex flex-col gap-4'>
            <span className='text-gray-500 text-sm'>Last updated: {formatDate(service?.updatedAt)}</span>

            <div>
              <h3>Analytics</h3>
              <div className='flex mt-2 flex-col gap-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='border rounded-lg p-4 flex flex-col gap-2'>
                    <p className='text-black font-medium'>Status</p>
                    {service?.Service_Plans && service?.Service_Plans[0].is_active ? (
                      <span className='py-1 px-2 text-[14px] bg-green-100 text-green-700 rounded-md w-[65px] text-center'>
                        Active
                      </span>
                    ) : (
                      <span className='py-1 px-2 text-[14px] bg-red-100 text-red-700 rounded-md w-[70px] text-center'>
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className='border rounded-lg p-4 flex flex-col gap-2'>
                    <p className='text-black font-medium'>Views</p>
                    <h6>{service?._count?.views || 0}</h6>
                  </div>
                  <div className='border rounded-lg p-4 flex flex-col gap-2'>
                    <p className='text-black font-medium'>Sold</p>
                    <h6>{service?.Listing_ticket?.sold || 0}</h6>
                  </div>
                  <div className='border rounded-lg p-4 flex flex-col gap-2'>
                    <p className='text-black font-medium'>Unsold</p>
                    <h6>{service?.Listing_ticket?.unsold || 0}</h6>
                  </div>
                </div>

                <div className='border rounded-lg p-4 flex flex-col gap-2'>
                  <h4>Total Sales</h4>
                  <h6>
                    {service?.User?.currencySymbol} {service?.Listing_ticket?.sales || 0}
                  </h6>
                </div>
              </div>
            </div>

            <div className='flex flex-col gap-5 mt-5'>
              <div className='flex items-center justify-between gap-4'>
                <h3>Comments({comments?.length || 0})</h3>
                {comments?.length > 4 && (
                  <p
                    onClick={() => setShowAllComments((prev) => !prev)}
                    className='text-red-700 cursor-pointer hover:underline'
                  >
                    {showAllComments ? "See Some" : "See All"}
                  </p>
                )}
              </div>
              {comments?.length > 0 &&
                displayedComments?.map((comment: any) => (
                  <div className='flex flex-col gap-4 pb-5 border-b border-gray-200'>
                    <div className='flex gap-3 items-center w-full'>
                      <Image
                        src={comment?.Users?.avatar || "/noavatar.png"}
                        alt='zac'
                        width={100}
                        height={100}
                        className='h-[40px] w-[40px] rounded-full'
                      />
                      <p className='text-black font-medium'>
                        {comment?.Users?.first_name} {comment?.Users?.last_name}
                      </p>
                    </div>
                    <p className='leading-normal'>{comment?.comment}</p>
                  </div>
                ))}
            </div>
          </div>
        </DashboardContainerContent>
      </div>
    );
};

export default ViewListing;
