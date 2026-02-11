"use client";
import { ConnectionState, Track } from "livekit-client";
import {
  useConnectionState,
  useRemoteParticipant,
  useTracks,
} from "@livekit/components-react";
import OfflineVideo from "./offline-video";
import LoadingVideo from "./loading-video";
import LiveVideo from "./live-video";
import { Skeleton } from "../ui/skeleton";
import { useEffect } from "react";
import { updateStreamLiveStatus } from "@/actions/ingress";

type Props = {
  hostname: string;
  hostIdentity: string;
  viewerIdentity: string;
};

function Video({ hostIdentity, hostname, viewerIdentity }: Props) {
  const connectionState = useConnectionState();
  const participant = useRemoteParticipant(hostIdentity);
  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.Microphone,
  ]).filter((track) => track.participant.identity === hostIdentity);

  const isHostConnected = !!(participant && tracks.length > 0);
  const isHost = `host-${hostIdentity}` === viewerIdentity;

  // Solo el host puede actualizar el estado isLive
  useEffect(() => {
    if (!isHost) return;

    if (connectionState === ConnectionState.Connected) {
      updateStreamLiveStatus(isHostConnected).catch(console.error);
    }
  }, [isHostConnected, connectionState, isHost]);

  let content;

  if (!participant && connectionState === ConnectionState.Connected) {
    content = <OfflineVideo username={hostname} />;
  } else if (!participant || tracks.length === 0) {
    content = <LoadingVideo label={connectionState} />;
  } else {
    content = <LiveVideo participant={participant} />;
  }

  return <div className="aspect-video border-b group relative">{content}</div>;
}

export default Video;

export const VideoSkeleton = () => {
  return (
    <div className="aspect-video border-x border-background">
      <Skeleton className="h-full w-full rounded-none" />
    </div>
  );
};
