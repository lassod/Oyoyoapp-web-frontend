"use client";
import { ChatArea, ChatSidebar } from "@/components/dashboard/Chat";
import { Dashboard } from "@/components/ui/containers";
import { motion } from "framer-motion";
import { useState, useCallback } from "react";

// shadcn/ui sheet
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

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

interface Chat {
  id: string;
  name: string;
  avatar: string;
  location: string;
  online: boolean;
}

const mockChats: Record<string, Chat> = {
  "1": {
    id: "1",
    name: "Anita Cruz",
    avatar: "/api/placeholder/40/40",
    location: "Auckland, New Zealand",
    online: true,
  },
  "2": {
    id: "2",
    name: "Peterson",
    avatar: "/api/placeholder/40/40",
    location: "Lagos, Nigeria",
    online: false,
  },
};

const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      sender: "Anita Cruz",
      avatar: "/api/placeholder/40/40",
      content:
        "Hi there! I recently received my order from You on Oyoyo, but unfortunately, the item arrived damaged. I'd like to resolve this issue",
      time: "Today 11:52",
      isEventHost: true,
    },
    {
      id: "2",
      sender: "You",
      avatar: "/api/placeholder/40/40",
      content:
        "I apologize for the inconvenience caused. Thank you for bringing this to my attention. Could you please provide some details about the damage? Additionally, could you share any relevant photos of the damaged item?",
      time: "Today 11:54",
      isOwn: true,
    },
    {
      id: "3",
      sender: "Anita Cruz",
      avatar: "/api/placeholder/40/40",
      content: "Here you go!",
      time: "Today 11:55",
      image:
        "https://images.unsplash.com/photo-1552633350-31feaef157af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwZGVzc2VydCUyMHBhc3RyeXxlbnwxfHx8fDE3NTkwNTMzMDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
  ],
  "2": [
    {
      id: "4",
      sender: "Peterson",
      avatar: "/api/placeholder/40/40",
      content: "How are you doing? I am pete",
      time: "Yesterday 08:35",
    },
  ],
};

export default function App() {
  const [selectedChatId, setSelectedChatId] = useState("1");
  const [messages, setMessages] = useState(mockMessages);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const selectedChat = mockChats[selectedChatId];
  const chatMessages = messages[selectedChatId] || [];

  const handleSendMessage = (content: string, image?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "You",
      avatar: "/api/placeholder/40/40",
      content,
      time: new Date().toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
      }),
      isOwn: true,
      image,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), newMessage],
    }));
  };

  const handleMarkAllAsRead = () => {
    // stub for backend integration
  };

  const handleChatSelect = useCallback((chatId: string) => {
    setSelectedChatId(chatId);
    setIsSheetOpen(false); // close sheet after selecting on mobile
  }, []);

  return (
    <Dashboard className="bg-white px-0 sm:px-0 lg:px-0 pt-[73px] h-screen pb-10">
      <div className="flex h-full">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-[320px] border-r">
          <ChatSidebar
            selectedChatId={selectedChatId}
            onChatSelect={handleChatSelect}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
        </aside>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="md:hidden pt-0 sm:pt-4 bg-background border-b border-border p-4 flex items-center justify-between">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="secondary" className="w-auto">
                  Chat History
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 pt-8 w-auto">
                <ChatSidebar
                  selectedChatId={selectedChatId}
                  onChatSelect={handleChatSelect}
                  onMarkAllAsRead={handleMarkAllAsRead}
                />
              </SheetContent>
            </Sheet>
            {selectedChat.name && (
              <p className="text-sm">{selectedChat.name}</p>
            )}
          </div>
          {selectedChat ? (
            <ChatArea
              selectedChat={selectedChat}
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
