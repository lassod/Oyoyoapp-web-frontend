"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Oyoyo from "../../components/assets/images/Oyoyo.svg";
import Background from "../../components/authBackground/Background";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formLoginSchema } from "@/app/components/schema/Forms";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePostLogin } from "@/hooks/auth";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { LogoLoader } from "@/components/ui/skeleton";

const Login = () => {
  const mutation = usePostLogin();
  const [hide, setHide] = useState(true);
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const form = useForm<z.infer<typeof formLoginSchema>>({
    resolver: zodResolver(formLoginSchema),
  });

  const onSubmit = (data: z.infer<typeof formLoginSchema>) =>
    mutation.mutate(
      { ...data, email: data.email.toLowerCase() },
      {
        onError: async (error) => {
          if (
            error?.response?.data?.errors[0].message ===
            "Your account is not active. Please check your email for a verification code or contact our support team for assistance."
          )
            router.push(`/auth/${false}/${data.email.toLowerCase()}`);
        },
        onSuccess: async (res) => {
          setIsSigningIn(true);
          const result = await signIn("credentials", {
            redirect: false,
            ...res?.data,
            ...res?.data?.data,
          });
          if (result?.ok) router.push("/dashboard");
          else setIsSigningIn(false);
        },
      }
    );

  return (
    <section className='min-h-screen flex items-center justify-center py-[50px]'>
      <Background />
      <div className='bg-white w-full max-w-[500px] rounded-[20px] px-4 sm:px-[30px] py-[50px]'>
        <Image src={Oyoyo} alt='Envelope' />
        <h2 className='font-bold text-[30px] mt-5'>Welcome back,</h2>
        <p className='text-black font-medium'>
          Don’t have an account?{" "}
          <Link className='text-red-700 font-medium hover:text-black' href='signup'>
            Create an account
          </Link>
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-2'>
            <div>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='my-3'>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type='email' placeholder='john.doe@example.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className='relative flex justify-between w-full'>
                        <Input
                          type={`${hide ? "password" : "text"}`}
                          placeholder='Password must be atleast 6 characters'
                          {...field}
                        />
                        {hide ? (
                          <EyeOff
                            className='absolute right-3 text-gray-500 cursor-pointer top-2 hover:text-black cursor bg-white pl-1 sm:pl-0-pointer'
                            onClick={() => setHide(!hide)}
                          />
                        ) : (
                          <Eye
                            className='absolute right-3 text-gray-500 cursor-pointer top-2 hover:text-black cursor bg-white pl-1 sm:pl-0-pointer'
                            onClick={() => setHide(!hide)}
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className='top-1' />
                  </FormItem>
                )}
              />
            </div>
            <div className='mt-2'>
              <Link className='text-red-700 font-medium hover:text-black' href='reset-password'>
                Fogot Password?
              </Link>
            </div>
            <Button className='w-full my-5' type='submit' disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : "Sign In"}
            </Button>

            {/* <span>
              <div className='line'></div>
              <p>or</p>
              <div className='line'></div>
            </span>
            <div className='socials'>
              <Link href='#'>
                <Image src={Google} alt='Envelope' />
              </Link>
              <Link href='#'>
                <Image src={Apple} alt='Envelope' />
              </Link>
              <Link href='#'>
                <Image src={Facebook} alt='Envelope' />
              </Link>
            </div> */}
            <p className='text-center'>
              <Link className='text-red-700 font-medium hover:text-black' href='/guest/events'>
                Click here
              </Link>{" "}
              to browse events
            </p>
          </form>
        </Form>
      </div>
      {isSigningIn && <LogoLoader type={2} />}
    </section>
  );
};

export default Login;
