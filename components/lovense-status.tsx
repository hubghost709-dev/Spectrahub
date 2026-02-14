"use client";

import { Heart, Battery, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface LovenseToy {
  id: string;
  name: string;
  type: string;
  status: 'on' | 'off';
  battery?: string;
}

interface Props {
  toys: LovenseToy[];
  className?: string;
}

export function LovenseStatus({ toys, className }: Props) {
  if (toys.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-x-2 text-sm font-semibold">
        <Heart className="h-4 w-4 text-pink-500" />
        <span>Interactive Toys</span>
      </div>
      
      <div className="space-y-2">
        {toys.map((toy) => (
          <div
            key={toy.id}
            className="flex items-center justify-between bg-muted/50 rounded-md p-2"
          >
            <div className="flex items-center gap-x-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                toy.status === 'on' ? "bg-green-500 animate-pulse" : "bg-gray-500"
              )} />
              <span className="text-sm font-medium capitalize">
                {toy.name || toy.type}
              </span>
            </div>
            
            {toy.battery && (
              <div className="flex items-center gap-x-1 text-xs text-muted-foreground">
                <Battery className="h-3 w-3" />
                <span>{toy.battery}%</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-x-1 text-xs text-muted-foreground">
        <Zap className="h-3 w-3" />
        <span>Responds to tips</span>
      </div>
    </div>
  );
}
