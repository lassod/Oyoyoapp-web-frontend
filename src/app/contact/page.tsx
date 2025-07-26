"use client";
import React from "react";
import Content from "../components/assets/images/Image.svg";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { formSchemaContact } from "../components/schema/Forms";
import Download from "../components/oyoyoLandingPage/download/Download";
import { Reveal2 } from "../components/animations/Text";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const Contact = () => {
  const form = useForm<z.infer<typeof formSchemaContact>>({
    resolver: zodResolver(formSchemaContact),
  });

  const onSubmit = (values: z.infer<typeof formSchemaContact>) => {
    console.log(values);
  };

  return (
    <div>
      <Header />
      <div className="contact mx-auto mt-[90px]">
        <div className="container">
          <h2>Be the first to be reminded</h2>
          <Reveal2>
            <p className="text">
              Be the first to know by signing up to be reminded of this and more
              exciting events.
            </p>
          </Reveal2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="wrapper">
              <div className="flex gap-4 max-w-full">
                <FormField
                  control={form.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem>
                      <Label>First Name</Label>
                      <Input placeholder="First name" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Last Name</Label>
                      <Input placeholder="Last name" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label>Email</Label>
                    <Input placeholder="you@company.com" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={() => (
                  <FormItem className=" ">
                    <Label>Phone number</Label>
                    <div className="select rounded-md border border-gray-300">
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="w-[86px] border-none">
                              <SelectValue placeholder="US" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="+1">US</SelectItem>
                              <SelectItem value="+234">NG</SelectItem>
                              <SelectItem value="+237">GH</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <Input
                              placeholder="+1 (555) 98363"
                              className="border-none px-0"
                              {...field}
                            />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button className="max-w-full" type="submit">
                Next
              </Button>
            </form>
          </Form>
        </div>
        <Image src={Content} alt="Content" />
      </div>
      <Download />
      <Footer className="top-[50px] md:top-[100px]" />
    </div>
  );
};

export default Contact;
