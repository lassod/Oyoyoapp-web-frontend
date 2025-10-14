"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, ChevronDown, PlusCircle } from "lucide-react";
import {
  ConversationItem,
  ConversationMember,
  listenToConversations,
} from "@/hooks/chat-firestore";
import { useGetUser } from "@/hooks/user";
import Image from "next/image";

type FilterType = "all" | "unread" | "read" | "online";

/** Row the sidebar renders */
type ChatRow = {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string; // "HH:MM"
  unread: boolean;
  online: boolean; // placeholder (no presence payload yet)
};

function safeName(m?: ConversationMember): string {
  if (!m) return "Unknown";
  const full = [m.first_name, m.last_name].filter(Boolean).join(" ").trim();
  return full || m.username || m.email || `User ${m.id}`;
}

function timeFromMs(ms?: number): string {
  if (!ms) return "";
  try {
    const d = new Date(ms);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

interface ChatSidebarProps {
  selectedChatId: string;
  onChatSelect: (chatId: string) => void;
  setVendorQuery: (chatId: string) => void;
  setShowVendorModal: (chatId: boolean) => void;
  setIsClose: (close: boolean) => void;
}

export function ChatSidebar({
  selectedChatId,
  onChatSelect,
  setShowVendorModal,
  setVendorQuery,
  setIsClose,
}: ChatSidebarProps) {
  const { data: session } = useSession();
  const { data: me } = useGetUser();
  const meId = String(session?.user?.id ?? me?.id ?? "");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [readOverrides, setReadOverrides] = useState<Record<string, boolean>>(
    {}
  );
  const [searchQuery, setSearchQuery] = useState(""); // chats search
  const [filterType, setFilterType] = useState<FilterType>("all");

  useEffect(() => {
    if (!meId) return;
    const unsub = listenToConversations(meId, (items) =>
      setConversations(items)
    );
    return () => unsub();
  }, [meId]);

  // Map RTDB → ChatRow for the sidebar
  const allChats: ChatRow[] = useMemo(() => {
    const list = Array.isArray(conversations) ? conversations : [];
    console.log(list);
    return list.map((row) => {
      const other =
        row.members?.find((m) => String(m.id) !== meId) ?? row.members?.[0];

      return {
        id: row.id,
        name: safeName(other),
        // 👇 Prefer member avatar; fall back to the per-row avatar stored in RTDB
        avatar: other?.avatar || (row as any)?.avatar || "",
        lastMessage: String(row.message ?? ""),
        time: timeFromMs(row.updated),
        unread: !row.seen && !readOverrides[row.id],
        online: false,
      };
    });
  }, [conversations, meId, readOverrides]);

  // Search & filter (chats)
  const filteredChats = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const matches = (name: string) => name.toLowerCase().includes(q);

    return allChats.filter((chat) => {
      const match = matches(chat.name);
      switch (filterType) {
        case "unread":
          return match && chat.unread;
        case "read":
          return match && !chat.unread;
        case "online":
          return match && chat.online;
        default:
          return match;
      }
    });
  }, [allChats, filterType, searchQuery]);

  // Presentational split
  const recentChats = filteredChats.slice(0, 4);
  const olderChats = filteredChats.slice(4);

  // Actions
  const handleMarkAllAsRead = () => {
    setReadOverrides((prev) => {
      const next = { ...prev };
      for (const c of allChats) next[c.id] = true;
      return next;
    });
  };

  const handleChatSelect = (chatId: string) => {
    setReadOverrides((prev) => ({ ...prev, [chatId]: true }));
    onChatSelect(chatId);
    setIsClose(false);
  };

  console.log(olderChats);
  // UI
  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full relative  md:w-80 bg-sidebar border-r border-sidebar-border flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-3 relative border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sidebar-foreground flex md:hidden absolute -top-4">
            Chats
          </h3>
          {/* <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-red-700 w-auto hover:text-red-700 hover:bg-red-100 transition-colors duration-200"
            >
              Mark all as read
            </Button>
          </div> */}
        </div>

        {/* Search (chats) */}
        <div className="relative">
          <Search className="absolute z-10 left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 relative overflow-y-auto">
        {/* Most Recent */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sidebar-foreground text-sm">Most recent</h2>
              {filterType !== "all" && (
                <Badge className="text-xs px-2 py-0.5">
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </Badge>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 w-auto hover:bg-sidebar-accent"
                >
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <ChevronDown className="w-3 h-3 ml-1 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => setFilterType("all")}>
                  All chats
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("unread")}>
                  Unread
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("read")}>
                  Read
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("online")}>
                  Online
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-1">
            {recentChats.length === 0 && olderChats.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">
                  {searchQuery
                    ? "No chats match your search"
                    : `No ${filterType} chats found`}
                </p>
              </div>
            ) : (
              recentChats.map((chat, index) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  onClick={() => handleChatSelect(chat.id)}
                  className={`flex items-center gap-2 p-1 rounded-lg cursor-pointer transition-all duration-200 hover:bg-sidebar-accent ${
                    selectedChatId === chat.id ? "bg-sidebar-accent" : ""
                  }`}
                >
                  <div className="relative">
                    <Image
                      src={chat.avatar || "/noavatar.png"}
                      width={200}
                      height={200}
                      alt="Avatar"
                      className="object-contain rounded-full w-6 h-6"
                    />
                    {chat.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="line-clamp-1 text-sm text-black">
                        {chat.name}
                      </p>
                      <span className="text-[10px] line-clamp-1 text-muted-foreground">
                        {chat.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {chat.lastMessage}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {chat.unread && (
                      <Button
                        size="icon"
                        variant="destructive"
                        className="w-3 h-3 p-0 text-[10px] bg-red-700"
                      >
                        1
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Older */}
        {olderChats.length > 0 && (
          <div className="p-3">
            <h2 className="text-sidebar-foreground text-sm mb-3">Older</h2>
            <div className="space-y-1">
              {olderChats.map((chat, index) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  onClick={() => handleChatSelect(chat.id)}
                  className={`flex items-center gap-2 p-1 rounded-lg cursor-pointer transition-all duration-200 hover:bg-sidebar-accent ${
                    selectedChatId === chat.id ? "bg-sidebar-accent" : ""
                  }`}
                >
                  <div className="relative">
                    <Image
                      src={chat.avatar || "/noavatar.png"}
                      width={200}
                      height={200}
                      alt="Avatar"
                      className="object-contain rounded-full w-6 h-6"
                    />
                    {chat.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="line-clamp-1 text-sm text-black">
                        {chat.name}
                      </p>
                      <span className="text-[10px] line-clamp-1 text-muted-foreground">
                        {chat.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {chat.lastMessage}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {chat.unread && (
                      <Button
                        size="icon"
                        variant="destructive"
                        className="w-3 h-3 p-0 text-[10px] bg-red-700"
                      >
                        1
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        <div className="w-full flex items-end justify-end">
          <PlusCircle
            onClick={() => {
              setShowVendorModal(true);
              setVendorQuery("");
            }}
            size={20}
            className="cursor-pointer w-8 h-8 sm:w-14 sm:h-14 fill-red-700 sticky bottom-5 animate-bounce text-white hover:animate-none"
          />
        </div>
      </div>
    </motion.div>
  );
}
