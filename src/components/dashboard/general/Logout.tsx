"use client";
import React, { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { AlertDialogCancel, Modal1 } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const Logout = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut({ redirect: false });
      router.push("/guest/events");
    } catch (error) {
      router.push("/guest/events");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal1 variant='Logout' title='Sign out' description='Are you sure you want to sign out?'>
      <div className='flex mt-4 w-full justify-end'>
        <div className='flex gap-4 max-w-[250px] w-full justify-end items-center'>
          <AlertDialogCancel className='w-full p-0 mr-0'>
            <Button type='button' className='mr-0 h-10 w-full' variant='secondary'>
              Cancel
            </Button>
          </AlertDialogCancel>
          <Button
            disabled={loading}
            type='button'
            className='mr-0 w-full h-10 gap-2'
            variant={"destructive"}
            onClick={handleLogout}
          >
            Logout
            {loading ? <Loader2 className='w-4 h-4 animate-spin' /> : <LogOut className='w-4 h-4' />}
          </Button>
        </div>
      </div>
    </Modal1>
  );
};

export default Logout;
