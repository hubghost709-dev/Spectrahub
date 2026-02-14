"use client";

declare global {
  interface Window {
    camExtension?: any;
  }
}

/**
 * Envía una propina a Lovense para activar el juguete
 * @param amount - Cantidad de tokens
 * @param tipperName - Nombre del usuario que envía la propina
 */
export async function receiveTip(amount: number, tipperName: string): Promise<void> {
  try {
    if (typeof window === 'undefined' || !window.camExtension) {
      console.warn('Lovense not initialized');
      return;
    }

    window.camExtension.receiveTip(amount, tipperName);
    console.log(`✅ Lovense tip sent: ${amount} tokens from ${tipperName}`);
  } catch (error) {
    console.error('❌ Error sending tip to Lovense:', error);
  }
}

/**
 * Envía un mensaje al chat de Lovense
 * @param userName - Nombre del usuario
 * @param content - Contenido del mensaje
 */
export async function receiveMessage(userName: string, content: string): Promise<void> {
  try {
    if (typeof window === 'undefined' || !window.camExtension) {
      return;
    }

    window.camExtension.receiveMessage(userName, content);
  } catch (error) {
    console.error('Error sending message to Lovense:', error);
  }
}

/**
 * Obtiene el estado de los juguetes conectados
 */
export async function getToyStatus(): Promise<any[]> {
  try {
    if (typeof window === 'undefined' || !window.camExtension) {
      return [];
    }

    const status = await window.camExtension.getToyStatus();
    return status || [];
  } catch (error) {
    console.error('Error getting toy status:', error);
    return [];
  }
}

/**
 * Obtiene la configuración de Lovense
 */
export async function getSettings(): Promise<any> {
  try {
    if (typeof window === 'undefined' || !window.camExtension) {
      return null;
    }

    const settings = await window.camExtension.getSettings();
    return settings;
  } catch (error) {
    console.error('Error getting Lovense settings:', error);
    return null;
  }
}

/**
 * Inicializa la extensión de Lovense para una modelo
 * @param websiteName - Nombre del sitio (SpectraHub)
 * @param modelName - Nombre de la modelo
 */
export function initializeLovense(websiteName: string, modelName: string): void {
  if (typeof window === 'undefined' || !window.CamExtension) {
    console.warn('Lovense SDK not loaded');
    return;
  }

  try {
    const camExtension = new window.CamExtension(websiteName, modelName);
    
    // Ready event
    camExtension.on("ready", async (ce: any) => {
      console.log("✅ Lovense initialized for", modelName);
      window.camExtension = ce;
      
      // Get initial toy status
      try {
        const toys = await ce.getToyStatus();
        console.log("Connected toys:", toys);
      } catch (error) {
        console.error("Error getting initial toy status:", error);
      }
    });

    // Toy status change
    camExtension.on("toyStatusChange", (data: any) => {
      console.log("Toy status changed:", data);
    });

    // Settings change
    camExtension.on("settingsChange", (data: any) => {
      console.log("Settings changed:", data);
    });

    // SDK Error
    camExtension.on("sdkError", (data: any) => {
      console.error("Lovense SDK error:", data.code, data.message);
    });

    // Post message
    camExtension.on("postMessage", (message: string) => {
      console.log("Lovense message:", message);
      // Aquí puedes enviar el mensaje al chat si quieres
    });

  } catch (error) {
    console.error("Error initializing Lovense:", error);
  }
}
