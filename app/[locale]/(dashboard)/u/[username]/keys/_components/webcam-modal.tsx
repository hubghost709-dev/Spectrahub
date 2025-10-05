"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Volume2, VolumeX } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import {
  Room,
  RoomEvent,
  createLocalTracks,
  LocalTrack,
  LocalVideoTrack,
  Track,
  DisconnectReason,
} from "livekit-client";
import { usePathname } from "next/navigation";

interface WebcamModalProps {
  open: boolean;
  onClose: () => void;
}

export const WebcamModal = ({ open, onClose }: WebcamModalProps) => {
  const { user } = useUser();
  const pathname = usePathname();
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);
  const [localTracks, setLocalTracks] = useState<LocalTrack[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptRef = useRef(0);
  const isInitialMount = useRef(true);
  const maxReconnectAttempts = 3;

  const persistStreamState = (state: boolean) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('streamState', JSON.stringify({
        isStreaming: state,
        userId: user?.id
      }));
    }
  };

  const getPersistedStreamState = () => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('streamState');
      if (stored) {
        const { isStreaming, userId } = JSON.parse(stored);
        return userId === user?.id ? isStreaming : false;
      }
    }
    return false;
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isStreaming) {
        reconnectToStream();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isStreaming]);

  useEffect(() => {
    if (isInitialMount.current) {
      if (getPersistedStreamState()) startWebcamStream();
      isInitialMount.current = false;
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isInitialMount.current && isStreaming) reconnectToStream();
  }, [pathname]);

  const checkStreamStatus = async () => {
    try {
      const response = await fetch("/api/stream/status/check");
      if (!response.ok) throw new Error("Failed to check stream status");

      const data = await response.json();

      if (data.isLive && !isStreaming && !isReconnecting) {
        setIsStreaming(true);
        persistStreamState(true);
        reconnectToStream();
      } else if (!data.isLive && isStreaming) {
        setIsStreaming(false);
        persistStreamState(false);
        cleanupStream();
      }
    } catch (error) {
      console.error("Error checking stream status:", error);
    }
  };

  useEffect(() => {
    checkStreamStatus();
    const interval = setInterval(checkStreamStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const cleanupStream = () => {
    localTracks.forEach(track => track.stop());
    setLocalTracks([]);

    if (videoRef.current?.srcObject instanceof MediaStream) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    if (roomRef.current) {
      roomRef.current.disconnect(true);
      roomRef.current = null;
    }

    reconnectAttemptRef.current = 0;
    persistStreamState(false);
  };

  const createStreamToken = async () => {
    const response = await fetch("/api/stream/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.id }),
    });

    if (!response.ok) throw new Error("Failed to get stream token");
    const data = await response.json();
    return data.token;
  };

  const reconnectToStream = async () => {
    if (!isStreaming || isReconnecting || reconnectAttemptRef.current >= maxReconnectAttempts) {
      if (reconnectAttemptRef.current >= maxReconnectAttempts) {
        toast.error("Max reconnection attempts reached");
        setIsStreaming(false);
        persistStreamState(false);
        cleanupStream();
      }
      return;
    }

    try {
      setIsReconnecting(true);
      reconnectAttemptRef.current += 1;
      await startWebcamStream(true);
      reconnectAttemptRef.current = 0;
    } catch (err) {
      if (reconnectAttemptRef.current < maxReconnectAttempts) {
        reconnectTimeoutRef.current = setTimeout(reconnectToStream, 2000 * Math.pow(2, reconnectAttemptRef.current));
      } else {
        toast.error("Failed to reconnect");
        setIsStreaming(false);
        persistStreamState(false);
      }
    } finally {
      setIsReconnecting(false);
    }
  };

  const setupRoomListeners = (room: Room) => {
    room.on(RoomEvent.Disconnected, async (reason) => {
      console.log("Disconnected:", reason);
      if (isStreaming && reason !== DisconnectReason.CLIENT_INITIATED) reconnectToStream();
      else {
        setIsStreaming(false);
        persistStreamState(false);
        cleanupStream();
      }
    });

    room.on(RoomEvent.ConnectionStateChanged, (state) => {
      console.log("Connection state changed:", state);
    });
  };

  const toggleAudio = () => {
    const audioTrack = localTracks.find(track => track.kind === Track.Kind.Audio);
    if (audioTrack) {
      isMuted ? audioTrack.unmute() : audioTrack.mute();
      setIsMuted(!isMuted);
    }
  };

  const startWebcamStream = async (isReconnection = false) => {
    if (!user?.id) return toast.error("User not authenticated");
    try {
      if (!isReconnection) setIsLoading(true);
      cleanupStream();

      const tracks = await createLocalTracks({
        audio: true,
        video: true,
      });

      const token = await createStreamToken();
      const room = new Room({ adaptiveStream: true });

      setupRoomListeners(room);

      await room.connect(process.env.NEXT_PUBLIC_LIVEKIT_WS_URL!, token);

      tracks.forEach(track => room.localParticipant.publishTrack(track));
      setLocalTracks(tracks);

      const videoTrack = tracks.find(track => track.kind === "video") as LocalVideoTrack;
      if (videoTrack && videoRef.current) {
        const mediaStream = new MediaStream([videoTrack.mediaStreamTrack]);
        videoRef.current.srcObject = mediaStream;
      }

      roomRef.current = room;

      if (!isReconnection) {
        await fetch("/api/stream/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isLive: true }),
        });
        setIsStreaming(true);
        persistStreamState(true);
        toast.success("Stream started");
      }
    } catch (error) {
      console.error("Start stream error:", error);
      toast.error("Failed to start stream");
      cleanupStream();
    } finally {
      if (!isReconnection) setIsLoading(false);
    }
  };

  const stopWebcamStream = async () => {
    cleanupStream();
    await fetch("/api/stream/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isLive: false }),
    });
    setIsStreaming(false);
    toast.success("Stream ended");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stream from Webcam</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-background">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {(isLoading || isReconnecting) && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            {isStreaming && (
              <Button onClick={toggleAudio} variant="ghost" size="sm">
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            )}
            <div className="flex-1 flex justify-end">
              {!isStreaming ? (
                <Button onClick={() => startWebcamStream()} disabled={isLoading} variant="primary">
                  {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Connecting...</> : <><Camera className="h-4 w-4 mr-2" />Start Stream</>}
                </Button>
              ) : (
                <Button onClick={stopWebcamStream} variant="destructive">
                  End Stream
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};