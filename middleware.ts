import { NextRequest, NextFetchEvent } from "next/server";
import { authMiddleware } from "@clerk/nextjs";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);
const clerk = authMiddleware({ debug: false });

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  const intlResponse = intlMiddleware(req);
  if (intlResponse) return intlResponse;
  return clerk(req, event); // 👈 importante
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf)$|[a-z]{2}/sign-in|[a-z]{2}/sign-up|[a-z]{2}/sso-callback).*)",
  ],
};
