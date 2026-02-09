import Image from "next/image";

import { Skeleton } from "@/components/ui/skeleton";
import { LiveBadge } from "@/components/live-badge";
import { UserAvatar } from "@/components/user-avatar";

interface ThumbnailProps {
  src: string | null;
  fallback: string;
  isLive: boolean;
  username: string;
}

export const getStreams = async () => {
  let userId;
  const country = getCountry();

  try {
    const self = await getSelf();
    userId = self.id;
  } catch {
    userId = null;
  }

  const streams = await db.stream.findMany({
    where: {
      AND: [
        {
          NOT: {
            blockedCountries: {
              has: country || "",
            },
          },
        },
        userId
          ? {
              user: {
                NOT: {
                  blocking: {
                    some: {
                      blockedId: userId,
                    },
                  },
                },
              },
            }
          : {},
      ],
    },
    select: {
      id: true,
      name: true,
      thumbnailUrl: true, // ✅ Explícitamente incluimos thumbnailUrl
      isLive: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          username: true,
          imageUrl: true,
          isVerifiedModel: true,
          externalUserId: true,
          bio: true,
          tokens: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    orderBy: [
      {
        isLive: "desc",
      },
      {
        updatedAt: "desc",
      },
    ],
  });

  return streams;
};
