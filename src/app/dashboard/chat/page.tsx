"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dashboard } from "@/components/ui/containers";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { useGetUser } from "@/hooks/user";
import { useSession } from "next-auth/react";
import {
  listenToConversations,
  ConversationItem,
  ConversationMember,
  listenToMessagesByConvId,
  sendMessage,
} from "@/hooks/chat-firestore";
import { ChatSidebar } from "@/components/dashboard/Chat"; // your existing export that renders the sidebar
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, X, Paperclip } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// ---------------- Types used locally ----------------

interface Message {
  id: string;
  sender: string;
  avatar: string;
  content: string;
  time: string;
  isEventHost?: boolean;
  image?: string;
  isOwn?: boolean;
}

type SelectedChatMeta = {
  id: string;
  name: string;
  avatar: string;
  location: string;
  online: boolean;
};

// ---------------- Small helpers ----------------

function safeName(m?: ConversationMember): string {
  if (!m) return "Unknown";
  const full = [m.first_name, m.last_name].filter(Boolean).join(" ").trim();
  return full || m.username || m.email || `User ${m.id}`;
}

function safeLocation(m?: ConversationMember): string {
  if (!m) return "";
  return [m.state, m.country].filter(Boolean).join(", ");
}

// ---------------- Chat Header ----------------

function ChatHeader({ chat }: { chat: SelectedChatMeta }) {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  return (
    <>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="hidden border-b p-4 lg:flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
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

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-foreground">{chat.name}</h4>
              {chat.online && (
                <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                  Online
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{chat.location}</p>
          </div>
        </div>

        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2 w-auto">
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 border">
            <DropdownMenuItem
              onClick={() => setShowReportDialog(true)}
              className="text-red-700 hover:bg-red-100 cursor-pointer"
            >
              Report user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </motion.div>

      {/* Simple report dialogs (same as your originals) */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-md border">
          <div className="space-y-3">
            <h4 className="text-foreground">Report {chat.name}</h4>
            <p className="text-muted-foreground text-sm">
              Describe what happened.
            </p>
            <Textarea className="min-h-32" placeholder="Your description…" />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowReportDialog(false)}
                className="w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowReportDialog(false);
                  setShowConfirmDialog(true);
                }}
                className="bg-red-700 hover:bg-red-800 w-auto"
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md border">
          <p className="text-center">Thanks, we’ve received your report.</p>
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => setShowConfirmDialog(false)}
              className="w-auto"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------------- Chat Input ----------------

function ChatInput({
  onSendMessage,
}: {
  onSendMessage: (message: string, image?: string) => void;
}) {
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() || selectedImage) {
      onSendMessage(message.trim(), selectedImage || undefined);
      setMessage("");
      setSelectedImage(null);
    }
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="border-t p-4"
    >
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 relative inline-block"
        >
          <img
            src={selectedImage}
            alt="Selected"
            className="max-w-32 max-h-32 rounded-lg object-cover"
          />
          <Button
            onClick={() => setSelectedImage(null)}
            size="sm"
            className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full bg-red-700 hover:bg-red-800"
          >
            <X className="w-3 h-3" />
          </Button>
        </motion.div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="min-h-[44px] max-h-10 resize-none pr-12 rounded-md"
            rows={1}
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (file.type.startsWith("image/")) {
              const reader = new FileReader();
              reader.onload = (e) =>
                setSelectedImage(e.target?.result as string);
              reader.readAsDataURL(file);
            }
          }}
          className="hidden"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 w-auto text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          <Paperclip className="w-5 h-5" />
        </Button>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleSend}
            size="icon"
            disabled={!message.trim() && !selectedImage}
            className="bg-red-700 hover:bg-red-800 text-white rounded-full w-auto p-3 transition-all duration-200"
          >
            Send Message
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ---------------- Chat Message ----------------

function ChatMessage({
  id,
  sender,
  avatar,
  content,
  time,
  isEventHost,
  image,
  isOwn = false,
  index,
}: {
  id: string;
  sender: string;
  avatar: string;
  content: string;
  time: string;
  isEventHost?: boolean;
  image?: string;
  isOwn?: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3, ease: "easeOut" }}
      className={`flex gap-3 p-4 ${isOwn ? "justify-end" : ""}`}
    >
      {!isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={avatar} alt={sender} />
          <AvatarFallback>{sender.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}

      <div className={`flex-1 max-w-2xl ${isOwn ? "text-right" : ""}`}>
        {!isOwn && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-foreground">{sender}</span>
            {isEventHost && (
              <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                EVENT HOST
              </Badge>
            )}
          </div>
        )}

        <div
          className={`${
            isOwn ? "bg-primary text-primary-foreground ml-auto" : "bg-gray-50"
          } rounded-2xl p-3 max-w-fit ${
            isOwn ? "rounded-br-md" : "rounded-bl-md"
          }`}
        >
          <p
            className={`${
              isOwn ? "text-primary-foreground" : "text-foreground"
            } leading-relaxed`}
          >
            {content}
          </p>

          {image && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="mt-3"
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
        </div>

        <div className={`mt-1 ${isOwn ? "text-right" : ""}`}>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
      </div>

      {isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={avatar} alt={sender} />
          <AvatarFallback>{sender.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
}

// ---------------- Chat Area ----------------

function ChatArea({
  chat,
  messages,
  onSendMessage,
}: {
  chat: SelectedChatMeta;
  messages: Message[];
  onSendMessage: (message: string, image?: string) => void;
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
      className="flex flex-col h-full"
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
      <ChatInput onSendMessage={onSendMessage} />
    </motion.div>
  );
}

// ---------------- Main Page ----------------
export default function ChatPage() {
  const { data: user } = useGetUser();
  const { data: session } = useSession();

  const meId = String(session?.user?.id ?? user?.id ?? "");

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // messages by conversation id
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
  }, [meId]);

  // Find the selected conversation + derive the “other” user
  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedChatId) || null,
    [conversations, selectedChatId]
  );

  const otherMember = useMemo<ConversationMember | undefined>(() => {
    if (!selectedConversation) return undefined;
    return (
      selectedConversation.members?.find((m) => String(m.id) !== meId) ??
      selectedConversation.members?.[0]
    );
  }, [selectedConversation, meId]);

  const myAvatar = useMemo(() => getMyAvatar(session, user), [session, user]);

  const selectedChat: SelectedChatMeta | null = useMemo(() => {
    if (!selectedConversation) return null;

    // pick the counterparty accurately
    const peer =
      selectedConversation.members?.find((m) => String(m.id) !== meId) ??
      selectedConversation.members?.[0];

    if (!peer) return null;

    return {
      id: selectedConversation.id,
      name: safeName(peer),
      avatar: peer.avatar || "/api/placeholder/40/40",
      location: safeLocation(peer),
      online: false,
    };
  }, [selectedConversation, meId]);

  useEffect(() => {
    if (!selectedConversation) return;

    const convId = selectedConversation.id;
    // compute peer once for this conversation
    const peer =
      selectedConversation.members?.find((m) => String(m.id) !== meId) ??
      selectedConversation.members?.[0];

    const unsub = listenToMessagesByConvId(convId, (rows) => {
      const mapped = rows.map((m) => {
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
        } as Message;
      });

      setMessagesByChat((prev) => ({ ...prev, [convId]: mapped }));
    });

    return () => unsub();
  }, [selectedConversation?.id, selectedConversation, meId, myAvatar]);

  // const handleSendMessage = async (content: string, image?: string) => {
  //   if (!selectedChat || !otherMember || !meId) return;

  //   console.log(otherMember);
  //   const convId = selectedChat.id;
  //   const peerId = String(otherMember.id);

  //   // --- Optimistic UI: show immediately
  //   const tempId = `temp-${Date.now()}`;
  //   const optimistic: Message = {
  //     id: tempId,
  //     sender: "You",
  //     avatar: "/api/placeholder/40/40",
  //     content,
  //     time: new Date().toLocaleTimeString([], {
  //       hour: "2-digit",
  //       minute: "2-digit",
  //     }),
  //     isOwn: true,
  //     image,
  //   };
  //   setMessagesByChat((prev) => ({
  //     ...prev,
  //     [convId]: [...(prev[convId] || []), optimistic],
  //   }));

  //   try {
  //     // --- Persist to Firebase (Firestore subcollection + RTDB touch)
  //     await sendMessage({
  //       userId: meId,
  //       peerId,
  //       text: content,
  //       imageUrl: image,
  //     });

  //     // No need to manually reconcile; your onSnapshot will deliver the real row.
  //     // Optionally: remove the optimistic temp if you want to avoid duplicates.
  //     // The simplest is to leave it—your listener will replace the whole list shortly.
  //   } catch (e) {
  //     console.error("sendMessage failed:", e);
  //     // Roll back optimistic row on failure
  //     setMessagesByChat((prev) => ({
  //       ...prev,
  //       [convId]: (prev[convId] || []).filter((m) => m.id !== tempId),
  //     }));
  //     // Optionally show a toast here
  //   }
  // };

  const handleSendMessage = async (content: string, image?: string) => {
    if (!selectedConversation || !selectedChat || !meId) return;

    // derive peer reliably from the selected conversation
    const peer =
      selectedConversation.members?.find((m) => String(m.id) !== meId) ??
      selectedConversation.members?.[0];
    if (!peer?.id) return;

    const convId = selectedConversation.id;
    const peerId = String(peer.id);

    // Optimistic UI (use my real avatar)
    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      sender: "You",
      avatar: myAvatar || "/api/placeholder/40/40",
      content,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOwn: true,
      image,
    };
    setMessagesByChat((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] || []), optimistic],
    }));

    try {
      await sendMessage({
        userId: String(meId),
        peerId, // 👈 explicit peer
        convId, // 👈 explicit conversation (prevents misrouting)
        text: content,
        imageUrl: image,
      });
      // the listener will refresh the list with the real message
    } catch (e) {
      console.error("sendMessage failed:", e);
      // rollback optimistic
      setMessagesByChat((prev) => ({
        ...prev,
        [convId]: (prev[convId] || []).filter((m) => m.id !== tempId),
      }));
    }
  };

  const onMarkAllAsRead = () => {
    // Optional: write “seen: true” in RTDB here if you keep per-thread seen flags.
  };

  const onChatSelect = useCallback((chatId: string) => {
    setSelectedChatId(chatId);
  }, []);

  console.log(messagesByChat);
  console.log(selectedChat);
  const chatMessages = selectedChat
    ? messagesByChat[selectedChat.id] || []
    : [];

  return (
    <Dashboard className="bg-white px-0 sm:px-0 lg:px-0 pt-[73px] h-screen pb-10">
      <div className="flex h-full">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-[320px] border-r">
          <ChatSidebar
            selectedChatId={selectedChatId ?? ""}
            onChatSelect={onChatSelect}
            onMarkAllAsRead={onMarkAllAsRead}
          />
        </aside>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="md:hidden pt-0 sm:pt-4 bg-background border-b border-border p-4 flex items-center justify-between">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary" className="w-auto">
                  Chat History
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 pt-8 w-auto">
                <ChatSidebar
                  selectedChatId={selectedChatId ?? ""}
                  onChatSelect={(id) => {
                    onChatSelect(id);
                  }}
                  onMarkAllAsRead={onMarkAllAsRead}
                />
              </SheetContent>
            </Sheet>
            {selectedChat?.name && (
              <p className="text-sm">{selectedChat.name}</p>
            )}
          </div>

          {selectedChat ? (
            <ChatArea
              chat={selectedChat}
              messages={chatMessages}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex items-center justify-center bg-background"
            >
              <div className="text-center">
                <h2 className="text-foreground mb-2">
                  Select a chat to start messaging
                </h2>
                <p className="text-muted-foreground">
                  Choose a conversation from the sidebar
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Dashboard>
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
