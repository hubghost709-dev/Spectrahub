"use client";

import { useState } from "react";
import { WebcamModal } from "./webcam-modal";
import { Button } from "@/components/ui/button"; // Asegúrate de importar tu componente Button
import { Camera } from "lucide-react"; // Importa el ícono de cámara

export function WebcamButton() {
    const [webcamOpen, setWebcamOpen] = useState(false);
  
    return (
        <>
 
      <Button 
        variant="secondary"
        onClick={() => setWebcamOpen(true)}
        className="gap-2"
      >
        <Camera className="h-4 w-4" />
        Webcam Stream
      </Button>
      
      <WebcamModal 
         open={webcamOpen} 
         onClose={() => setWebcamOpen(false)}
       
      />
    </>
  );
};