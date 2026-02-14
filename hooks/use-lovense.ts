"use client";

import { useEffect, useState, useCallback, useRef } from 'react';

declare global {
  interface Window {
    CamExtension: any;
  }
}

interface LovenseToy {
  id: string;
  name: string;
  type: string;
  status: 'on' | 'off';
  version?: string;
  battery?: string;
}

interface LovenseSettings {
  levels: {
    level1: { min: number; max: number; time: number; rLevel: number; vLevel: number };
    level2: { min: number; max: number; time: number; rLevel: number; vLevel: number };
    level3: { min: number; max: number; time: number; rLevel: number; vLevel: number };
  };
  special: any;
}

export function useLovense(websiteName: string, modelName: string) {
  const [isReady, setIsReady] = useState(false);
  const [toys, setToys] = useState<LovenseToy[]>([]);
  const [settings, setSettings] = useState<LovenseSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const camExtensionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.CamExtension) {
      return;
    }

    try {
      const camExtension = new window.CamExtension(websiteName, modelName);
      camExtensionRef.current = camExtension;

      // Ready event
      camExtension.on("ready", async (ce: any) => {
        console.log("Lovense ready");
        setIsReady(true);
        
        // Get initial data
        try {
          const toyStatus = await ce.getToyStatus();
          setToys(toyStatus || []);
          
          const config = await ce.getSettings();
          setSettings(config);
        } catch (err) {
          console.error("Error getting Lovense data:", err);
        }
      });

      // Toy status change
      camExtension.on("toyStatusChange", (data: LovenseToy[]) => {
        console.log("Toy status changed:", data);
        setToys(data || []);
      });

      // Settings change
      camExtension.on("settingsChange", (data: LovenseSettings) => {
        console.log("Settings changed:", data);
        setSettings(data);
      });

      // SDK Error
      camExtension.on("sdkError", (data: { code: string; message: string }) => {
        console.error("Lovense SDK error:", data);
        setError(`${data.code}: ${data.message}`);
      });

      // Post message (messages to chat)
      camExtension.on("postMessage", (message: string) => {
        console.log("Lovense message:", message);
        // Puedes emitir esto a tu sistema de chat si lo necesitas
      });

    } catch (err) {
      console.error("Error initializing Lovense:", err);
      setError("Failed to initialize Lovense");
    }

    return () => {
      // Cleanup if needed
    };
  }, [websiteName, modelName]);

  // Send tip to Lovense
  const sendTip = useCallback((amount: number, tipperName: string) => {
    if (!camExtensionRef.current || !isReady) {
      console.warn("Lovense not ready");
      return;
    }

    try {
      camExtensionRef.current.receiveTip(amount, tipperName);
      console.log(`Sent tip to Lovense: ${amount} from ${tipperName}`);
    } catch (err) {
      console.error("Error sending tip to Lovense:", err);
    }
  }, [isReady]);

  // Send chat message
  const sendMessage = useCallback((userName: string, content: string) => {
    if (!camExtensionRef.current || !isReady) {
      return;
    }

    try {
      camExtensionRef.current.receiveMessage(userName, content);
    } catch (err) {
      console.error("Error sending message to Lovense:", err);
    }
  }, [isReady]);

  return {
    isReady,
    toys,
    settings,
    error,
    sendTip,
    sendMessage,
  };
}
