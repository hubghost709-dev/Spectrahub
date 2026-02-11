import { db } from "@/lib/db";
import { headers } from "next/headers";
import { getSelf } from "@/lib/auth-service";

const getCountry = (): string | null => {
  try {
    const headersList = headers();
    const country = headersList.get("cf-ipcountry");
    return country ? country.toUpperCase() : null;
  } catch {
    return null;
  }
};

export const getStreams = async () => {
  let userId: string | null = null;
  const country = getCountry();

  try {
    const self = await getSelf();
    userId = self.id;
  } catch {
    userId = null;
  }

  const filters: any[] = [];

  if (country) {
    filters.push({
      NOT: {
        blockedCountries: { has: country },
      },
    });
  }

  if (userId) {
    filters.push({
      user: {
        NOT: {
          blocking: {
            some: { blockedId: userId },
          },
        },
      },
    });
  }

  const streams = await db.stream.findMany({
    where: filters.length ? { AND: filters } : undefined,
    select: {
      id: true,
      name: true,
      thumbnailUrl: true,
      offlineThumbnailUrl: true,
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
      { isLive: "desc" },
      { updatedAt: "desc" },
    ],
  });

  return streams;
};
