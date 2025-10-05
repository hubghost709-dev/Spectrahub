import { getStreams } from "@/lib/feed-service";
import React from "react";
import ResultCard, { ResultCardSkeleton } from "./result-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getTranslations } from "next-intl/server";

interface User {
  id: string;
  username: string;
  imageUrl: string;
  isVerifiedModel: boolean;
  externalUserId: string;
  bio: string | null;
  tokens: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Stream {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  isLive: boolean;
  user: User;
}

// ✅ Export default aquí, solo una vez
export default async function Results() {
  const t = await getTranslations();
  const data = await getStreams();

  const verifiedStreams = data.filter((stream) => stream.user.isVerifiedModel);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">
        {t("verifiedModelsLiveNow")}
      </h2>
      {verifiedStreams.length === 0 && (
        <div className="text-muted-foreground text-sm">
          {t("noVerifiedModels")}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {verifiedStreams.map((result) => (
          <ResultCard 
            key={result.id} 
            data={{
              user: result.user,
              isLive: result.isLive,
              name: result.name,
              thumbnailUrl: result.thumbnailUrl
            }} 
          />
        ))}
      </div>
    </div>
  );
}

// ✅ Export nombrada (correcta)
export const ResultsSkeleton = () => {
  return (
    <div>
      <Skeleton className="h-8 w-[290px] mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <ResultCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
