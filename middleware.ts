import { NextRequest, NextResponse, NextFetchEvent } from "next/server";
import intlMiddleware from "./middleware/intl";
import authMiddleware from "./middleware/auth";

export function middleware(req: NextRequest, event: NextFetchEvent) {
  // 🟢 next-intl solo acepta 1 argumento
  const intlResponse = intlMiddleware(req);
  if (intlResponse) return intlResponse;

  // 🔵 Clerk necesita los dos argumentos
  const authResponse = authMiddleware(req, event);
  if (authResponse) return authResponse;

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

