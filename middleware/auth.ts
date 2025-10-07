import { authMiddleware as clerkAuthMiddleware } from "@clerk/nextjs";
import { NextRequest, NextResponse, NextFetchEvent } from "next/server";

export default function authMiddleware(req: NextRequest, event: NextFetchEvent) {
  try {
    return clerkAuthMiddleware()(req, event);
  } catch (e) {
    console.error("Auth middleware error:", e);
    return NextResponse.next(); // Deja pasar la petición si Clerk falla
  }
}


