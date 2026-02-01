"use client";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { formJoinSprayRoom } from "@/app/components/schema/Forms";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Coins } from "@/components/assets/images/icon/Coins";
import { CustomModal } from "../general/Modal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Alhaji from "@/components/assets/images/dashboard/spray/Alhaji VIP.png";
import Digital from "@/components/assets/images/dashboard/spray/Digital Oracle.png";
import Inkosi from "@/components/assets/images/dashboard/spray/Inkosi yenkosi.png";
import Lion from "@/components/assets/images/dashboard/spray/Lion sprayer.png";
import Masked from "@/components/assets/images/dashboard/spray/Masked Legend.png";
import Mswali from "@/components/assets/images/dashboard/spray/Mswali wa Heshima.png";
import Oloye from "@/components/assets/images/dashboard/spray/Oloye.png";
import Queen from "@/components/assets/images/dashboard/spray/Queen Naira.png";
import Sarkin from "@/components/assets/images/dashboard/spray/Sarkin Gida.png";
import Logo from "@/components/assets/images/dashboard/Logo.png";
import { StreamReactionType } from "@/hooks/comment";
import {
  Trophy,
  Crown,
  Medal,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EventLeaderboardEntry } from "@/hooks/events";

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

  console.log(data);
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
      (a, b) => (b.cowrieAmount ?? -Infinity) - (a.cowrieAmount ?? -Infinity),
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
    [leaderboard],
  );

  const displayName = (u?: Leader) =>
    u?.senderName || u?.senderUsername || "--";
  const displayAmount = (u?: Leader) =>
    u?.cowrieAmount != null ? u.cowrieAmount.toLocaleString() : "--";
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
                  <p className="text-sm">{displayAmount(first)}</p>
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

interface LiveLeaderboardProps {
  data: EventLeaderboardEntry[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function LiveLeaderboard({
  data,
  isCollapsed = false,
  onToggleCollapse,
}: LiveLeaderboardProps) {
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);

  if (!data || data.length === 0) return null;

  const topThree = data.slice(0, 3);
  const hasMore = data.length > 3;

  return (
    <>
      {/* Compact/Collapsed Leaderboard */}
      <div className="absolute top-20 left-4 z-[110]">
        <AnimatePresence mode="wait">
          {isCollapsed ? (
            // Minimized state - just a button
            <motion.button
              key="collapsed"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onToggleCollapse}
              className="bg-black/60 backdrop-blur-xl rounded-2xl border border-yellow-500/20 shadow-2xl p-3 hover:bg-black/70 transition-all group"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-yellow-500/20">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                </div>
                <span className="text-white text-sm font-bold">
                  {data.length}
                </span>
                <Maximize2 className="w-3.5 h-3.5 text-white/60 group-hover:text-white transition-colors" />
              </div>
            </motion.button>
          ) : (
            // Expanded state - full leaderboard
            <motion.div
              key="expanded"
              initial={{ scale: 0.8, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-black/60 backdrop-blur-xl rounded-2xl border border-yellow-500/20 shadow-2xl overflow-hidden max-w-[280px]"
            >
              {/* Header with collapse button */}
              <div className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 px-3 py-2 border-b border-yellow-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-yellow-500/20">
                      <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                    </div>
                    <h3 className="text-white text-xs font-bold">
                      Top Sprayers
                    </h3>
                  </div>
                  <button
                    onClick={onToggleCollapse}
                    className="p-1 rounded-lg hover:bg-white/10 transition-all group"
                    title="Minimize"
                  >
                    <Minimize2 className="w-3.5 h-3.5 text-white/60 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </div>

              {/* Top 3 List with animations */}
              <div className="p-2 space-y-1.5">
                <AnimatePresence mode="popLayout">
                  {topThree.map((leader, index) => (
                    <motion.div
                      key={leader.senderId}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-xl transition-all",
                        index === 0 &&
                          "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20",
                        index === 1 && "bg-white/5",
                        index === 2 && "bg-white/5",
                      )}
                    >
                      {/* Rank Badge with animation */}
                      <div className="flex-shrink-0">
                        {index === 0 && (
                          <motion.div
                            className="relative"
                            animate={{
                              rotate: [0, -10, 10, -10, 0],
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 3,
                            }}
                          >
                            <Crown className="w-5 h-5 text-yellow-400 drop-shadow-lg" />
                            <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white text-[8px] font-bold rounded-full w-3 h-3 flex items-center justify-center">
                              1
                            </div>
                          </motion.div>
                        )}
                        {index === 1 && (
                          <div className="relative">
                            <Medal className="w-5 h-5 text-gray-300" />
                            <div className="absolute -bottom-1 -right-1 bg-gray-400 text-white text-[8px] font-bold rounded-full w-3 h-3 flex items-center justify-center">
                              2
                            </div>
                          </div>
                        )}
                        {index === 2 && (
                          <div className="relative">
                            <Medal className="w-5 h-5 text-orange-400" />
                            <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[8px] font-bold rounded-full w-3 h-3 flex items-center justify-center">
                              3
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Avatar with pulse effect for #1 */}
                      <div className="relative">
                        <Image
                          src={leader.senderAvatar || "/noavatar.png"}
                          alt="Avatar"
                          width={28}
                          height={28}
                          className="rounded-full object-cover border-2 border-white/20"
                        />
                        {index === 0 && (
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-yellow-400"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 0, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-semibold truncate">
                          @{leader.senderId}
                        </p>
                        <div className="flex items-center gap-1">
                          <Coins />
                          <motion.span
                            key={leader.cowrieAmount}
                            initial={{ scale: 1.2, color: "#fbbf24" }}
                            animate={{ scale: 1, color: "#fbbf24" }}
                            className="text-yellow-400 text-[10px] font-bold"
                          >
                            {leader.cowrieAmount.toLocaleString()}
                          </motion.span>
                        </div>
                      </div>

                      {/* Spray Count with badge */}
                      {index === 0 && (
                        <div className="flex-shrink-0 bg-yellow-500/20 px-2 py-0.5 rounded-full">
                          <span className="text-yellow-400 text-[10px] font-bold">
                            {leader.sprayCount}x
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* View More Button */}
              {hasMore && (
                <button
                  onClick={() => setShowFullLeaderboard(true)}
                  className="w-full py-2 px-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20 border-t border-yellow-500/20 transition-all group"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-yellow-400 text-xs font-semibold">
                      View All {data.length}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-yellow-400 group-hover:translate-y-0.5 transition-transform" />
                  </div>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Full Leaderboard Modal */}
      <AnimatePresence>
        {showFullLeaderboard && (
          <FullLeaderboardModal
            data={data}
            onClose={() => setShowFullLeaderboard(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

interface FullLeaderboardModalProps {
  data: EventLeaderboardEntry[];
  onClose: () => void;
}

function FullLeaderboardModal({ data, onClose }: FullLeaderboardModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative bg-gradient-to-b from-zinc-900 via-black to-black rounded-3xl border-2 border-yellow-500/20 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 backdrop-blur-xl border-b border-yellow-500/20">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border border-yellow-500/30">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-xl">Leaderboard</h2>
                <p className="text-white/60 text-sm">
                  Top {data.length} sprayers
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Top 3 Podium */}
          <div className="px-5 pb-5">
            <div className="grid grid-cols-3 gap-3">
              {/* 2nd Place */}
              {data[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-2">
                    <Image
                      src={data[1].senderAvatar || "/noavatar.png"}
                      alt="2nd"
                      width={60}
                      height={60}
                      className="rounded-full border-4 border-gray-300 shadow-lg"
                    />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                      2
                    </div>
                  </div>
                  <p className="text-white text-xs font-semibold text-center truncate w-full">
                    @{data[1].senderId}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Coins />
                    <span className="text-yellow-400 text-xs font-bold">
                      {data[1].cowrieAmount.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* 1st Place - Larger with crown animation */}
              {data[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                  className="flex flex-col items-center -mt-4"
                >
                  <div className="relative mb-2">
                    <motion.div
                      className="absolute -top-6 left-1/2 -translate-x-1/2"
                      animate={{
                        y: [0, -5, 0],
                        rotate: [-5, 5, -5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Crown className="w-6 h-6 text-yellow-400 drop-shadow-lg" />
                    </motion.div>
                    <Image
                      src={data[0].senderAvatar || "/noavatar.png"}
                      alt="1st"
                      width={80}
                      height={80}
                      className="rounded-full border-4 border-yellow-400 shadow-2xl shadow-yellow-500/50"
                    />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg">
                      1
                    </div>
                  </div>
                  <p className="text-white text-sm font-bold text-center truncate w-full">
                    @{data[0].senderId}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                    <Coins />
                    <motion.span
                      key={data[0].cowrieAmount}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-yellow-400 text-sm font-bold"
                    >
                      {data[0].cowrieAmount.toLocaleString()}
                    </motion.span>
                  </div>
                </motion.div>
              )}

              {/* 3rd Place */}
              {data[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-2">
                    <Image
                      src={data[2].senderAvatar || "/noavatar.png"}
                      alt="3rd"
                      width={60}
                      height={60}
                      className="rounded-full border-4 border-orange-400 shadow-lg"
                    />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-400 to-orange-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                      3
                    </div>
                  </div>
                  <p className="text-white text-xs font-semibold text-center truncate w-full">
                    @{data[2].senderId}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Coins />
                    <span className="text-yellow-400 text-xs font-bold">
                      {data[2].cowrieAmount.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable List */}
        <div className="overflow-y-auto max-h-[calc(85vh-280px)] px-5 py-4 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {data.slice(3).map((leader, index) => (
              <motion.div
                key={leader.senderId}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.02 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-yellow-500/20 transition-all mb-2"
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center">
                  <span className="text-white/80 text-sm font-bold">
                    {index + 4}
                  </span>
                </div>

                {/* Avatar */}
                <Image
                  src={leader.senderAvatar || "/noavatar.png"}
                  alt="Avatar"
                  width={40}
                  height={40}
                  className="rounded-full object-cover border-2 border-white/20"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">
                    @{leader.senderId}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1">
                      <Coins />
                      <span className="text-yellow-400 text-xs font-bold">
                        {leader.cowrieAmount.toLocaleString()}
                      </span>
                    </div>
                    {leader.highestBadge && (
                      <>
                        <span className="text-white/30">•</span>
                        <span className="text-white/60 text-xs truncate">
                          {leader.highestBadge}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Spray Count */}
                <div className="flex-shrink-0 flex flex-col items-end">
                  <span className="text-white/40 text-xs">Sprays</span>
                  <span className="text-white text-sm font-bold">
                    {leader.sprayCount}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {data.length <= 3 && (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No more sprayers yet</p>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="sticky bottom-0 bg-gradient-to-t from-black via-black/95 to-transparent px-5 py-4 border-t border-white/5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-white/40 text-xs">Total Sprayers</p>
              <p className="text-white text-lg font-bold">{data.length}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs">Total Sprays</p>
              <p className="text-white text-lg font-bold">
                {data.reduce((sum, l) => sum + l.sprayCount, 0)}
              </p>
            </div>
            <div>
              <p className="text-white/40 text-xs">Total Cowries</p>
              <p className="text-yellow-400 text-lg font-bold">
                {data
                  .reduce((sum, l) => sum + l.cowrieAmount, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export const JoinSpray = ({ data, setData }: any) => {
  const form = useForm<z.infer<typeof formJoinSprayRoom>>({
    resolver: zodResolver(formJoinSprayRoom),
  });
  const router = useRouter();

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
            <Button className="w-full" type="submit">
              Proceed
            </Button>
          </form>
        </Form>
      </CustomModal>
    </>
  );
};

export const SPRAY_OPTIONS = [
  { image: Logo, price: 0, isCustom: true, video: "/video/lion.mp4" },
  { image: Oloye, price: 1, video: "/video/oloye.mp4" },
  { image: Digital, price: 3, video: "/video/lion.mp4" },
  { image: Masked, price: 5, video: "/video/lion.mp4" },
  { image: Queen, price: 10, video: "/video/odogwu.mp4" },
  { image: Mswali, price: 15, video: "/video/mswali.mp4" },
  { image: Alhaji, price: 20, video: "/video/alhaji.mp4" },
  { image: Sarkin, price: 30, video: "/video/sarkin.mp4" },
  { image: Inkosi, price: 40, video: "/video/inkosi.mp4" },
  { image: Oloye, price: 50, video: "/video/oloye.mp4" },
  { image: Digital, price: 60, video: "/video/lion.mp4" },
  { image: Masked, price: 70, video: "/video/lion.mp4" },
  { image: Queen, price: 90, video: "/video/odogwu.mp4" },
  { image: Lion, price: 100, video: "/video/Lion.mp4" },
];

// Common reactions
export const COMMON_REACTIONS = [
  { emoji: "❤️", type: "like", label: "Like" },
  { emoji: "🔥", type: "fire", label: "Fire" },
  { emoji: "👏", type: "clap", label: "Clap" },
  { emoji: "😂", type: "laugh", label: "Laugh" },
  { emoji: "😍", type: "love", label: "Love" },
  { emoji: "🎉", type: "celebrate", label: "Celebrate" },
];

const REACTION_ICONS: Record<StreamReactionType, React.ReactNode> = {
  like: <span className="text-4xl">❤️</span>,
  love: <span className="text-4xl">😍</span>,
  fire: <span className="text-4xl">🔥</span>,
  laugh: <span className="text-4xl">😂</span>,
  clap: <span className="text-4xl">👏</span>,
  celebrate: <span className="text-4xl">🎉</span>,
  thumbsup: <span className="text-4xl">👍</span>,
};

const getReactionGlow = (type: StreamReactionType): string => {
  const glowColors: Record<StreamReactionType, string> = {
    like: "radial-gradient(circle, rgba(244, 63, 94, 0.8), transparent)",
    love: "radial-gradient(circle, rgba(236, 72, 153, 0.8), transparent)",
    fire: "radial-gradient(circle, rgba(249, 115, 22, 0.8), transparent)",
    laugh: "radial-gradient(circle, rgba(234, 179, 8, 0.8), transparent)",
    clap: "radial-gradient(circle, rgba(147, 51, 234, 0.8), transparent)",
    celebrate: "radial-gradient(circle, rgba(59, 130, 246, 0.8), transparent)",
    thumbsup: "radial-gradient(circle, rgba(34, 197, 94, 0.8), transparent)",
  };
  return glowColors[type] || glowColors.like;
};

export const FloatingReaction = ({ type }: { type: StreamReactionType }) => {
  const spawnPoints = [
    { bottom: 100, right: 10 },
    { bottom: 120, right: 80 },
    { bottom: 110, right: 150 },
    { bottom: 130, right: 220 },
    { bottom: 115, right: 290 },
    { bottom: 125, right: 360 },
    { bottom: 105, right: 430 },
  ];

  const randomSpawnIndex = Math.floor(Math.random() * spawnPoints.length);
  const spawnPosition = spawnPoints[randomSpawnIndex];

  const curveIntensity = 40 + Math.random() * 60;
  const curveDirection = Math.random() > 0.5 ? 1 : -1;

  const duration = 3 + Math.random() * 2;
  const delay = Math.random() * 0.4;

  const startScale = 0.8 + Math.random() * 0.4;
  const endScale = 0.3 + Math.random() * 0.3;

  const rotation = -30 + Math.random() * 60;

  const withBlur = Math.random() > 0.8;

  return (
    <div
      className={`floating-reaction-modern fixed pointer-events-none z-[150] ${withBlur ? "with-blur" : ""}`}
      style={{
        bottom: `${spawnPosition.bottom}px`,
        right: `${spawnPosition.right}px`,
        ["--curve-x" as any]: `${curveIntensity * curveDirection}px`,
        ["--duration" as any]: `${duration}s`,
        ["--delay" as any]: `${delay}s`,
        ["--start-scale" as any]: startScale,
        ["--end-scale" as any]: endScale,
        ["--rotation" as any]: `${rotation}deg`,
      }}
    >
      <div className="relative">
        <div
          className="absolute inset-0 blur-xl opacity-60 pointer-events-none"
          style={{
            background: getReactionGlow(type),
            transform: "scale(1.5)",
          }}
        />

        <div className="relative drop-shadow-2xl">
          {REACTION_ICONS[type] || REACTION_ICONS.like}
        </div>
      </div>
    </div>
  );
};
