"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useGetUser } from "@/hooks/user";
import { useSession } from "next-auth/react";
import {
  listenToConversations,
  ConversationItem,
  ConversationMember,
  listenToMessagesByConvId,
  sendMessage,
  conversationIdFor,
  ensureRTDBConversation,
} from "@/hooks/chat-firestore";
import { ChatSidebar } from "@/components/dashboard/Chat";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { X, Search, ImagePlus, SendHorizonal, XCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { CustomModal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useGetVendors } from "@/hooks/vendors";
import { highlightMatch } from "@/app/components/dashboard/EventCard";
import { uploadChatImage } from "@/hooks/upload";
import { shortenText } from "@/lib/auth-helper";

interface Message {
  id: string;
  sender: string;
  avatar: string;
  content: string;
  time: string;
  image?: string;
  isOwn?: boolean;
  optimistic?: boolean;
}

type SelectedChatMeta = {
  id: string;
  name: string;
  avatar: string;
  location: string;
  online: boolean;
};

function safeName(m?: ConversationMember): string {
  if (!m) return "Unknown";
  const full = [m.first_name, m.last_name].filter(Boolean).join(" ").trim();
  return full || m.username || m.email || `User ${m.id}`;
}

function safeLocation(m?: ConversationMember): string {
  if (!m) return "";
  return [m.state, m.country].filter(Boolean).join(", ");
}

function ChatHeader({ chat }: { chat: SelectedChatMeta }) {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="hidden border-b p-4 lg:flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarImage src={chat?.avatar} alt={chat?.name} />
            <AvatarFallback>
              {chat?.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {chat?.online && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-foreground">{chat?.name}</h4>
            {chat?.online && (
              <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                Online
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{chat?.location}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ChatInput({
  onComposeSubmit,
}: {
  onComposeSubmit: (payload: { text: string; file?: File }) => void;
}) {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) {
      e.target.value = "";
      return;
    }
    if (!f.type.startsWith("image/")) {
      e.target.value = "";
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    e.target.value = "";
  };

  const handleSend = async () => {
    const text = message.trim();
    if (!text && !file) return;
    setBusy(true);
    try {
      onComposeSubmit({ text, file: file ?? undefined });
      setMessage("");
      clearImage();
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="border-t px-3 sm:px-4 pt-4 pb-6 w-full bg-white fixed md:relative bottom-0 right-0 left-0"
    >
      {previewUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative inline-block"
        >
          <Image
            width={200}
            height={200}
            src={previewUrl}
            alt="Selected"
            className="max-w-20 max-h-14 rounded-lg object-cover"
          />

          <XCircle
            size={20}
            className="absolute cursor-pointer top-0 right-0 fill-red-700 text-white"
            onClick={clearImage}
          />
        </motion.div>
      )}

      <div className="flex items-end gap-1 sm:gap-2">
        <div className="flex-1 relative">
          <Textarea
            placeholder="Enter message"
            aria-label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="min-h-[44px] scrollbar-hide max-h-10 resize-none pr-12 rounded-md"
            rows={1}
            disabled={busy}
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePickFile}
          className="hidden"
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 w-auto text-muted-foreground hover:text-foreground transition-colors duration-200"
          disabled={busy}
        >
          <ImagePlus size={16} />
        </Button>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleSend}
            size="icon"
            aria-label="Send"
            disabled={busy}
            className="bg-red-700 hover:bg-red-800 text-white rounded-full w-auto p-3 transition-all duration-200"
          >
            <SendHorizonal className="w-4 sm:w-5 h-4 sm:h-5" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

function ChatMessage({
  sender,
  avatar,
  content,
  time,
  image,
  isOwn = false,
  index,
  optimistic,
}: {
  sender: string;
  avatar: string;
  content: string;
  time: string;
  image?: string;
  isOwn?: boolean;
  index: number;
  optimistic?: boolean;
}) {
  const showSending = optimistic === true;

  return (
    <motion.div
      initial={{ opacity: 0.6, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.22, ease: "easeOut" }}
      className={`flex gap-3 p-3 sm:p-4 ${isOwn ? "justify-end" : ""}`}
    >
      {!isOwn && (
        <Avatar className="w-8 h-8 hidden sm:flex flex-shrink-0">
          <AvatarImage src={avatar} alt={sender} />
          <AvatarFallback>{sender.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}

      <div className={`flex-1 max-w-2xl ${isOwn ? "text-right" : ""}`}>
        <div
          className={`${
            isOwn ? "bg-red-100/70 ml-auto" : "bg-gray-100"
          } rounded-2xl py-1 px-2 max-w-fit ${
            isOwn ? "rounded-br-md" : "rounded-bl-md"
          } ${showSending ? "opacity-70" : ""}`}
        >
          <>
            {content && (
              <p className="leading-relaxed break-words">{content}</p>
            )}
            {image && (
              <motion.div
                initial={{ opacity: 0.8, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`${content ? "mt-3" : ""}`}
              >
                <Image
                  src={image}
                  alt="Shared image"
                  width={300}
                  height={300}
                  className="rounded-lg max-w-64 w-full h-auto object-cover"
                />
              </motion.div>
            )}
          </>
        </div>

        <div className={`mt-1 ${isOwn ? "text-right" : ""}`}>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {showSending ? "" : time}
          </p>
        </div>
      </div>

      {isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0 hidden sm:flex">
          <AvatarImage src={avatar} alt={sender} />
          <AvatarFallback>{sender.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
}

function ChatArea({
  chat,
  messages,
  onComposeSubmit,
}: {
  chat: SelectedChatMeta;
  messages: Message[];
  onComposeSubmit: (payload: { text: string; file?: File }) => void;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full relative md:ml-[325px]"
    >
      <ChatHeader chat={chat} />
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {messages.map((m, i) => (
            <ChatMessage key={m.id} index={i} {...m} />
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onComposeSubmit={onComposeSubmit} />
    </motion.div>
  );
}

export default function ChatPage() {
  const { data: user } = useGetUser();
  const { data: session } = useSession();
  const [vendorQuery, setVendorQuery] = useState("");
  const [isClose, setIsClose] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const meId = String(session?.user?.id ?? user?.id ?? "");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { data: vendors = [] } = useGetVendors({ pageSize: 100 });
  const [messagesByChat, setMessagesByChat] = useState<
    Record<string, Message[]>
  >({});

  useEffect(() => {
    if (!meId) return;
    const unsub = listenToConversations(meId, (rows) => {
      setConversations(rows);
      if (!selectedChatId && rows.length) setSelectedChatId(rows[0].id);
    });
    return () => unsub();
  }, [meId, selectedChatId]);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedChatId) || null,
    [conversations, selectedChatId]
  );

  const myAvatar = useMemo(() => getMyAvatar(session, user), [session, user]);

  const selectedChat: SelectedChatMeta | null = useMemo(() => {
    if (!selectedConversation) return null;
    const peer =
      selectedConversation.members?.find((m) => String(m.id) !== meId) ??
      selectedConversation.members?.[0];
    if (!peer) return null;
    return {
      id: selectedConversation.id,
      name: safeName(peer),
      avatar: peer.avatar || "/noavatar.png",
      location: safeLocation(peer),
      online: false,
    };
  }, [selectedConversation, meId]);

  useEffect(() => {
    if (!selectedConversation) return;

    const convId = selectedConversation.id;
    const peer =
      selectedConversation.members?.find((m) => String(m.id) !== meId) ??
      selectedConversation.members?.[0];

    const unsub = listenToMessagesByConvId(convId, (rows) => {
      const mapped: Message[] = rows.map((m) => {
        const isOwn = String(m.senderId) === String(meId);
        return {
          id: m.id,
          sender: isOwn ? "You" : safeName(peer),
          avatar: isOwn
            ? myAvatar || "/api/placeholder/40/40"
            : peer?.avatar || "/api/placeholder/40/40",
          content: m.text || "",
          image: m.imageUrl || undefined,
          time:
            m.createdAt?.toDate?.()?.toLocaleTimeString?.([], {
              hour: "2-digit",
              minute: "2-digit",
            }) || "",
          isOwn,
        };
      });

      setMessagesByChat((prev) => {
        const prevList = prev[convId] || [];
        const placeholders = prevList.filter((m) => m.optimistic);
        return { ...prev, [convId]: [...mapped, ...placeholders] };
      });
    });

    return () => unsub();
  }, [selectedConversation?.id, selectedConversation, meId, myAvatar]);

  const onComposeSubmit = useCallback(
    async ({ text, file }: { text: string; file?: File }) => {
      if (!selectedConversation || !selectedChat || !meId) return;

      const convId = selectedConversation.id;
      const peer =
        selectedConversation.members?.find((m) => String(m.id) !== meId) ??
        selectedConversation.members?.[0];
      if (!peer?.id) return;

      const peerId = String(peer.id);
      const tempId = `sending-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

      try {
        let imageUrl: string | undefined;
        if (file) {
          imageUrl = await uploadChatImage(file, convId, meId);
        }

        await sendMessage({
          userId: String(meId),
          peerId,
          convId,
          text,
          imageUrl,
        });
      } catch (e) {}
    },
    [selectedConversation, selectedChat, meId, myAvatar]
  );

  const onChatSelect = useCallback((chatId: string) => {
    setSelectedChatId(chatId);
  }, []);

  async function handleStartChatWithVendor(vendorRow: any) {
    if (!meId) return;

    const vendorUserId = String(vendorRow?.User?.id ?? vendorRow?.UserId);
    if (!vendorUserId) return;

    const convId = conversationIdFor(meId, vendorUserId);
    const members = buildMembersArray(user ?? session?.user ?? { id: meId }, {
      ...vendorRow,
      avatar: vendorRow?.User?.avatar,
    });

    try {
      await ensureRTDBConversation({
        userId: meId,
        peerId: vendorUserId,
        convId,
        members,
        initiatorId: meId,
      });

      setShowVendorModal(false);
      setVendorQuery("");
      onChatSelect(convId);
      setIsClose(false);
    } catch {}
  }

  const filteredVendors = useMemo(() => {
    const q = vendorQuery?.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter((v: any) =>
      vendorNameOf(v).toLowerCase().includes(q)
    );
  }, [vendors, vendorQuery]);

  const chatMessages = selectedChat
    ? messagesByChat[selectedChat.id] || []
    : [];

  return (
    <>
      <div className="flex bg-white h-full pt-[73px] pb-10">
        <aside className="hidden fixed top-[70px] overflow-auto bg-white z-10 md:block w-[320px] border-r">
          <ChatSidebar
            selectedChatId={selectedChatId ?? ""}
            onChatSelect={onChatSelect}
            setVendorQuery={setVendorQuery}
            setShowVendorModal={setShowVendorModal}
            setIsClose={setIsClose}
          />
        </aside>

        <div className="flex-1 flex flex-col">
          <div className="md:hidden bg-white z-10 fixed top-[62px] right-0 left-0 bg-background border-b p-3 sm:p-4 flex items-center justify-between">
            <Button
              onClick={() => setIsClose(true)}
              variant="secondary"
              className="w-auto"
            >
              Chat History
            </Button>

            <Sheet open={isClose} onOpenChange={setIsClose}>
              <SheetContent side="left" className="p-0 pt-8 w-full">
                <ChatSidebar
                  selectedChatId={selectedChatId ?? ""}
                  onChatSelect={(id) => {
                    onChatSelect(id);
                  }}
                  setIsClose={setIsClose}
                  setVendorQuery={setVendorQuery}
                  setShowVendorModal={setShowVendorModal}
                />
              </SheetContent>
            </Sheet>
            {selectedChat?.name && (
              <p className="text-sm">{shortenText(selectedChat?.name, 20)}</p>
            )}
          </div>

          {selectedChat ? (
            <ChatArea
              chat={selectedChat}
              messages={chatMessages}
              onComposeSubmit={onComposeSubmit}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex min-h-screen items-center justify-center bg-background"
            >
              <Button
                onClick={() => {
                  setShowVendorModal(true);
                  setVendorQuery("");
                }}
              >
                START A CONVERSATION
              </Button>
            </motion.div>
          )}
        </div>
      </div>

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
          {filteredVendors?.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              {vendorQuery ? "No vendors match your search" : "No vendors"}
            </div>
          ) : (
            filteredVendors?.map((v: any) => {
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
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <Image
                      src={avatar || "/noavatar.png"}
                      width={200}
                      height={200}
                      alt="Avatar"
                      className="object-contain rounded-full w-7 h-7"
                    />
                    <div className="min-w-0">
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
                      className="w-auto text-xs sm:text-sm"
                      size="sm"
                      variant="secondary"
                      onClick={() => handleStartChatWithVendor(v)}
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
    </>
  );
}

function getMyAvatar(session?: any, user?: any) {
  return (
    user?.avatar ||
    user?.image ||
    session?.user?.avatar ||
    session?.user?.image ||
    ""
  );
}

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
