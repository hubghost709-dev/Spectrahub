import { NextRequest, NextResponse, NextFetchEvent } from "next/server";
import { authMiddleware as clerkAuthMiddleware } from "@clerk/nextjs";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);
const clerkMiddleware = clerkAuthMiddleware();

export function middleware(req: NextRequest, event: NextFetchEvent) {
  // 1️⃣ Localización (next-intl)
  const intlResponse = intlMiddleware(req);
  if (intlResponse) return intlResponse;

  // 2️⃣ Autenticación (Clerk)
  const authResponse = clerkMiddleware(req, event);
  if (authResponse) return authResponse;

  // 3️⃣ Si todo pasa, continuar
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf)$|[a-z]{2}/sign-in|[a-z]{2}/sign-up|[a-z]{2}/sso-callback).*)",
  ],
};



