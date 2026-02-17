"use client";
import { ChatVariant, useChatSidebar } from "@/store/use-chat-sidebar";
import {
  useChat,
  useConnectionState,
  useRemoteParticipant,
} from "@livekit/components-react";
import type { ReceivedChatMessage } from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useMediaQuery } from "usehooks-ts";
import { motion } from "framer-motion";
import ChatHeader, { ChatHeaderSkeleton } from "./chat-header";
import ChatForm, { ChatFormSkeleton } from "./chat-form";
import ChatList, { ChatListSkeleton } from "./chat-list";
import ChatCommunity from "./chat-community";

type Props = {
  hostName: string;
  hostIdentity: string;
  viewerName: string;
  viewerIdentity: string;
  isFollowing: boolean;
  isChatEnabled: boolean;
  isChatDelayed: boolean;
  isChatFollowersOnly: boolean;
  pinnedMessage: string;
  streamId: string;
};

interface PersistedMessage {
  id: string;
  content: string;
  username: string;
  createdAt: string;
}

function Chat({
  hostIdentity,
  viewerName,
  viewerIdentity,
  isChatDelayed,
  isChatEnabled,
  isChatFollowersOnly,
  isFollowing,
  hostName,
  pinnedMessage,
  streamId,
}: Props) {
  const matches = useMediaQuery("(max-width: 1024px)");
  const { variant, onExpand } = useChatSidebar((state) => state);
  const connectionState = useConnectionState();
  const participant = useRemoteParticipant(hostIdentity);
  const isOnline = participant && connectionState === ConnectionState.Connected;
  const isHidden = !isChatEnabled || !isOnline;
  const [value, setValue] = useState("");
  const { chatMessages: liveMessages, send } = useChat();

  const [persistedMessages, setPersistedMessages] = useState<PersistedMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // ✅ Ref para rastrear timestamps ya guardados y evitar duplicados
  const savedTimestamps = useRef<Set<number>>(new Set());

  // Cargar historial al montar
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await fetch(`/api/chat/messages?streamId=${streamId}&limit=100`);
        if (response.ok) {
          const messages: PersistedMessage[] = await response.json();
          setPersistedMessages(messages);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    if (streamId) {
      loadChatHistory();
    }
  }, [streamId]);

  // ✅ Solo guardar mensajes NUEVOS (no los que ya están en historial)
  useEffect(() => {
    if (liveMessages.length === 0 || isLoadingHistory) return;

    const lastMessage = liveMessages[liveMessages.length - 1];

    // Si ya guardamos este timestamp, no lo guardamos de nuevo
    if (savedTimestamps.current.has(lastMessage.timestamp)) return;

    savedTimestamps.current.add(lastMessage.timestamp);

    const saveMessage = async () => {
      try {
        await fetch("/api/chat/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            streamId,
            content: lastMessage.message,
            username: lastMessage.from?.name || "Anonymous",
            userId: lastMessage.from?.identity,
          }),
        });
      } catch (error) {
        console.error("Error saving message:", error);
      }
    };

    saveMessage();
  }, [liveMessages, streamId, isLoadingHistory]);

  useEffect(() => {
    if (matches) {
      onExpand();
    }
  }, [matches, onExpand]);

  const isHost = `host-${hostIdentity}` === viewerIdentity;

  // ✅ Combinar mensajes sin duplicados usando timestamp como clave
  const allMessages = useMemo(() => {
    // Timestamps de mensajes en vivo
    const liveTimestamps = new Set(liveMessages.map((m) => m.timestamp));

    // Convertir historial al formato ReceivedChatMessage
    // Solo incluir mensajes históricos que NO están ya en liveMessages
    const historicalMessages: ReceivedChatMessage[] = persistedMessages
      .filter((msg) => {
        const ts = new Date(msg.createdAt).getTime();
        // Excluir si ya existe un mensaje en vivo con timestamp muy cercano (±1000ms)
        return ![...liveTimestamps].some(
          (liveTs) => Math.abs(liveTs - ts) < 1000
        );
      })
      .map((msg) => ({
        timestamp: new Date(msg.createdAt).getTime(),
        message: msg.content,
        from: {
          name: msg.username,
          identity: msg.username,
        } as any,
      }));

    const combined = [...historicalMessages, ...liveMessages];
    return combined.sort((a, b) => b.timestamp - a.timestamp);
  }, [persistedMessages, liveMessages]);

  const onSubmit = () => {
    if (!send) return;
    send(value);
    setValue("");
  };

  const onChange = (value: string) => {
    setValue(value);
  };

  if (isLoadingHistory) {
    return <ChatSkeleton />;
  }

  return (
    <div className="flex flex-col bg-[#333131] h-full">
      <ChatHeader isHost={isHost} />
      {variant === ChatVariant.CHAT && (
        <>
          <ChatList
            messages={allMessages}
            isHidden={isHidden}
            pinnedMessage={pinnedMessage}
          />
          {!matches && (
            <ChatForm
              onSubmit={onSubmit}
              value={value}
              onChange={onChange}
              isHidden={isHidden}
              isFollowersOnly={isChatFollowersOnly}
              isDelayed={isChatDelayed}
              isFollowing={isFollowing}
            />
          )}
          {matches && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="chat-input-mobile"
            >
              <ChatForm
                onSubmit={onSubmit}
                value={value}
                onChange={onChange}
                isHidden={isHidden}
                isFollowersOnly={isChatFollowersOnly}
                isDelayed={isChatDelayed}
                isFollowing={isFollowing}
              />
            </motion.div>
          )}
        </>
      )}
      {variant === ChatVariant.COMMUNITY && (
        <ChatCommunity
          viewerName={viewerName}
          hostName={hostName}
          isHidden={isHidden}
        />
      )}
    </div>
  );
}

export default Chat;

export const ChatSkeleton = () => {
  return (
    <div className="flex flex-col border-l border-b pt-0 h-[calc(100vh-80px)] border-2">
      <ChatHeaderSkeleton />
      <ChatListSkeleton />
      <ChatFormSkeleton />
    </div>
  );
};
