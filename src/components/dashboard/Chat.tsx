"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, ChevronDown, Plus, PlusCircle } from "lucide-react";
import { useGetVendors } from "@/hooks/vendors";
import {
  ConversationItem,
  ConversationMember,
  listenToConversations,
  ensureRTDBConversation,
  conversationIdFor,
} from "@/hooks/chat-firestore";
import { useGetUser } from "@/hooks/user";
import { CustomModal } from "../ui/modal";
import { highlightMatch } from "@/app/components/dashboard/EventCard";

// ───────────────────────────────────────────────────────────────────────────────
// Local types / utils
// ───────────────────────────────────────────────────────────────────────────────

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

// Build a ConversationMember from a user-like object
function toMemberFromUser(u: any): ConversationMember {
  return {
    id: Number(u?.id ?? 0),
    username: u?.username ?? "",
    email: u?.email ?? "",
    first_name: u?.first_name ?? "",
    last_name: u?.last_name ?? "",
    avatar: u?.avatar ?? u?.image ?? "",
    country: u?.country ?? "",
    state: u?.state ?? "",
    preferredCurrency: u?.preferredCurrency ?? u?.Wallet?.currency ?? "",
    currencySymbol: u?.currencySymbol ?? u?.Wallet?.symbol ?? "",
    isVendor: Boolean(u?.isVendor),
    isVerified: Boolean(u?.isVerified),
  };
}

function buildMembersArray(me: any, vendorRow: any): ConversationMember[] {
  const vendorUser = vendorRow?.User
    ? { ...vendorRow.User, ...vendorRow }
    : vendorRow;
  const meMember = toMemberFromUser(me);
  const vendorMember = toMemberFromUser(vendorUser);
  return [meMember, vendorMember];
}

// ───────────────────────────────────────────────────────────────────────────────
// Component
// ───────────────────────────────────────────────────────────────────────────────

interface ChatSidebarProps {
  selectedChatId: string;
  onChatSelect: (chatId: string) => void;
  onMarkAllAsRead: () => void;
}

export function ChatSidebar({
  selectedChatId,
  onChatSelect,
  onMarkAllAsRead,
}: ChatSidebarProps) {
  const { data: session } = useSession();
  const { data: me } = useGetUser();

  const meId = String(session?.user?.id ?? me?.id ?? "");

  // Live conversation list (RTDB)
  const [conversations, setConversations] = useState<ConversationItem[]>([]);

  // Local UI: clear unread after user clicks
  const [readOverrides, setReadOverrides] = useState<Record<string, boolean>>(
    {}
  );

  const [searchQuery, setSearchQuery] = useState(""); // chats search
  const [filterType, setFilterType] = useState<FilterType>("all");

  // Vendor picker (for starting new conversation)
  const [showVendorModal, setShowVendorModal] = useState(false);
  const { data: vendors = [] } = useGetVendors({ pageSize: 100 });

  // NEW: vendor search state
  const [vendorQuery, setVendorQuery] = useState("");

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
    onMarkAllAsRead?.();
  };

  const handleChatSelect = (chatId: string) => {
    setReadOverrides((prev) => ({ ...prev, [chatId]: true }));
    onChatSelect(chatId);
  };

  // Start a new conversation with a vendor
  async function handleStartChatWithVendor(vendorRow: any) {
    if (!meId) return;

    console.log(vendorRow);
    const vendorUserId = String(vendorRow?.User?.id ?? vendorRow?.UserId);
    if (!vendorUserId) return;

    const convId = conversationIdFor(meId, vendorUserId);
    const members = buildMembersArray(me ?? session?.user ?? { id: meId }, {
      ...vendorRow,
      avatar: vendorRow?.User?.avatar,
    });

    try {
      // 1) Seed RTDB for both users with members & meta
      await ensureRTDBConversation({
        userId: meId,
        peerId: vendorUserId,
        convId,
        members, // includes both avatars
        initiatorId: meId,
      });

      setShowVendorModal(false);
      setVendorQuery(""); // clear vendor search
      handleChatSelect(convId);
    } catch (e) {
      console.error("Failed to start chat:", e);
    }
  }

  // --- Vendor search helpers ---
  const vendorNameOf = (v: any): string => {
    const name =
      [v?.first_name ?? v?.User?.first_name, v?.last_name ?? v?.User?.last_name]
        .filter(Boolean)
        .join(" ") ||
      v?.User?.username ||
      v?.User?.email ||
      `User ${v?.User?.id ?? v?.id}`;
    return name;
  };

  const filteredVendors = useMemo(() => {
    const q = vendorQuery.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter((v: any) =>
      vendorNameOf(v).toLowerCase().includes(q)
    );
  }, [vendors, vendorQuery]);

  console.log(olderChats);
  // UI
  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full md:w-80 bg-sidebar border-r border-sidebar-border flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sidebar-foreground">Chats</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-red-700 w-auto hover:text-red-700 hover:bg-red-100 transition-colors duration-200"
            >
              Mark all as read
            </Button>
          </div>
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
      <div className="flex-1 overflow-y-auto">
        {/* Most Recent */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sidebar-foreground text-sm">Most recent</h2>
              {filterType !== "all" && (
                <Badge className="text-xs px-2 py-0.5">
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </Badge>
              )}
            </div>

            <div className="flex gap-1 items-center">
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
              <PlusCircle
                onClick={() => {
                  setShowVendorModal(true);
                  setVendorQuery(""); // clear previous search when opening
                }}
                size={20}
                className="cursor-pointer hover:text-red-500"
              />
            </div>
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
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-sidebar-accent ${
                    selectedChatId === chat.id ? "bg-sidebar-accent" : ""
                  }`}
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={chat.avatar} alt={chat.name} />
                      <AvatarFallback>
                        {chat.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sidebar-foreground truncate">
                        {chat.name}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {chat.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {chat.unread && (
                      <Button
                        size="icon"
                        variant="destructive"
                        className="w-4 h-4 p-0 text-xs bg-red-700"
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
          <div className="p-4">
            <h2 className="text-sidebar-foreground text-sm mb-3">Older</h2>
            <div className="space-y-1">
              {olderChats.map((chat, index) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: (recentChats.length + index) * 0.05,
                    duration: 0.2,
                  }}
                  onClick={() => handleChatSelect(chat.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-sidebar-accent ${
                    selectedChatId === chat.id ? "bg-sidebar-accent" : ""
                  }`}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={chat.avatar} alt={chat.name} />
                    <AvatarFallback>
                      {chat.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sidebar-foreground truncate">
                        {chat.name}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {chat.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {chat.unread && (
                      <Button
                        size="icon"
                        variant="destructive"
                        className="w-4 h-4 p-0 text-xs bg-red-700"
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
      </div>

      {/* Vendor picker modal */}
      <CustomModal
        title="Start a conversation"
        description="Pick a vendor to message."
        open={showVendorModal}
        setOpen={() => {
          setShowVendorModal(false);
          setVendorQuery("");
        }}
        className="max-w-[720px]"
      >
        {/* NEW: vendor search input */}
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute z-10 left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search vendors by name"
              value={vendorQuery}
              onChange={(e) => setVendorQuery(e.target.value)}
              className="pl-10 border"
            />
          </div>
        </div>

        <div className="max-h-[80vh] overflow-auto space-y-2 pr-1">
          {filteredVendors.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              {vendorQuery ? "No vendors match your search" : "No vendors"}
            </div>
          ) : (
            filteredVendors.map((v: any) => {
              const name = vendorNameOf(v);
              const avatar = v?.User?.avatar ?? "";
              const location = [
                v?.state ?? v?.User?.state,
                v?.country ?? v?.User?.country,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <div
                  key={v?.User?.id ?? v?.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-accent/40"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={avatar} alt={name} />
                      <AvatarFallback>
                        {name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      {/* highlight vendor name */}
                      <p className="line-clamp-1">
                        {highlightMatch(name, vendorQuery)}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleStartChatWithVendor(v)}
                      className="bg-red-700 hover:bg-red-800 w-auto"
                    >
                      Send message
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CustomModal>
    </motion.div>
  );
}
