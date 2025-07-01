"use client";
import React from "react";
import { CloudUpload, Loader2 } from "lucide-react";
import { usePostAvatar } from "@/hooks/user";

export const FileUploadSingle = ({ onUploadSuccess, setEditImage }: any) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (!file) {
        alert("Please select a file first.");
        return;
      }
      onUploadSuccess(file);
      if (setEditImage) setEditImage(false);
    }
  };

  return (
    <label className='w-full cursor-pointer flex gap-[25px] justify-between mt-3'>
      <div className='w-full relative border hover:border-black border-gray-300 border-solid rounded-lg p-6'>
        <input
          type='file'
          name='image'
          className='absolute border-4 cursor-pointer inset-0 w-full h-full opacity-0'
          accept='image/png, image/jpeg, image/gif'
          onChange={handleFileChange}
        />

        <div className='text-center flex flex-col justify-center items-center w-full'>
          <CloudUpload className='h-[37px] w-[37px]' />
          <h4 className='mt-2 text-sm font-medium text-gray-900'>
            <div className='relative cursor-pointer'>
              <span className='flex justify-center'>
                <p className='text-red-500 hover:underline'>Click to upload</p>
                <p className='pl-[5px]'> or drag and drop</p>
              </span>
            </div>
          </h4>
          <p className='mt-2 text-xs text-gray-500'>SVG, PNG, JPG, or GIF (max. 800x400px)</p>
        </div>
      </div>
    </label>
  );
};

export const FileUploadAvatar = ({ onUploadSuccess }: { onUploadSuccess: (file: File) => void }) => {
  const { mutation } = usePostAvatar();
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (!file) {
        alert("Please select a file first.");
        return;
      }
      mutation.mutate(file);
      onUploadSuccess(file);
    }
  };

  return (
    <div className='w-full cursor-pointer flex gap-[25px] justify-between mt-3'>
      <div className='w-full relative border-2 border-gray-200 border-solid rounded-lg p-6'>
        <input
          type='file'
          name='image'
          className='absolute cursor-pointer inset-0 w-full h-full opacity-0 z-50'
          accept='image/png, image/jpeg, image/gif'
          onChange={handleFileChange}
        />

        {mutation.isPending ? (
          <div className='flex items-center justify-center'>
            <Loader2 className='h-5 w-5 animate-spin' />
          </div>
        ) : (
          <div className='text-center flex flex-col justify-center items-center w-full'>
            <CloudUpload className='h-[37px] w-[37px]' />
            <h4 className='mt-2 text-sm font-medium text-gray-900'>
              <label htmlFor='file-upload' className='relative cursor-pointer'>
                <span className='flex justify-center'>
                  <p className='text-red-500'>Click to upload</p>
                  <p className='pl-[5px] hidden sm:flex'> or drag and drop</p>
                </span>
              </label>
            </h4>
            <p className='sm:mt-2 text-xs text-gray-500'>SVG, PNG, JPG, or GIF (max. 800x400px)</p>
          </div>
        )}
      </div>
    </div>
  );
};
