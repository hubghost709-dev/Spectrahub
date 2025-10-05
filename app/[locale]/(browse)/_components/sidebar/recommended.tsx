"use client";

import { User } from "@prisma/client";
import { useSidebar } from "@/store/use-sidebar";
import { UserItemSkeleton } from "./user-item";
import { UserItem } from "./user-item";
import { useTranslations } from "next-intl"; // Importar el hook de traducciones

interface RecommendedProps {
  data: (User & {
    stream: { isLive: boolean } | null;
  })[];
}

export const Recommended = ({ data }: RecommendedProps) => {
  const { collapsed } = useSidebar((state) => state);
  const verifiedModels = data.filter(user => user.isVerifiedModel);
  const showLabel = !collapsed && verifiedModels.length > 0;
  const t = useTranslations(); // Obtener la función de traducción

  return (
    <div>
      {showLabel && (
        <div className="pl-6 mb-4">
          {/* Usar la traducción para "Recommended" */}
          <p className="text-sm text-muted-foreground">{t("recommended")}</p>
        </div>
      )}
      {verifiedModels.length > 0 && (
        <ul className="space-y-2 px-2">
          {verifiedModels.map((user) => (
            <UserItem
              key={user.id}
              username={user.username}
              imageUrl={user.imageUrl}
              isLive={user.stream?.isLive ?? false}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export const RecommendedSkeleton = () => {
  return (
    <ul className="space-y-2 px-2">
      {[...Array(3)].map((_, i) => (
        <UserItemSkeleton key={i} />
      ))}
    </ul>
  );
};