import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const LIVEKIT_URL = process.env.LIVEKIT_API_URL!;
const API_KEY = process.env.LIVEKIT_API_KEY!;
const API_SECRET = process.env.LIVEKIT_API_SECRET!;

if (!LIVEKIT_URL || !API_KEY || !API_SECRET) {
  throw new Error("Missing LiveKit environment variables");
}

function getAuthHeaders() {
  const credentials = Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64");
  return {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/json",
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      );
    }

    // Buscar usuario + stream
    const user = await db.user.findFirst({
      where: { externalUserId: userId },
      include: { stream: true },
    });

    if (!user || !user.stream) {
      return NextResponse.json(
        { error: "User or stream not found" },
        { status: 404 }
      );
    }

    // 🔥 IMPORTANTE:
    // El nombre del room debe ser EXACTAMENTE el mismo
    // que usas cuando generas el token.
    const roomName = user.id; // Cambia esto si tu room usa username

    // Llamada correcta a LiveKit Twirp API
    const livekitResponse = await fetch(
      `${LIVEKIT_URL}/twirp/livekit.RoomService/ListParticipants`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          room: roomName,
        }),
      }
    );

    if (!livekitResponse.ok) {
      const errorText = await livekitResponse.text();
      console.error("[LIVEKIT_ERROR]", errorText);

      return NextResponse.json(
        { error: "Failed to fetch participants from LiveKit" },
        { status: 500 }
      );
    }

    const data = await livekitResponse.json();
    const participants = data.participants || [];

    // ⚠️ CRÍTICO:
    // identity debe coincidir EXACTAMENTE
    const isHostConnected = participants.some(
      (participant: any) => participant.identity === user.id
    );

    // 🔄 Siempre sincronizamos la DB
    await db.stream.update({
      where: { id: user.stream.id },
      data: { isLive: isHostConnected },
    });

    return NextResponse.json({
      isLive: isHostConnected,
    });

  } catch (error) {
    console.error("[STREAM_STATUS_ERROR]", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
