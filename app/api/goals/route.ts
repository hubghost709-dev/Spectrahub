import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";

// 🟢 Crear nueva meta (solo streamer autenticado)
export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { externalUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { name, targetAmount, theme, color } = await req.json();

    if (!name || !targetAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const goal = await db.tokenGoal.create({
      data: {
        name,
        targetAmount,
        theme: theme || "default",
        color: color || "#1010f2",
        userId: user.id,
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error("[GOALS_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// 🟡 Obtener metas activas (para streamer o viewers)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    const { userId } = auth();
    let targetUser = null;

    // 1️⃣ Si viene username por query (viewers)
    if (username) {
      targetUser = await db.user.findUnique({
        where: { username },
      });
    }

    // 2️⃣ Si no hay username, usar usuario autenticado (streamer dashboard)
    if (!targetUser && userId) {
      targetUser = await db.user.findUnique({
        where: { externalUserId: userId },
      });
    }

    // 3️⃣ Si aún no hay usuario, intentar deducirlo del referer (fallback)
    if (!targetUser) {
      const referer = req.headers.get("referer") || "";
      const url = new URL(referer, "https://dummy-base/");
      const pathParts = url.pathname.split("/");
      const pathUsername = pathParts[1];

      if (pathUsername) {
        targetUser = await db.user.findUnique({
          where: {
            username: pathUsername.startsWith("u/")
              ? pathUsername.substring(2)
              : pathUsername,
          },
        });
      }
    }

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 🔹 Buscar las metas activas del usuario
    const goals = await db.tokenGoal.findMany({
      where: {
        userId: targetUser.id,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error("[GOALS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// 🟣 Actualizar meta existente (solo streamer autenticado)
export async function PATCH(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { externalUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { goalId, currentAmount, isCompleted, isActive } = await req.json();

    if (!goalId) {
      return NextResponse.json({ error: "Goal ID required" }, { status: 400 });
    }

    const goal = await db.tokenGoal.findUnique({
      where: { id: goalId },
    });

    if (!goal || goal.userId !== user.id) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const updatedGoal = await db.tokenGoal.update({
      where: { id: goalId },
      data: {
        currentAmount: currentAmount ?? goal.currentAmount,
        isCompleted: isCompleted ?? goal.isCompleted,
        isActive: isActive ?? goal.isActive,
      },
    });

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error("[GOALS_PATCH]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
