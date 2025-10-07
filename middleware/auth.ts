import { authMiddleware as clerkAuthMiddleware } from "@clerk/nextjs";
import { NextRequest, NextResponse, NextFetchEvent } from "next/server";

export default function authMiddleware(req: NextRequest, event: NextFetchEvent) {
  try {
    // clerkAuthMiddleware devuelve una función middleware
    // la llamamos con req,event; si Clerk devuelve una respuesta, la retornamos.
    return (clerkAuthMiddleware() as any)(req, event);
  } catch (e) {
    console.error("Auth middleware error:", e);
    // si Clerk falla por cualquier razón, deja pasar la petición (no bloquear UI).
    return NextResponse.next();
  }
}
