"use server";
import { getSelf } from "@/lib/auth-service";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

type ValidData = {
  thumbnailUrl?: string | null;
  name?: string;
  isChatEnabled?: boolean;
  isChatDelayed?: boolean;
  isChatFollowersOnly?: boolean;
  pinnedMessage?: string;
  streamTopic?: string;
  kingTokens?: number;
  blockedCountries?: string[];
};

export const updateStream = async (values: ValidData) => {
  try {
    const self = await getSelf();
    const selfStream = await db.stream.findUnique({
      where: {
        userId: self.id,
      },
    });

    if (!selfStream) {
      throw new Error("Stream not found");
    }

    // Filtramos solo los campos que tienen valor
    const validData: Partial<ValidData> = {};
    
    if (values.thumbnailUrl !== undefined) validData.thumbnailUrl = values.thumbnailUrl;
    if (values.name !== undefined) validData.name = values.name;
    if (values.isChatEnabled !== undefined) validData.isChatEnabled = values.isChatEnabled;
    if (values.isChatDelayed !== undefined) validData.isChatDelayed = values.isChatDelayed;
    if (values.isChatFollowersOnly !== undefined) validData.isChatFollowersOnly = values.isChatFollowersOnly;
    if (values.pinnedMessage !== undefined) validData.pinnedMessage = values.pinnedMessage;
    if (values.streamTopic !== undefined) validData.streamTopic = values.streamTopic;
    if (values.kingTokens !== undefined) validData.kingTokens = values.kingTokens;
    if (values.blockedCountries !== undefined) validData.blockedCountries = values.blockedCountries;

    console.log("Updating stream with data:", validData); // Para debugging

    const stream = await db.stream.update({
      where: {
        id: selfStream.id,
      },
      data: validData,
    });

    console.log("Stream updated:", stream); // Para debugging

    revalidatePath(`/u/${self.username}/chat`);
    revalidatePath(`/u/${self.username}`);
    revalidatePath(`/${self.username}`);
    revalidatePath(`/`); // ✅ Agregamos esto para revalidar la página principal
    
    return stream;
  } catch (error) {
    console.error("[UPDATE_STREAM_ERROR]", error);
    throw new Error("Internal Error");
  }
};
