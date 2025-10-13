"use client";

import { useState, useEffect, useMemo } from "react"; // 👈 Importamos useMemo
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { GoalProgress } from "./goal-progress";

interface TokenGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  theme: string;
  color: string;
  isActive: boolean; // Usaremos esta propiedad
  isCompleted: boolean;
}

export const GoalManager = () => {
  const [goals, setGoals] = useState<TokenGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: 0,
    theme: "default",
    color: "#1010f2"
  });

  const fetchGoals = async () => {
    try {
      const response = await fetch("/api/goals");
      if (!response.ok) throw new Error("Failed to fetch goals");
      const data = await response.json();
      setGoals(data);
    } catch (error) {
      toast.error("Failed to load goals");
    }
  };

  useEffect(() => {
    fetchGoals();
    const interval = setInterval(fetchGoals, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateGoal = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGoal),
      });

      if (!response.ok) throw new Error("Failed to create goal");
      
      await fetchGoals();
      toast.success("Goal created successfully");
      setNewGoal({ name: "", targetAmount: 0, theme: "default", color: "#1010f2" });
    } catch (error) {
      toast.error("Failed to create goal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGoal = async (goalId: string, updates: Partial<TokenGoal>) => {
    try {
      const response = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId, ...updates }),
      });

      if (!response.ok) throw new Error("Failed to update goal");
      
      await fetchGoals();
      toast.success("Goal updated successfully");
    } catch (error) {
      toast.error("Failed to update goal");
    }
  };

  const handleResetGoal = async (goalId: string) => {
    await handleUpdateGoal(goalId, { currentAmount: 0, isCompleted: false });
  };

  // 👈 Nuevo: Encontrar la meta activa (o la primera si no hay activas)
  const activeGoal = useMemo(() => {
    return goals.find(goal => goal.isActive) || goals[0];
  }, [goals]);

  // Se remueve la función getWidgetUrl ya que no será necesaria en este enfoque.
  // const getWidgetUrl = (goalId: string) => {
  //   return `${window.location.origin}/widget/goals/${goalId}`;
  // };

  return (
    <div className="p-6">
      {/* 👈 Sección de visualización pública - Muestra la meta activa */}
      {activeGoal ? (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-3">Goal en Vivo</h2>
          <GoalProgress
            name={activeGoal.name}
            targetAmount={activeGoal.targetAmount}
            currentAmount={activeGoal.currentAmount}
            theme={activeGoal.theme}
            color={activeGoal.color}
          />
          <p className="text-sm text-center text-muted-foreground mt-2">
            Esta es la meta que los usuarios verán automáticamente en esta página.
          </p>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-muted/50 rounded-lg text-center">
          <p className="text-muted-foreground">Crea una meta y actívala para que aparezca aquí.</p>
        </div>
      )}

      {/* Secciones de administración */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Goals Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Goals Actuales</h2>
          {goals.length === 0 ? (
            <p className="text-muted-foreground">No hay goals activos</p>
          ) : (
            goals.map((goal) => (
              // 👈 Usamos el activeGoal.id para evitar mostrar la meta dos veces
              <div key={goal.id} className="bg-background border rounded-lg p-4 space-y-4">
                <GoalProgress
                  name={goal.name}
                  targetAmount={goal.targetAmount}
                  currentAmount={goal.currentAmount}
                  theme={goal.theme}
                  color={goal.color}
                />
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResetGoal(goal.id)}
                  >
                    Resetear Progreso
                  </Button>
                  {/* Se elimina el botón de copiar URL del widget */}
                  <Button
                    size="sm"
                    // 👈 Usamos variant="default" si está activo para un mejor contraste visual
                    variant={goal.isActive ? "default" : "outline"} 
                    onClick={() => handleUpdateGoal(goal.id, { isActive: !goal.isActive })}
                  >
                    {goal.isActive ? "Activa (Clic para Desactivar)" : "Activar"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create New Goal Section */}
        <div className="bg-background border rounded-lg p-6 h-fit"> {/* 👈 h-fit para que no se estire */}
          <h2 className="text-2xl font-bold mb-4">Crear Nuevo Goal</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nombre del Goal</label>
              <Input
                value={newGoal.name}
                onChange={(e) => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ingresa el nombre del goal"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Cantidad Meta (Tokens)</label>
              <Input
                type="number"
                value={newGoal.targetAmount || ""}
                onChange={(e) => setNewGoal(prev => ({ ...prev, targetAmount: parseInt(e.target.value) || 0 }))} // 👈 Añadimos || 0
                placeholder="Ingresa la cantidad meta"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tema</label>
              <Select
                value={newGoal.theme}
                onValueChange={(value) => setNewGoal(prev => ({ ...prev, theme: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="gamer">Gamer</SelectItem>
                  <SelectItem value="retro">Retro</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Color</label>
              <Input
                type="color"
                value={newGoal.color}
                onChange={(e) => setNewGoal(prev => ({ ...prev, color: e.target.value }))}
              />
            </div>
            <Button
              onClick={handleCreateGoal}
              disabled={isLoading || !newGoal.name || newGoal.targetAmount <= 0} // 👈 Validamos que sea > 0
              className="w-full"
              variant="primary"
            >
              {isLoading ? "Creando..." : "Crear Goal"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
