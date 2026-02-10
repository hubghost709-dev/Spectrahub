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
      where: { userId: self.id },
    });

    if (!selfStream) {
      throw new Error("Stream not found");
    }

    // Solo incluimos los campos que vienen definidos
    const dataToUpdate: Record<string, unknown> = {};

    if (values.name !== undefined) dataToUpdate.name = values.name;
    if (values.thumbnailUrl !== undefined) dataToUpdate.thumbnailUrl = values.thumbnailUrl;
    if (values.isChatEnabled !== undefined) dataToUpdate.isChatEnabled = values.isChatEnabled;
    if (values.isChatDelayed !== undefined) dataToUpdate.isChatDelayed = values.isChatDelayed;
    if (values.isChatFollowersOnly !== undefined) dataToUpdate.isChatFollowersOnly = values.isChatFollowersOnly;
    if (values.pinnedMessage !== undefined) dataToUpdate.pinnedMessage = values.pinnedMessage;
    if (values.streamTopic !== undefined) dataToUpdate.streamTopic = values.streamTopic;
    if (values.kingTokens !== undefined) dataToUpdate.kingTokens = values.kingTokens;
    if (values.blockedCountries !== undefined) dataToUpdate.blockedCountries = values.blockedCountries;

    console.log("[UPDATE_STREAM] Data to update:", dataToUpdate);

    const stream = await db.stream.update({
      where: { id: selfStream.id },
      data: dataToUpdate,
    });

    console.log("[UPDATE_STREAM] Updated successfully:", stream.thumbnailUrl);

    revalidatePath(`/u/${self.username}/chat`);
    revalidatePath(`/u/${self.username}`);
    revalidatePath(`/${self.username}`);
    revalidatePath("/");

    return stream;
  } catch (error) {
    console.error("[UPDATE_STREAM_ERROR]", error);
    throw new Error("Internal Error");
  }
};
