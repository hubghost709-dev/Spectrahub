import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: clerkUserId } = auth();
    
    // Verificar que el usuario autenticado coincide con el parámetro
    if (!clerkUserId || clerkUserId !== params.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findFirst({
      where: { externalUserId: params.userId },
      select: { id: true, username: true, isVerifiedModel: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}