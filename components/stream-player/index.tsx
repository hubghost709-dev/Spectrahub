"use client";

import { useViewerToken } from "@/hooks/use-viewer-token";
import { LiveKitRoom } from "@livekit/components-react";
import { cn } from "@/lib/utils";
import { useChatSidebar } from "@/store/use-chat-sidebar";
import Video, { VideoSkeleton } from "./video";
import Chat, { ChatSkeleton } from "./chat";
import ChatToggle from "./chat-toggle";
import Header, { HeaderSkeleton } from "./header";
import InfoCard from "./info-card";
import AboutCard from "./about-card";
import { GoalProgress } from "./token-goals/goal-progress";
import { useEffect, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { AnimatePresence, motion } from "framer-motion";

export type CustomStream = {
  id: string;
  isChatEnabled: boolean;
  isChatDelayed: boolean;
  isChatFollowersOnly: boolean;
  isLive: boolean;
  thumbnailUrl: string | null;
  offlineThumbnailUrl: string | null;
  name: string;
  pinnedMessage: string | null;
  streamTopic: string | null;
  blockedCountries: string[];
};

export type CustomUser = {
  id: string;
  username: string;
  bio: string | null;
  stream: CustomStream | null;
  imageUrl: string;
  isVerifiedModel: boolean;
  _count: { follower: number };
};

type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  theme: string;
  color: string;
  isActive: boolean;
  isCompleted: boolean;
};

type Props = {
  user: CustomUser;
  stream: CustomStream;
  isFollowing: boolean;
};

function StreamPlayer({ user, stream, isFollowing }: Props) {
  const { token, name, identity } = useViewerToken(user.id);
  const { collapsed } = useChatSidebar((state) => state);
  const [goals, setGoals] = useState<Goal[]>([]);
  const isMobile = useMediaQuery("(max-width: 1024px)", {
    initializeWithValue: false,
  });
  const [chatOpen, setChatOpen] = useState(false);

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_WS_URL;

  useEffect(() => {
    let active = true;

    const fetchGoals = async () => {
      try {
        const response = await fetch(
          `/api/goals?username=${encodeURIComponent(user.username)}`
        );

        if (!response.ok) throw new Error("Failed to fetch goals");

        const data: Goal[] = await response.json();

        if (!active) return;

        setGoals(
          data.filter((goal) => goal.isActive && !goal.isCompleted)
        );
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    };

    fetchGoals();
    const interval = setInterval(fetchGoals, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user.username]);

  if (!serverUrl || !token || !name || !identity) {
    return <StreamPlayerSkeleton />;
  }

  const pinned =
    stream.pinnedMessage ||
    stream.streamTopic ||
    "";

  return (
    <>
      {collapsed && (
        <div className="hidden lg:block fixed top-[100px] right-2 z-50">
          <ChatToggle />
        </div>
      )}

      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        className={cn(
          "grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 h-full",
          collapsed && "lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2"
        )}
      >
        <div className="space-y-4 col-span-1 lg:col-span-2 xl:col-span-2 2xl:col-span-5 lg:overflow-y-auto hidden-scrollbar pb-10">
          <Video
            hostname={user.username}
            hostIdentity={user.id}
            viewerIdentity={identity}
          />

          {goals.length > 0 && (
            <div className="px-4 space-y-4">
              <h2 className="text-lg font-semibold">Stream Goals</h2>
              {goals.map((goal) => (
                <GoalProgress
                  key={goal.id}
                  name={goal.name}
                  targetAmount={goal.targetAmount}
                  currentAmount={goal.currentAmount}
                  theme={goal.theme}
                  color={goal.color}
                />
              ))}
            </div>
          )}

          <Header
            hostName={user.username}
