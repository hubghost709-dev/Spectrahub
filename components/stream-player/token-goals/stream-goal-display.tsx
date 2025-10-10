// components/stream-player/token-goals/stream-goal-display.tsx
"use client";

import { useState, useEffect } from 'react';
import { GoalProgress } from "./goal-progress";

// Define la misma interfaz de meta
interface TokenGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  theme: string;
  color: string;
  isActive: boolean;
  isCompleted: boolean;
}

// Este componente solo se encarga de mostrar la meta activa para el público
export const StreamGoalDisplay = () => {
  const [activeGoal, setActiveGoal] = useState<TokenGoal | null>(null);

  const fetchActiveGoal = async () => {
    try {
      // Pide TODAS las metas
      const response = await fetch("/api/goals"); 
      
      if (!response.ok) throw new Error("Failed to fetch goals");
      
      const goals: TokenGoal[] = await response.json();
      
      // Filtra y encuentra la meta marcada como activa por el streamer
      const currentActive = goals.find(goal => goal.isActive);
      
      setActiveGoal(currentActive || null);
      
    } catch (error) {
      console.error("Error cargando la meta activa:", error);
    }
  };

  useEffect(() => {
    fetchActiveGoal();
    // Refresca la meta cada 30 segundos para actualizar el progreso
    const interval = setInterval(fetchActiveGoal, 30000);
    return () => clearInterval(interval);
  }, []);

  // Si no hay meta activa, no muestra nada en la interfaz del usuario
  if (!activeGoal) {
    return null; 
  }

  // Muestra la meta activa
  return (
    <div className="p-4 border rounded-lg bg-card shadow-lg mt-4">
      <h3 className="text-xl font-semibold mb-2 text-primary">Token Goal Activo</h3>
      <GoalProgress
        name={activeGoal.name}
        targetAmount={activeGoal.targetAmount}
        currentAmount={activeGoal.currentAmount}
        theme={activeGoal.theme}
        color={activeGoal.color}
      />
    </div>
  );
};
