"use client";
import { SkeletonDemo } from "@/components/ui/skeleton";
import { useGetStreamEventComments } from "@/hooks/guest";
import { Loader2, Send } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  formJoinSprayRoom,
  formSchemaComment,
} from "@/app/components/schema/Forms";
import { usePostStreamComment } from "@/hooks/comment";
import { Input } from "@/components/ui/input";
import { Empty } from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { shortenText } from "@/lib/auth-helper";
import { Coins } from "@/components/assets/images/icon/Coins";
import { CustomModal } from "../general/Modal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const Livechat = ({ user, eventId }: any) => {
  const { data: eventComments, status } = useGetStreamEventComments(eventId);
  const [showAllComments, setShowAllComments] = useState(false);
  const postComment = usePostStreamComment();
  const [comments, setComments] = useState<any>([]);

  const form = useForm<z.infer<typeof formSchemaComment>>({
    resolver: zodResolver(formSchemaComment),
  });

  useEffect(() => {
    if (eventComments) setComments(eventComments);
  }, [eventComments]);

  const onSubmit = (values: z.infer<typeof formSchemaComment>) => {
    postComment.mutate(
      {
        userId: user?.id,
        eventId,
        content: values.comment,
      },
      {
        onSuccess: () =>
          form.reset({
            comment: "",
          }),
      }
    );
  };

  const displayedComments = showAllComments
    ? comments || []
    : (comments || []).slice(0, 7);

  if (status !== "success") return <SkeletonDemo />;
  return (
    <div className="flex flex-col overflow-hidden mt-4 bg-white rounded-xl">
      <div className="flex flex-col gap-3 p-4">
        {comments?.length > 0 ? (
          displayedComments?.map((comment: any) => (
            <div className="flex gap-2">
              <Image
                src={comment?.user?.avatar || "/noavatar.png"}
                alt="zac"
                width={100}
                height={100}
                className="h-[30px] w-[30px] rounded-full"
              />
              <div className="flex flex-col gap-[2px] pb-4 w-full">
                <p className="text-black font-medium">
                  {comment?.user?.username}
                </p>
                <p className="leading-normal">{comment?.content}</p>
              </div>
            </div>
          ))
        ) : (
          <Empty title="No comments" />
        )}
      </div>
      <div className="flex items-center justify-end">
        {comments?.length > 6 && (
          <p
            onClick={() => setShowAllComments((prev) => !prev)}
            className="text-red-700 cursor-pointer hover:underline"
          >
            {showAllComments ? "See Some" : "See All"}
          </p>
        )}
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex sticky bottom-0 justify-center gap-2 items-center border-t px-4 py-10"
        >
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem className="w-full">
                <Input
                  placeholder="Say something nice"
                  className="bg-gray-100 w-full"
                  {...field}
                />
                <FormMessage className="absolute top-[10px]" />
              </FormItem>
            )}
          />
          <button
            disabled={postComment.isPending}
            type="submit"
            className="bg-red-700 rounded-full flex items-center justify-centers p-[7px] hover:bg-red-600 h-8 w-8"
          >
            {postComment.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-white relative" />
            ) : (
              <Send className="text-white relative" />
            )}
          </button>
        </form>
      </Form>
    </div>
  );
};

type Leader = {
  senderId?: number | string;
  senderName?: string;
  senderUsername?: string;
  senderAvatar?: string;
  cowrieAmount?: number;
  displayCurrencySymbol?: string;
};

export function TopLeaders({
  isAnimation,
  data,
  rate = 1,
}: {
  isAnimation?: boolean;
  data?: Leader[];
  rate?: number;
}) {
  const [leaderboard, setLeaderboard] = useState<Leader[]>([]);
  const prevFirstId = useRef<number | string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [canPlayAudio, setCanPlayAudio] = useState(false);

  // preload / permission for audio (once)
  useEffect(() => {
    if (!isAnimation) return;
    audioRef.current = new Audio("/success.mp3");

    const enableAudio = () => {
      setCanPlayAudio(true);
      window.removeEventListener("click", enableAudio);
    };
    window.addEventListener("click", enableAudio);
    return () => window.removeEventListener("click", enableAudio);
  }, [isAnimation]);

  // normalize incoming data and set initial sorted leaderboard
  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) {
      setLeaderboard([]);
      prevFirstId.current = null;
      return;
    }

    // Normalize & keep only valid rows
    const cleaned = data.filter(Boolean).map((d) => ({
      senderId:
        d.senderId ?? `${d.senderUsername ?? d.senderName ?? Math.random()}`,
      senderName: d.senderName,
      senderUsername: d.senderUsername,
      senderAvatar: d.senderAvatar,
      cowrieAmount:
        typeof d.cowrieAmount === "number" ? d.cowrieAmount : undefined,
      displayCurrencySymbol: d.displayCurrencySymbol,
    }));

    // Sort descending by amount for a stable initial ranking
    cleaned.sort(
      (a, b) => (b.cowrieAmount ?? -Infinity) - (a.cowrieAmount ?? -Infinity)
    );

    setLeaderboard(cleaned);
    prevFirstId.current = cleaned[0]?.senderId ?? null;
  }, [data]);

  // animate / rotate leaders to trigger confetti/audio when the top changes
  useEffect(() => {
    if (!isAnimation || leaderboard.length === 0) return;

    const interval = setInterval(() => {
      setLeaderboard((prev) => {
        if (prev.length === 0) return prev;

        // shuffle a copy; you can replace with any rotation scheme you prefer
        const shuffled = [...prev].sort(() => Math.random() - 0.5);

        const newFirst = shuffled[0]?.senderId ?? null;
        if (newFirst !== prevFirstId.current) {
          prevFirstId.current = newFirst;

          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

          if (audioRef.current && canPlayAudio) {
            audioRef.current.currentTime = 0;
            audioRef.current
              .play()
              .catch((err) => console.warn("Playback failed:", err));
          }
        }
        return shuffled;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [isAnimation, canPlayAudio, leaderboard.length]);

  const [first, second, third] = useMemo(
    () => [leaderboard[0], leaderboard[1], leaderboard[2]],
    [leaderboard]
  );

  const displayName = (u?: Leader) =>
    u?.senderName || u?.senderUsername || "--";
  const displayAmount = (u?: Leader) =>
    u?.cowrieAmount != null
      ? (u.cowrieAmount * (rate ?? 1)).toLocaleString()
      : "--";
  const symbol = (u?: Leader) => u?.displayCurrencySymbol || "";

  return (
    <div className="grid border-b grid-cols-2 gap-4 p-4">
      <AnimatePresence mode="popLayout">
        <motion.div
          layout
          key={first?.senderId ?? "first-empty"}
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
            layout: { duration: 0.6, ease: "easeInOut" },
          }}
          className="flex items-center gap-4"
        >
          <h2 className="bg-[linear-gradient(180deg,_#FBCE46_0%,_#93730D_100%)] bg-clip-text text-transparent lg:text-[60px] font-[800]">
            1
          </h2>

          {first ? (
            <div className="flex gap-2 items-center">
              <Image
                src={first.senderAvatar || "/noavatar.png"}
                alt="Avatar"
                width={50}
                height={50}
                className="rounded-full max-w-[40px] h-[40px] object-cover"
              />
              <div className="space-y-2">
                <p className="font-medium line-clamp-1 text-sm text-black">
                  {displayName(first)}
                </p>
                <div className="flex items-center gap-2">
                  <Coins />
                  <p className="text-sm">
                    {symbol(first)}
                    {displayAmount(first)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            "--"
          )}
        </motion.div>
      </AnimatePresence>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {[second, third].map((item, index) => (
            <motion.div
              key={(item?.senderId ?? `slot-${index + 2}`).toString()}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: 0.6,
                ease: "easeInOut",
                layout: { duration: 0.6, ease: "easeInOut" },
              }}
              className="flex items-center gap-4"
            >
              <h2 className="bg-[linear-gradient(180deg,_#FBCE46_0%,_#93730D_100%)] bg-clip-text text-transparent lg:text-[40px] font-[800]">
                {index + 2}
              </h2>

              {item ? (
                <div className="flex gap-2 items-center">
                  <Image
                    src={item.senderAvatar || "/noavatar.png"}
                    alt="Avatar"
                    width={30}
                    height={30}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium line-clamp-1 text-sm text-black">
                      {displayName(item)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Coins />
                      <p className="text-sm">
                        {symbol(item)}
                        {displayAmount(item)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                "--"
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function Leaderboard({ data, rate = 1 }: any) {
  const [leaderboard, setLeaderboard] = useState(data);
  useEffect(() => {
    const interval = setInterval(() => {
      setLeaderboard((prev: any) => {
        const shuffled = [...prev].sort(() => 0.5 - Math.random());
        return shuffled;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const remaining = leaderboard.slice(3); // Skip top 3

  if (leaderboard.length < 4) return null;
  return (
    <div className="space-y-4">
      <div className="w-full overflow-x-auto">
        <table className="min-w-full text-left text-sm border-collapse">
          <thead className="border-b">
            <tr>
              <th className="px-4 py-3 sm:text-[15px]">Rank</th>
              <th className="px-4 py-3 sm:text-[15px]">Name</th>
              <th className="px-4 py-3 sm:text-[15px]">Amount</th>
            </tr>
          </thead>
          <AnimatePresence mode="popLayout">
            {remaining.map((item: any, index: number) => (
              <motion.tr
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="border-b"
              >
                <td className="px-4 py-3">{index + 4}</td>
                <td className="py-2 px-3">
                  {item?.senderName || item?.senderUsername || ""}
                </td>
                <td className="px-4 py-2 border-b">
                  {item?.displayCurrencySymbol || ""}
                  {(item?.cowrieAmount * rate).toLocaleString()}
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </table>
      </div>
    </div>
  );
}

export const JoinSpray = ({ data, setData }: any) => {
  const form = useForm<z.infer<typeof formJoinSprayRoom>>({
    resolver: zodResolver(formJoinSprayRoom),
  });
  const router = useRouter();

  console.log(form?.formState.errors);

  const onSubmit = (values: z.infer<typeof formJoinSprayRoom>) => {
    router.push(`/dashboard/spray/${data?.id}`);
  };

  return (
    <>
      <CustomModal
        open={data}
        className="max-w-[550px]"
        setOpen={setData}
        title="Lets Make it Rain!"
      >
        <Form {...form}>
          <form
            className="w-full space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Name</FormLabel>
                  <Input placeholder="Enter name (optional)" {...field} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <Input
                    placeholder="Enter description (optional)"
                    {...field}
                  />
                  <p className="text-xs">
                    How should the musician hype you? (e.g Big Boss, Odogwu)
                  </p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recipient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient selection</FormLabel>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    {["Celebrant", "Musician", "Both"].map((m: any) => (
                      <label
                        key={m}
                        className="flex cursor-pointer hover:text-red-700 items-center gap-2 py-[2px]"
                      >
                        <RadioGroupItem value={m} /> {m}
                      </label>
                    ))}
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit">
              Proceed
            </Button>
          </form>
        </Form>
      </CustomModal>
    </>
  );
};

const leaderboardData = [
  { id: 1, username: "Abdul Kabir", amount: "#500,000", avatar: null },
  { id: 2, username: "Mr Michael", amount: "#300,000", avatar: null },
  { id: 3, username: "@Johnson joy", amount: "#300,000", avatar: null },
  { id: 4, username: "Favour Chigozie", amount: "#250,000", avatar: null },
  { id: 5, username: "Esther A.", amount: "#200,000", avatar: null },
  { id: 6, username: "Blessing I.", amount: "#180,000", avatar: null },
  { id: 7, username: "Emmanuel K.", amount: "#160,000", avatar: null },
  { id: 8, username: "Queen Ire", amount: "#140,000", avatar: null },
  { id: 9, username: "Dimeji Akin", amount: "#120,000", avatar: null },
  { id: 10, username: "Muna Okoro", amount: "#100,000", avatar: null },
];
