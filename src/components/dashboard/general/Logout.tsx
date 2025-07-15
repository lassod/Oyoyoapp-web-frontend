"use client";
import React, { useState } from "react";
import { Loader, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { CustomModal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
// import { useAuth } from "@/hooks/auth";

const Logout = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // const logout = useAuth("logout");

  const handleLogout = async () => {
    setLoading(true);
    try {
      // logout.mutate({});
      await signOut({ redirect: false });
      router.push("/guest/events");
    } catch (error) {
      router.push("/guest/events");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal
      title="Sign out"
      description="Are you sure you want to sign out?"
      open={open}
      setOpen={setOpen}
      className="max-w-[500px]"
    >
      <div className="flex items-end justify-end">
        <Button
          disabled={loading}
          type="button"
          className="gap-2"
          variant="destructive"
          onClick={handleLogout}
        >
          Logout
          {loading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
        </Button>
      </div>
    </CustomModal>
  );
};

export default Logout;
