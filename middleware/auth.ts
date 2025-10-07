import { authMiddleware as clerkAuthMiddleware } from "@clerk/nextjs";
import { NextRequest, NextFetchEvent, NextResponse } from "next/server";

export default async function authMiddleware(
  req: NextRequest,
  event: NextFetchEvent
) {
  try {
    return await clerkAuthMiddleware()(req, event);
  } catch (e) {
    console.error("Auth middleware error:", e);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

