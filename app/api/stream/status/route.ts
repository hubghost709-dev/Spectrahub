import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const LIVEKIT_URL = process.env.LIVEKIT_API_URL!;
const API_KEY = process.env.LIVEKIT_API_KEY!;
const API_SECRET = process.env.LIVEKIT_API_SECRET!;

function getAuthHeaders() {
  const credentials = Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64");
  return {
    Authorization: `Basic ${credentials}`,
  };
}

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const user = await db.user.findFirst({
      where: { externalUserId: userId },
      include: { stream: true },
    });

    if (!user || !user.stream) {
      return NextResponse.json({ error: "User or stream not found" }, { status: 404 });
    }

    const res = await fetch(`${LIVEKIT_URL}/room/${user.id}/participants`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      console.error("[LIVEKIT_PARTICIPANTS_ERROR]", await res.text());
      return NextResponse.json({ error: "LiveKit fetch failed" }, { status: 500 });
    }

    const participants = await res.json();
    const stillConnected = participants.some((p: any) => p.identity === user.id);

    if (!stillConnected) {
      await db.stream.update({
        where: { id: user.stream.id },
        data: { isLive: false },
      });
    }

    return NextResponse.json({ isLive: stillConnected });
  } catch (error) {
    console.error("[STATUS_CHECK_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
