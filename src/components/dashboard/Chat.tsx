import { useEffect } from "react";

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

interface ChatAreaProps {
  selectedChat: {
    id: string;
    name: string;
    avatar: string;
    location: string;
    online: boolean;
  };
  messages: Message[];
  onSendMessage: (message: string, image?: string) => void;
}

export function ChatArea({
  selectedChat,
  messages,
  onSendMessage,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full "
    >
      <ChatHeader
        name={selectedChat.name}
        avatar={selectedChat.avatar}
        location={selectedChat.location}
        online={selectedChat.online}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              id={message.id}
              sender={message.sender}
              avatar={message.avatar}
              content={message.content}
              time={message.time}
              isEventHost={message.isEventHost}
              image={message.image}
              isOwn={message.isOwn}
              index={index}
            />
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSendMessage={onSendMessage} />
    </motion.div>
  );
}

import { MoreVertical } from "lucide-react";

interface ChatHeaderProps {
  name: string;
  avatar: string;
  location: string;
  online: boolean;
}

interface ReportData {
  subject: string;
  category: string;
  description: string;
  attachments: File[];
}

export function ChatHeader({
  name,
  avatar,
  location,
  online,
}: ChatHeaderProps) {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleViewProfile = () => {
    // toast.success("Opening user profile...");
  };

  const handleContactSupport = () => {
    // toast.success("Redirecting to support...");
  };

  const handleReportUser = () => {
    setShowReportDialog(true);
  };

  const handleReportSubmit = (data: ReportData) => {
    console.log("Report submitted:", data);
    setShowConfirmDialog(true);
  };

  const handleConfirmReport = () => {
    // toast.success("User has been reported successfully");
    setShowConfirmDialog(false);
  };

  const handleBackToReport = () => {
    setShowConfirmDialog(false);
    setShowReportDialog(true);
  };

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
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            {online && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-foreground">{name}</h4>
              {online && (
                <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                  Online
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{location}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2 w-auto">
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48  border">
            <DropdownMenuItem
              onClick={handleViewProfile}
              className="text-foreground hover:bg-accent cursor-pointer"
            >
              View profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleContactSupport}
              className="text-foreground hover:bg-accent cursor-pointer"
            >
              Contact support
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleReportUser}
              className="text-red-700 hover:bg-red-100 cursor-pointer"
            >
              Report user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      <ReportTicketDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        onSubmit={handleReportSubmit}
      />

      <ReportUserConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmReport}
        onBack={handleBackToReport}
      />
    </>
  );
}

import { useRef } from "react";
import { Paperclip } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string, image?: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        // toast.success("Image attached successfully");
      } else {
        // toast.error("Please select an image file");
      }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="border-t p-4"
    >
      {/* Image Preview */}
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
            onClick={removeImage}
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
            onKeyPress={handleKeyPress}
            className="min-h-[44px] max-h-10 resize-none pr-12 rounded-md"
            rows={1}
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
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

interface ChatMessageProps {
  id: string;
  sender: string;
  avatar: string;
  content: string;
  time: string;
  isEventHost?: boolean;
  image?: string;
  isOwn?: boolean;
  index: number;
}

export function ChatMessage({
  sender,
  avatar,
  content,
  time,
  isEventHost,
  image,
  isOwn = false,
  index,
}: ChatMessageProps) {
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
          <AvatarFallback>{sender.slice(0, 2)}</AvatarFallback>
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
          } 
                        rounded-2xl p-3 max-w-fit ${
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
          <AvatarFallback>{sender.slice(0, 2)}</AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
}

import { Search, Filter, ChevronDown } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatItem {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread?: boolean;
  online?: boolean;
  hasNotification?: boolean;
}

interface ChatSidebarProps {
  selectedChatId: string;
  onChatSelect: (chatId: string) => void;
  onMarkAllAsRead: () => void;
}

const mockChats: ChatItem[] = [
  {
    id: "1",
    name: "Anita Cruz",
    avatar: "/api/placeholder/40/40",
    lastMessage: "Very well, thank you",
    time: "09:45",
    online: true,
    hasNotification: true,
  },
  {
    id: "2",
    name: "Peterson",
    avatar: "/api/placeholder/40/40",
    lastMessage: "How are you doing? I am pete",
    time: "08:35",
    unread: true,
    hasNotification: true,
  },
  {
    id: "3",
    name: "Uchenna",
    avatar: "/api/placeholder/40/40",
    lastMessage: "Very well, thank you",
    time: "Yesterday",
    online: true,
  },
  {
    id: "4",
    name: "Ayo",
    avatar: "/api/placeholder/40/40",
    lastMessage: "Very well, thank you",
    time: "Yesterday",
    online: true,
  },
  {
    id: "5",
    name: "Steph",
    avatar: "/api/placeholder/40/40",
    lastMessage: "Very well, thank you",
    time: "02/10/2023",
    hasNotification: true,
  },
  {
    id: "6",
    name: "Anny",
    avatar: "/api/placeholder/40/40",
    lastMessage: "Very well, thank you",
    time: "02/10/2023",
    unread: true,
  },
  {
    id: "7",
    name: "Anny",
    avatar: "/api/placeholder/40/40",
    lastMessage: "Very well, thank you",
    time: "02/10/2023",
    unread: true,
  },
  {
    id: "8",
    name: "Anny",
    avatar: "/api/placeholder/40/40",
    lastMessage: "Very well, thank you",
    time: "02/10/2023",
    unread: true,
  },
];

type FilterType = "all" | "unread" | "read" | "online";

export function ChatSidebar({
  selectedChatId,
  onChatSelect,
  onMarkAllAsRead,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [chatsState, setChatsState] = useState(mockChats);
  const { data: vendors } = useGetVendors();

  console.log(vendors);
  const filteredChats = chatsState.filter((chat) => {
    const matchesSearch = chat.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    switch (filterType) {
      case "unread":
        return matchesSearch && (chat.unread || chat.hasNotification);
      case "read":
        return matchesSearch && !chat.unread && !chat.hasNotification;
      case "online":
        return matchesSearch && chat.online;
      default:
        return matchesSearch;
    }
  });

  const recentChats = filteredChats.slice(0, 4);
  const olderChats = filteredChats.slice(4);

  const handleMarkAllAsRead = () => {
    // Clear all notifications and unread badges
    setChatsState((prevChats) =>
      prevChats.map((chat) => ({
        ...chat,
        hasNotification: false,
        unread: false,
      }))
    );
    onMarkAllAsRead();
    // toast.success("All chats marked as read");
  };

  const handleChatSelect = (chatId: string) => {
    // Mark the selected chat as read
    setChatsState((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId
          ? { ...chat, hasNotification: false, unread: false }
          : chat
      )
    );
    onChatSelect(chatId);
  };

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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-red-700 w-auto hover:text-red-700 hover:bg-red-100 transition-colors duration-200"
          >
            Mark all as read
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute z-10 left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10  border"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {/* Most Recent Section */}
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
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-sidebar-accent ${
                    selectedChatId === chat.id ? "bg-sidebar-accent" : ""
                  }`}
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={chat.avatar} alt={chat.name} />
                      <AvatarFallback>{chat.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
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
                    {/* {chat.hasNotification && (
                      <div className="w-2 h-2 bg-red-700 rounded-full"></div>
                    )} */}
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

        {/* Older Section */}
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
                    <AvatarFallback>{chat.name.slice(0, 2)}</AvatarFallback>
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
    </motion.div>
  );
}

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ReportData) => void;
}

interface ReportData {
  subject: string;
  category: string;
  description: string;
  attachments: File[];
}

export function ReportTicketDialog({
  open,
  onOpenChange,
  onSubmit,
}: ReportTicketDialogProps) {
  const [formData, setFormData] = useState<ReportData>({
    subject: "",
    category: "",
    description: "",
    attachments: [],
  });

  const handleSubmit = () => {
    if (formData.subject && formData.category && formData.description) {
      onSubmit(formData);
      setFormData({
        subject: "",
        category: "",
        description: "",
        attachments: [],
      });
      onOpenChange(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(
      (file) =>
        file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "image/jpg"
    );

    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles],
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md  border border">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {/* <DialogHeader>
            <DialogTitle className="text-foreground">Create Report ticket</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Fill out this form to report a user for inappropriate behavior or content.
            </DialogDescription>
          </DialogHeader> */}

          <div className="space-y-4 mt-4">
            {/* Subject */}
            <div>
              <label className="text-foreground block mb-2">Subject</label>
              <Input
                placeholder="Enter subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subject: e.target.value }))
                }
                className="bg-input-background border"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-foreground block mb-2">Category</label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="bg-input-background border">
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="inappropriate-content">
                    Inappropriate Content
                  </SelectItem>
                  <SelectItem value="fake-profile">Fake Profile</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <label className="text-foreground block mb-2">Description</label>
              <Textarea
                placeholder="Enter a description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="min-h-32 bg-input-background border resize-none"
              />
            </div>

            {/* Upload attachments */}
            <div>
              <label className="text-foreground block mb-2">
                Upload attachments (Optional)
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="w-8 h-8 border-2 border-dashed border-red-700 rounded-full flex items-center justify-center">
                    <Plus className="w-4 h-4 text-red-700" />
                  </div>
                  <span className="text-red-700">
                    Add images (PNG, JPG format)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept=".png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Display uploaded files */}
                {formData.attachments.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                  >
                    <span className="text-sm text-foreground">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      className="p-1 w-auto"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-foreground w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.subject || !formData.category || !formData.description
              }
              className="bg-red-700 w-auto hover:bg-red-800 text-white"
            >
              Submit
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useGetVendors } from "@/hooks/vendors";

interface ReportUserConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export function ReportUserConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  onBack,
}: ReportUserConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md  border border"
        aria-describedby="confirm-report-description"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="text-center p-4"
        >
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-700" />
            </div>
          </div>

          <h2 className="text-foreground mb-2">Report User</h2>
          <p
            id="confirm-report-description"
            className="text-muted-foreground mb-6"
          >
            Are you sure you want to report this user?
          </p>

          <div className="flex justify-center gap-3">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-foreground w-auto"
            >
              Back
            </Button>
            <Button
              onClick={onConfirm}
              className="bg-red-700 w-auto hover:bg-red-800 text-white"
            >
              Yes
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
