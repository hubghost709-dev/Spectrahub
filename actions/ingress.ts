"use server";

import { getSelf } from "@/lib/auth-service";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const updateStreamLiveStatus = async (isLive: boolean) => {
  try {
    const self = await getSelf();

    const stream = await db.stream.findUnique({
      where: { userId: self.id },
    });

    if (!stream) {
      throw new Error("Stream not found");
    }

    const updatedStream = await db.stream.update({
      where: { id: stream.id },
      data: { isLive },
    });

    revalidatePath(`/${self.username}`);
    revalidatePath(`/u/${self.username}`);
    revalidatePath("/");

    return updatedStream;
  } catch (error) {
    console.error("[UPDATE_LIVE_STATUS_ERROR]", error);
    throw new Error("Failed to update live status");
  }
};
