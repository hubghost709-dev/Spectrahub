"use client";
import { ChatVariant, useChatSidebar } from "@/store/use-chat-sidebar";
import {
  useChat,
  useConnectionState,
  useRemoteParticipant,
} from "@livekit/components-react";
import type { ReceivedChatMessage } from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import React, { useEffect, useMemo, useState } from "react";
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

  const isOnline =
    participant && connectionState === ConnectionState.Connected;

  const isHidden = !isChatEnabled || !isOnline;

  const [value, setValue] = useState("");
  const { chatMessages: liveMessages, send } = useChat();

  const [persistedMessages, setPersistedMessages] = useState<
    PersistedMessage[]
  >([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // ✅ NUEVO: detectar si el viewer es el host
  const isHost = `host-${hostIdentity}` === viewerIdentity;

  // Cargar historial de mensajes
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await fetch(
          `/api/chat/messages?streamId=${streamId}&limit=100`
        );
        if (response.ok) {
          const messages = await response.json();
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

  // Guardar mensajes nuevos en la BD
  useEffect(() => {
    if (liveMessages.length === 0) return;

    const lastMessage = liveMessages[liveMessages.length - 1];

    const saveMessage = async () => {
      try {
        await fetch("/api/chat/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
  }, [liveMessages, streamId]);

  useEffect(() => {
    if (matches) {
      onExpand();
    }
  }, [matches, onExpand]);

  // Combinar mensajes históricos + live
  const allMessages = useMemo(() => {
    const historicalMessages: ReceivedChatMessage[] =
      persistedMessages.map((msg) => ({
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
    if (!send || !value.trim()) return;
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
      {/* ✅ Pasamos isHost al header */}
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
