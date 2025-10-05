"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const VerifyModal = ({ isOpen, onClose, onSuccess }: VerifyModalProps) => {
  const t = useTranslations('VerifyModal'); // Namespace para traducciones
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    birthDate: "",
    idFrontImage: "",
    idBackImage: "",
    selfieImage: "",
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasFrontRef = useRef<HTMLCanvasElement>(null);
  const canvasBackRef = useRef<HTMLCanvasElement>(null);
  const canvasSelfieRef = useRef<HTMLCanvasElement>(null);
  const [activeCamera, setActiveCamera] = useState<"front" | "back" | "selfie" | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment');

  useEffect(() => {
    if (!activeCamera) return;

    const initializeCamera = async () => {
      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: activeCamera === 'selfie' ? 'user' : cameraFacingMode,
            ...(activeCamera === 'selfie' ? {
              width: { ideal: 720 },
              height: { ideal: 720 }
            } : {})
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        toast.error(t('errors.cameraError'));
        setActiveCamera(null);
      }
    };

    initializeCamera();

    const videoElement = videoRef.current;

    return () => {
      if (videoElement?.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeCamera, cameraFacingMode, t]);

  const captureImage = (type: "front" | "back" | "selfie") => {
    const canvasMap = {
      front: canvasFrontRef.current,
      back: canvasBackRef.current,
      selfie: canvasSelfieRef.current
    };

    const canvas = canvasMap[type];
    const video = videoRef.current;

    if (!canvas || !video) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    if (type === 'selfie') {
      canvas.width = 720;
      canvas.height = 720;
    } else {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageKey = type === 'front' ? 'idFrontImage' 
      : type === 'back' ? 'idBackImage' 
      : 'selfieImage';

    setFormData(prev => ({
      ...prev,
      [imageKey]: canvas.toDataURL('image/jpeg', 0.8)
    }));

    if (video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setActiveCamera(null);
  };

  const removeImage = (type: "front" | "back" | "selfie") => {
    const imageKey = type === 'front' ? 'idFrontImage' 
      : type === 'back' ? 'idBackImage' 
      : 'selfieImage';
    
    setFormData(prev => ({
      ...prev,
      [imageKey]: ""
    }));
  };

  const toggleCameraFacingMode = () => {
    setCameraFacingMode(prev => 
      prev === 'user' ? 'environment' : 'user'
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!user) {
        toast.error(t('errors.loginError'));
        return;
      }

      const response = await fetch('/api/model-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          birthDate: formData.birthDate,
          idFrontImage: formData.idFrontImage,
          idBackImage: formData.idBackImage,
          selfieImage: formData.selfieImage
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errors.submissionError'));
      }

      toast.success(t('successMessage'));
      router.refresh();
      onClose();
      onSuccess?.();

    } catch (error) {
      console.error("Verification error:", error);
      toast.error(error instanceof Error ? error.message : t('errors.verificationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>{t('fullNameLabel')}</Label>
            <Input
              placeholder={t('fullNamePlaceholder')}
              value={formData.fullName}
              onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{t('birthDateLabel')}</Label>
            <Input
              type="date"
              max={new Date().toISOString().split('T')[0]}
              value={formData.birthDate}
              onChange={e => setFormData(p => ({ ...p, birthDate: e.target.value }))}
              disabled={isLoading}
              required
            />
          </div>

          {/* Front ID */}
          <div className="space-y-2">
            <Label>{t('idFrontLabel')}</Label>
            {formData.idFrontImage ? (
              <div className="relative aspect-[3/2] rounded-lg border">
                <Image 
                  src={formData.idFrontImage}
                  alt={t('idFrontAlt')}
                  className="object-cover w-full h-full"
                  width={640}
                  height={426}
                  unoptimized
                />
                <div className="absolute top-2 right-2 space-x-2">
                  <Button type="button" size="sm" onClick={() => setActiveCamera("front")} variant="secondary">
                    {t('retakeButton')}
                  </Button>
                  <Button type="button" size="sm" variant="destructive" onClick={() => removeImage("front")}>
                    {t('removeButton')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {activeCamera === "front" && (
                  <div className="space-y-2">
                    <div className="relative border rounded-lg overflow-hidden aspect-video">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <Button 
                        type="button" 
                        onClick={toggleCameraFacingMode} 
                        className="absolute top-2 right-2" 
                        variant="secondary" 
                        size="sm"
                      >
                        {cameraFacingMode === 'user' 
                          ? t('switchToBackCamera') 
                          : t('switchToFrontCamera')}
                      </Button>
                    </div>
                    <Button type="button" onClick={() => captureImage("front")} className="w-full">
                      {t('captureFrontButton')}
                    </Button>
                  </div>
                )}
                {!activeCamera && (
                  <Button 
                    type="button" 
                    onClick={() => setActiveCamera("front")} 
                    className="w-full" 
                    variant="secondary"
                  >
                    {t('takeFrontButton')}
                  </Button>
                )}
                <canvas ref={canvasFrontRef} className="hidden" />
              </div>
            )}
          </div>

          {/* Back ID */}
          <div className="space-y-2">
            <Label>{t('idBackLabel')}</Label>
            {formData.idBackImage ? (
              <div className="relative aspect-[3/2] rounded-lg border">
                <Image 
                  src={formData.idBackImage}
                  alt={t('idBackAlt')}
                  className="object-cover w-full h-full"
                  width={640}
                  height={426}
                  unoptimized
                />
                <div className="absolute top-2 right-2 space-x-2">
                  <Button type="button" size="sm" onClick={() => setActiveCamera("back")} variant="secondary">
                    {t('retakeButton')}
                  </Button>
                  <Button type="button" size="sm" variant="destructive" onClick={() => removeImage("back")}>
                    {t('removeButton')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {activeCamera === "back" && (
                  <div className="space-y-2">
                    <div className="relative border rounded-lg overflow-hidden aspect-video">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <Button 
                        type="button" 
                        onClick={toggleCameraFacingMode} 
                        className="absolute top-2 right-2" 
                        variant="secondary" 
                        size="sm"
                      >
                        {cameraFacingMode === 'user' 
                          ? t('switchToBackCamera') 
                          : t('switchToFrontCamera')}
                      </Button>
                    </div>
                    <Button type="button" onClick={() => captureImage("back")} className="w-full">
                      {t('captureBackButton')}
                    </Button>
                  </div>
                )}
                {!activeCamera && (
                  <Button 
                    type="button" 
                    onClick={() => setActiveCamera("back")} 
                    className="w-full" 
                    variant="secondary"
                  >
                    {t('takeBackButton')}
                  </Button>
                )}
                <canvas ref={canvasBackRef} className="hidden" />
              </div>
            )}
          </div>

          {/* Selfie */}
          <div className="space-y-2">
            <Label>{t('selfieLabel')}</Label>
            {formData.selfieImage ? (
              <div className="relative aspect-square rounded-lg border">
                <Image 
                  src={formData.selfieImage}
                  alt={t('selfieAlt')}
                  className="object-cover w-full h-full"
                  width={720}
                  height={720}
                  unoptimized
                />
                <div className="absolute top-2 right-2 space-x-2">
                  <Button type="button" size="sm" onClick={() => setActiveCamera("selfie")} variant="secondary">
                    {t('retakeButton')}
                  </Button>
                  <Button type="button" size="sm" variant="destructive" onClick={() => removeImage("selfie")}>
                    {t('removeButton')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {activeCamera === "selfie" && (
                  <div className="space-y-2">
                    <div className="border rounded-lg overflow-hidden aspect-square">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    </div>
                    <Button type="button" onClick={() => captureImage("selfie")} className="w-full">
                      {t('captureSelfieButton')}
                    </Button>
                  </div>
                )}
                {!activeCamera && (
                  <Button 
                    type="button" 
                    onClick={() => setActiveCamera("selfie")} 
                    className="w-full" 
                    variant="secondary"
                  >
                    {t('takeSelfieButton')}
                  </Button>
                )}
                <canvas ref={canvasSelfieRef} className="hidden" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              {t('cancelButton')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !formData.fullName || !formData.birthDate || !formData.idFrontImage || !formData.idBackImage || !formData.selfieImage}
            >
              {isLoading ? t('submittingButton') : t('submitButton')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};