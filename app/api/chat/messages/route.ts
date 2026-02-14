import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

// GET - Obtener mensajes de un stream
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const streamId = searchParams.get("streamId");
    const limit = parseInt(searchParams.get("limit") || "100");

    if (!streamId) {
      return NextResponse.json(
        { error: "Stream ID is required" },
        { status: 400 }
      );
    }

    const messages = await db.chatMessage.findMany({
      where: {
        streamId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("[CHAT_MESSAGES_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST - Guardar un mensaje
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { streamId, content, username, userId } = body;

    if (!streamId || !content || !username) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const message = await db.chatMessage.create({
      data: {
        streamId,
        content,
        username,
        userId,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("[CHAT_MESSAGES_POST]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE - Limpiar mensajes antiguos (opcional - para mantenimiento)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const streamId = searchParams.get("streamId");
    const olderThan = searchParams.get("olderThan"); // timestamp

    if (!streamId) {
      return NextResponse.json(
        { error: "Stream ID is required" },
        { status: 400 }
      );
    }

    const deleted = await db.chatMessage.deleteMany({
      where: {
        streamId,
        ...(olderThan && {
          createdAt: {
            lt: new Date(parseInt(olderThan)),
          },
        }),
      },
    });

    return NextResponse.json({ deleted: deleted.count });
  } catch (error) {
    console.error("[CHAT_MESSAGES_DELETE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
