"use client";
import { useEffect, useRef, useCallback } from "react";
import { RemoteParticipant } from "livekit-client";
import { useUploadThing } from "@/lib/uploadthing";
import { updateStream } from "@/actions/stream";
import { ParticipantView } from "@livekit/components-react";

type Props = {
  participant: RemoteParticipant;
};

const CAPTURE_INTERVAL = 5 * 60 * 1000; // 5 minutos

function LiveVideo({ participant }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { startUpload } = useUploadThing("streamCapture", {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.url;
      if (url) {
        updateStream({ thumbnailUrl: url }).catch(console.error);
      }
    },
  });

  const captureAndUpload = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

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

  useEffect(() => {
    // Primera captura al conectar (después de 10 segundos)
    const initialCapture = setTimeout(() => {
      captureAndUpload();
    }, 10000);

    // Capturas cada 5 minutos
    const interval = setInterval(() => {
      captureAndUpload();
    }, CAPTURE_INTERVAL);

    return () => {
      clearTimeout(initialCapture);
      clearInterval(interval);
    };
  }, [captureAndUpload]);

  return (
    <div className="relative h-full w-full">
      {/* Canvas oculto para capturar frames */}
      <canvas ref={canvasRef} className="hidden" />

      <ParticipantView
        participant={participant}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export default LiveVideo;
