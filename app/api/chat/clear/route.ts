import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const self = await getSelf();

    // Obtener el stream del usuario
    const stream = await db.stream.findUnique({
      where: {
        userId: self.id,
      },
    });

    if (!stream) {
      return NextResponse.json(
        { error: "Stream not found" },
        { status: 404 }
      );
    }

    // Limpiar mensajes
    const deleted = await db.chatMessage.deleteMany({
      where: {
        streamId: stream.id,
      },
    });

    return NextResponse.json({
      success: true,
      deleted: deleted.count,
      message: "Chat history cleared successfully",
    });
  } catch (error) {
    console.error("[CHAT_CLEAR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
