// components/stream-player/token-goals/stream-goal-display.tsx
"use client";

import { useState, useEffect } from 'react';
import { GoalProgress } from "./goal-progress";
import { toast } from "sonner";

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

export const StreamGoalDisplay = () => {
  const [activeGoal, setActiveGoal] = useState<TokenGoal | null>(null);

  const fetchActiveGoal = async () => {
    try {
      // 🚨 IMPORTANTE: Asumimos que esta API ahora devuelve SOLO la meta activa,
      // o que hay una nueva ruta, por ejemplo: /api/goals/active
      const response = await fetch("/api/goals"); 
      
      if (!response.ok) throw new Error("Failed to fetch goals");
      
      const goals: TokenGoal[] = await response.json();
      
      // Filtramos para encontrar la meta activa
      const currentActive = goals.find(goal => goal.isActive);
      
      setActiveGoal(currentActive || null);
      
    } catch (error) {
      console.error("Failed to load active goal for viewer:", error);
      // No mostramos toast a los espectadores, solo un error en consola
    }
  };

  useEffect(() => {
    fetchActiveGoal();
    // 🔔 Refresca la meta cada 30 segundos para actualizar el progreso
    const interval = setInterval(fetchActiveGoal, 30000);
    return () => clearInterval(interval);
  }, []);

  // Si no hay meta activa, no mostramos nada
  if (!activeGoal) {
    return null; 
  }

  // Renderiza el GoalProgress visible para el público
  return (
    <div className="p-4 border rounded-lg bg-card shadow-lg mb-4">
      <h3 className="text-xl font-semibold mb-2">Meta de Stream</h3>
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
