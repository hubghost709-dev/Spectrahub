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

type Props = {
  user: CustomUser;
  stream: CustomStream;
  isFollowing: boolean;
};

function StreamPlayer({ user, stream, isFollowing }: Props) {
  const { token, name, identity } = useViewerToken(user.id);
  const { collapsed } = useChatSidebar((state) => state);
  const [goals, setGoals] = useState<any[]>([]);
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch(`/api/goals?username=${user.username}`);
        if (!response.ok) throw new Error("Failed to fetch goals");
        const data = await response.json();
        setGoals(data.filter((goal: any) => goal.isActive && !goal.isCompleted));
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    };

    fetchGoals();
    const interval = setInterval(fetchGoals, 30000);
    return () => clearInterval(interval);
  }, [user.username]);

  if (!token || !name || !identity) {
    return <StreamPlayerSkeleton />;
  }

  return (
    <>
      {collapsed && (
        <div className="hidden lg:block fixed top-[100px] right-2 z-50">
          <ChatToggle />
        </div>
      )}
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
        className={cn(
          "grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 h-full",
          collapsed && "lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2"
        )}
      >
        {/* VIDEO + INFO */}
        <div className="space-y-4 col-span-1 lg:col-span-2 xl:col-span-2 2xl:col-span-5 lg:overflow-y-auto hidden-scrollbar pb-10">
          <Video hostname={user.username} hostIdentity={user.id} />

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
            hostIdentity={user.id}
            viewerIdentity={identity}
            imageUrl={user.imageUrl}
            isFollowing={isFollowing}
            name={stream.name}
            username={user.username}
            isVerifiedModel={user.isVerifiedModel}
          />
          <InfoCard
            hostIdentity={user.id}
            viewerIdentity={identity}
            name={stream.name}
            thumbnailUrl={stream.thumbnailUrl}
          />
          <AboutCard
            hostName={user.username}
            hostIdentity={user.id}
            viewerIdentity={identity}
            bio={user.bio}
            followedByCount={user._count.follower}
          />
        </div>

        {/* DESKTOP CHAT */}
        {!isMobile && (
          <div className={cn("col-span-1", collapsed && "hidden")}>
            <Chat
              viewerName={name}
              hostName={user.username}
              hostIdentity={user.id}
              isFollowing={isFollowing}
              isChatEnabled={stream.isChatEnabled}
              isChatDelayed={stream.isChatDelayed}
              isChatFollowersOnly={stream.isChatFollowersOnly}
              pinnedMessage={stream.pinnedMessage || stream.streamTopic || ""}
            />
          </div>
        )}

        {/* MOBILE CHAT */}
        {isMobile && (
          <>
            {/* Botón flotante */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="fixed bottom-4 right-4 bg-pink-600 text-white px-4 py-2 rounded-full shadow-lg z-50"
            >
              Chat
            </button>

            {/* Drawer con animación */}
            <AnimatePresence>
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: chatOpen ? 0 : "100%" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="fixed inset-0 bg-black/60 flex justify-center items-end z-50"
                style={{ pointerEvents: chatOpen ? "auto" : "none" }}
              >
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: chatOpen ? 0 : 100, opacity: chatOpen ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="w-full h-[70vh] bg-[#1e1e1e] rounded-t-2xl p-4 flex flex-col"
                >
                  <div className="flex justify-between items-center text-white mb-2">
                    <h2 className="text-lg font-semibold">Chat</h2>
                    <button onClick={() => setChatOpen(false)}>✖</button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <Chat
                      viewerName={name}
                      hostName={user.username}
                      hostIdentity={user.id}
                      isFollowing={isFollowing}
                      isChatEnabled={stream.isChatEnabled}
                      isChatDelayed={stream.isChatDelayed}
                      isChatFollowersOnly={stream.isChatFollowersOnly}
                      pinnedMessage={stream.pinnedMessage || stream.streamTopic || ""}
                    />
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </LiveKitRoom>
    </>
  );
}

export default StreamPlayer;

export const StreamPlayerSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 h-full">
      <div className="space-y-4 col-span-1 lg:col-span-2 xl:col-span-2 2xl:col-span-5 lg:overflow-y-auto hidden-scrollbar pb-10">
        <VideoSkeleton />
        <HeaderSkeleton />
      </div>
      <div className="col-span-1 bg-background">
        <ChatSkeleton />
      </div>
    </div>
  );
};

