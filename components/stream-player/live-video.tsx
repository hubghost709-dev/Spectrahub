"use client";

import { Participant, Track } from "livekit-client";
import { useTracks } from "@livekit/components-react";
import { useEffect, useRef, useState, useCallback } from "react";
import FullScreenControl from "./full-screen-control";
import { useEventListener } from "usehooks-ts";
import VolumeControl from "./volume-control";
import { updateStream } from "@/actions/stream";
import { useUploadThing } from "@/lib/uploadthing";

type Props = {
  participant: Participant;
};

const CAPTURE_INTERVAL = 5 * 60 * 1000; // 5 minutos

function LiveVideo({ participant }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [volume, setVolume] = useState(0);

  const { startUpload } = useUploadThing("streamCapture", {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.url;
      if (url) {
        updateStream({ thumbnailUrl: url }).catch(console.error);
      }
    },
    onUploadError: (error) => {
      console.error("Error uploading capture:", error);
    },
  });

  // Captura un frame del video y lo sube
  const captureAndUpload = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    try {
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "stream-capture.jpg", {
          type: "image/jpeg",
        });
        await startUpload([file]);
      }, "image/jpeg", 0.8);
    } catch (error) {
      console.error("Error capturing stream:", error);
    }
  }, [startUpload]);

  // Captura inicial y cada 5 minutos
  useEffect(() => {
    const initialCapture = setTimeout(() => {
      captureAndUpload();
    }, 10000); // Primera captura a los 10 segundos

    const interval = setInterval(() => {
      captureAndUpload();
    }, CAPTURE_INTERVAL);

    return () => {
      clearTimeout(initialCapture);
      clearInterval(interval);
    };
  }, [captureAndUpload]);

  const onVolumeChange = (value: number) => {
    setVolume(+value);
    if (videoRef?.current) {
      videoRef.current.muted = value === 0;
      videoRef.current.volume = +value * 0.01;
    }
  };

  const toggleMute = () => {
    const isMuted = volume === 0;
    setVolume(isMuted ? 50 : 0);
    if (videoRef?.current) {
      videoRef.current.muted = !isMuted;
      videoRef.current.volume = isMuted ? 0.5 : 0;
    }
  };

  useEffect(() => {
    onVolumeChange(0);
  }, []);

  const toggleFullScreen = () => {
    if (isFullScreen) {
      document.exitFullscreen();
    } else if (wrapperRef?.current) {
      wrapperRef.current.requestFullscreen();
    }
  };

  const handleFullScreenChange = () => {
    const isCurrentlyFullScreen = document.fullscreenElement !== null;
    setIsFullScreen(isCurrentlyFullScreen);
  };

  useEventListener("fullscreenchange", handleFullScreenChange, wrapperRef);

  useTracks([Track.Source.Camera, Track.Source.Microphone])
    .filter((track) => track.participant.identity === participant.identity)
    .forEach((track) => {
      if (videoRef?.current) {
        track.publication.track?.attach(videoRef?.current);
      }
    });

  return (
    <div className="relative h-full flex" ref={wrapperRef}>
      {/* Canvas oculto para capturar frames */}
      <canvas ref={canvasRef} className="hidden" />
      <video width={"100%"} ref={videoRef} />
      <div className="absolute top-0 h-full w-full opacity-0 hover:opacity-100 transition-all">
        <div className="absolute bottom-0 flex h-14 w-full items-center justify-between bg-gradient-to-r from-neutral-900 px-4">
          <VolumeControl
            onChange={onVolumeChange}
            value={volume}
            onToggle={toggleMute}
          />
          <FullScreenControl
            isFullScreen={isFullScreen}
            onToggle={toggleFullScreen}
          />
        </div>
      </div>
    </div>
  );
}

export default LiveVideo;
