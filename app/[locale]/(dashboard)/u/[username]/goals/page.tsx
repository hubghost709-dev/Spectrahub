// Tu archivo original page.tsx
import { GoalManager } from "@/components/stream-player/token-goals/goal-manager";
import { StreamGoalDisplay } from "@/components/stream-player/token-goals/stream-goal-display"; // 👈 Nuevo Import
import { getSelf } from "@/lib/auth-service";

// Opcional: Podrías querer que el streamer vea la meta "pública" que creó.
const GoalsPage = async () => {
  // Solo el streamer puede acceder a esta página
  const self = await getSelf();

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Token Goals</h1>
        <p className="text-muted-foreground">Manage your stream goals</p>
      </div>

      {/* 🚀 EL GOAL PÚBLICO (Visible para todos si estuviera en la ruta pública) */}
      {/* Lo incluimos aquí para que el streamer vea cómo luce su goal */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Vista Previa de la Meta (Público)</h2>
        <StreamGoalDisplay />
      </div>
      
      {/* 🛠️ LA INTERFAZ DE GESTIÓN (Solo para el streamer) */}
      <GoalManager />
    </div>
  );
};

export default GoalsPage;
