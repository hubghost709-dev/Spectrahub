"use client"; // Este componente debe ser un Client Component

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Para obtener el username de la URL
import { useUser } from "@clerk/nextjs"; // Asumiendo que usas Clerk para la autenticación

const LovenseSettingsPage = () => {
  const params = useParams();
  const { user } = useUser(); // Obtener la información del usuario autenticado de Clerk

  const [mToken, setMToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener el mId y mName del usuario autenticado
  const mId = user?.id; // ID único del usuario
  const mName = user?.username || user?.fullName || "Streamer"; // Nombre del usuario o un fallback

  useEffect(() => {
    const fetchLovenseToken = async () => {
      if (!mId || !mName) {
        // Esperar a que la información del usuario esté disponible
        setIsLoading(false);
        setError("Información de usuario no disponible.");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/lovense/getToken", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mId, mName }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al obtener el token de Lovense.");
        }

        const data = await response.json();
        if (data.result && data.data?.mToken) {
          setMToken(data.data.mToken);
        } else {
          throw new Error(data.message || "No se pudo obtener el mToken de Lovense.");
        }
      } catch (err: any) {
        console.error("[LOVENSE_TOKEN_FETCH_ERROR]", err);
        setError(err.message || "Error desconocido al obtener el token.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLovenseToken();
  }, [mId, mName]); // Dependencias para re-ejecutar cuando mId o mName cambien

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Cargando configuración de Lovense...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!mToken) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No se pudo cargar la configuración de Lovense. Inténtalo de nuevo más tarde.</p>
      </div>
    );
  }

  // URL para el iframe de configuración de Lovense
  const lovenseSettingsUrl = `https://api.lovense-api.com/api/cam/model/v2/setting?mToken=${mToken}`;

  return (
    <div className="p-6 h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Configuración de Lovense</h1>
      <p className="text-sm text-gray-600 mb-4">
        Aquí puedes ajustar la configuración de tus juguetes Lovense. Los cambios pueden tardar hasta 10 segundos en aplicarse.
      </p>
      <div className="flex-grow bg-gray-100 rounded-lg overflow-hidden">
        <iframe
          id="lovense-setting"
          width="100%"
          height="100%" // Ocupa el 100% del contenedor flex-grow
          scrolling="no"
          src={lovenseSettingsUrl}
          title="Lovense Settings"
          className="border-none rounded-lg"
        ></iframe>
      </div>
    </div>
  );
};

export default LovenseSettingsPage;
