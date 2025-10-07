// 1. IMPORTA NextFetchEvent
import { NextRequest, NextFetchEvent } from "next/server";
import { authMiddleware } from "@clerk/nextjs";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);
const clerkMiddleware = authMiddleware({ debug: false });

// 2. AÑADE el segundo argumento 'event' a la firma de la función
export default function middleware(req: NextRequest, event: NextFetchEvent) {
  const intlResponse = intlMiddleware(req);
  if (intlResponse) return intlResponse;

  // 3. Pasa ambos argumentos al middleware de Clerk (aunque solo uses req)
  // Clerk está diseñado para manejar ambos argumentos
  return clerkMiddleware(req, event);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf)$|[a-z]{2}/sign-in|[a-z]{2}/sign-up|[a-z]{2}/sso-callback).*)",
  ],
};
