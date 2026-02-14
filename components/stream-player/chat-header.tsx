"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import ChatToggle from "./chat-toggle";
import VariantToggle from "./variant-toggle";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface ChatHeaderProps {
  isHost?: boolean;
}

const ChatHeader = ({ isHost }: ChatHeaderProps) => {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearChat = async () => {
    if (!confirm("Are you sure you want to clear all chat messages? This cannot be undone.")) {
      return;
    }

    setIsClearing(true);
    try {
      const response = await fetch("/api/chat/clear", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to clear chat");
      }

      toast.success("Chat history cleared");
      window.location.reload(); // Recargar para mostrar chat vacío
    } catch (error) {
      toast.error("Failed to clear chat");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="relative p-3 border-b">
      <div className="absolute left-2 top-2 hidden lg:block">
        <ChatToggle />
      </div>
      <p className="font-semibold text-primary text-center">Stream Chat</p>
      <div className="absolute right-2 top-2 flex items-center gap-x-2">
        {isHost && (
          <Button
            onClick={handleClearChat}
            disabled={isClearing}
            variant="ghost"
            size="sm"
            className="h-auto p-2"
            title="Clear chat history"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        <VariantToggle />
      </div>
    </div>
  );
};

export const ChatHeaderSkeleton = () => {
  return (
    <div className="relative p-3 border-b hidden md:block">
      <Skeleton className="absolute h-6 w-6 left-3 top-3" />
      <Skeleton className="w-28 h-6 mx-auto" />
    </div>
  );
};

export default ChatHeader;
