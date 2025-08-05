"use client";
import * as React from "react";
import { AlertTriangle, CircleCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import {
  useAcceptOrder,
  useCompletedOrderUser,
  useDeleteOrder,
  useRejectOrder,
} from "@/hooks/orders";

export const AcceptOrder = ({ order }: any) => {
  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const { mutation } = useAcceptOrder();

  useEffect(() => {
    setIsButtonEnabled(checkedItems.some((item) => item));
  }, [checkedItems]);

  useEffect(() => {
    // Initialize the checkedItems state based on the number of OrderItems
    if (order?.OrderItems) {
      setCheckedItems(Array(order.OrderItems.length).fill(false));
    }
  }, [order]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Accept Order</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="left-[50%] top-[50%]">
        <AlertDialogHeader className="flex-row gap-4 pt-4">
          <div className="rounded-full w-[48px] h-[48px] p-[10px] flex items-center justify-center bg-green-50">
            <div className="rounded-full w-[32px] h-[32px] p-[5px] flex items-center justify-center bg-green-100">
              <CircleCheck className="text-green-500" />
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <div>
              <h6 className="text-left pb-2">Accept Order</h6>
              <p className="text-left">
                Are you sure you want to accept this order?
              </p>
              {/* <p className='text-left'>Confirm which products are available</p> */}
            </div>
            {/* <div className='flex flex-col gap-3'>
              {order?.OrderItems?.map((item: any, index: number) => (
                <div key={index} className='flex gap-3 justify-between'>
                  <div className='flex flex-row gap-[8px] items-center'>
                    <input
                      type='checkbox'
                      className='border-gray-100 cursor-pointer'
                      checked={checkedItems[index]}
                      onChange={() => handleCheckboxChange(index)}
                    />
                    <Label className='text-gray-500 mb-0'>{item?.Event_Plans?.name}</Label>
                  </div>
                  <Label className='text-gray-500'>x{item?.quantity}</Label>
                </div>
              ))}
            </div> */}
          </div>
        </AlertDialogHeader>
        <div className="flex justify-end mt-2">
          <div className="flex max-w-[255px] gap-2">
            <AlertDialogCancel>
              <Button variant={"secondary"}>Cancel</Button>
            </AlertDialogCancel>
            <Button
              onClick={() => mutation.mutate(order?.id)}
              className="bg-green-500 ml-0 w-[116px]"
              // disabled={!isButtonEnabled}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Yes"
              )}
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const CompletedOrderUser = ({ order }: any) => {
  const { mutation } = useCompletedOrderUser();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Mark Completed</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="left-[50%] top-[50%]">
        <AlertDialogHeader className="flex-row gap-4 pt-4">
          <div className="rounded-full w-[48px] h-[48px] p-[10px] flex items-center justify-center bg-green-50">
            <div className="rounded-full w-[32px] h-[32px] p-[5px] flex items-center justify-center bg-green-100">
              <CircleCheck className="text-green-500" />
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <div>
              <h6 className="text-left pb-2">Mark Completed</h6>
              <p className="text-left">
                Are you sure you want to mark this order as completed?
              </p>
            </div>
          </div>
        </AlertDialogHeader>
        <div className="flex justify-end mt-2">
          <div className="flex max-w-[255px] gap-2">
            <AlertDialogCancel>
              <Button variant={"secondary"}>Cancel</Button>
            </AlertDialogCancel>
            <Button
              onClick={() => mutation.mutate(order?.id)}
              className="bg-green-500 ml-0 w-[116px]"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Yes"
              )}
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const DeleteOrder = ({ id }: { id: number }) => {
  const { mutation } = useDeleteOrder();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
  };

  const handleDelete = () => {
    mutation.mutate(id);
    // setIsDialogOpen(false); // Close the dialog after mutation
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {/* Use a button or any interactive element, and stop propagation to prevent dropdown from closing */}
        <p className="text-red-500" onClick={(e) => e.stopPropagation()}>
          Delete
        </p>
      </AlertDialogTrigger>
      <AlertDialogContent className="left-[50%] top-[50%]">
        <AlertDialogHeader className="flex-row gap-4 pt-4">
          <div className="rounded-full w-[48px] h-[48px] p-[10px] flex items-center justify-center bg-[#FFFAEB]">
            <div className="rounded-full w-[32px] h-[32px] p-[5px] flex items-center justify-center bg-yellow-100">
              <AlertTriangle className="text-red-700" />
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full items-start justify-start">
            <div>
              <h6 className="text-left pb-2">Delete Order</h6>
              <p className="text-left">
                Are you sure you want to delete this order?
              </p>
            </div>
          </div>
        </AlertDialogHeader>
        <div className="flex justify-end mt-2">
          <div className="flex max-w-[235px] gap-2">
            <AlertDialogCancel>
              <Button variant={"secondary"}>Cancel</Button>
            </AlertDialogCancel>
            <Button
              onClick={handleDelete}
              className="bg-green-500 ml-0 w-[116px]"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const RejectOrder = ({ id }: { id: number }) => {
  const { mutation } = useRejectOrder();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
  };

  const handleReject = () => {
    mutation.mutate(id);
    // setIsDialogOpen(false); // Close the dialog after mutation
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant={"secondary"}>Cancel Order</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="left-[50%] top-[50%]">
        <AlertDialogHeader className="flex-row gap-4 pt-4">
          <div className="rounded-full w-[48px] h-[48px] p-[10px] flex items-center justify-center bg-[#FFFAEB]">
            <div className="rounded-full w-[32px] h-[32px] p-[5px] flex items-center justify-center bg-yellow-100">
              <AlertTriangle className="text-red-700" />
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full items-start justify-start">
            <div>
              <h6 className="text-left pb-2">Reject Order</h6>
              <p className="text-left">
                Are you sure you want to cancel this order and make refunds to
                the customer?
              </p>
            </div>
          </div>
        </AlertDialogHeader>
        <div className="flex justify-end mt-2">
          <div className="flex max-w-[235px] gap-2">
            <AlertDialogCancel>
              <Button variant={"secondary"}>Cancel</Button>
            </AlertDialogCancel>
            <Button
              onClick={handleReject}
              className="ml-0 w-[116px]"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Yes"
              )}
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const CancelOrderUser = ({ id }: { id: number }) => {
  const { mutation } = useRejectOrder();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
  };

  const handleReject = () => {
    mutation.mutate(id);
    // setIsDialogOpen(false); // Close the dialog after mutation
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant={"secondary"}>Cancel Order</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="left-[50%] top-[50%]">
        <AlertDialogHeader className="flex-row gap-4 pt-4">
          <div className="rounded-full w-[48px] h-[48px] p-[10px] flex items-center justify-center bg-[#FFFAEB]">
            <div className="rounded-full w-[32px] h-[32px] p-[5px] flex items-center justify-center bg-yellow-100">
              <AlertTriangle className="text-red-700" />
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full items-start justify-start">
            <div>
              <h6 className="text-left pb-2">Reject Order</h6>
              <p className="text-left">
                Are you sure you want to cancel this order?
              </p>
            </div>
          </div>
        </AlertDialogHeader>
        <div className="flex justify-end mt-2">
          <div className="flex max-w-[235px] gap-2">
            <AlertDialogCancel>
              <Button variant={"secondary"}>Cancel</Button>
            </AlertDialogCancel>
            <Button
              onClick={handleReject}
              className="ml-0 w-[116px]"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Yes"
              )}
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
