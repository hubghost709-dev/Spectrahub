import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@clerk/nextjs";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);
const clerk = authMiddleware({
  debug: false,
});

export default function middleware(req: NextRequest) {
  // 1️⃣ Localización (maneja idiomas)
  const intlResponse = intlMiddleware(req);
  if (intlResponse) return intlResponse;

  // 2️⃣ Autenticación (maneja Clerk)
  return clerk(req);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf)$|[a-z]{2}/sign-in|[a-z]{2}/sign-up|[a-z]{2}/sso-callback).*)",
  ],
};
