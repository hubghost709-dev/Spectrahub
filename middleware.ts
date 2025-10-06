import { NextRequest, NextResponse, NextFetchEvent } from "next/server";
import intlMiddleware from "./middleware/intl";
import authMiddleware from "./middleware/auth";

export function middleware(req: NextRequest, event: NextFetchEvent) {
  // 🟢 next-intl (solo 1 argumento)
  const intlResponse = intlMiddleware(req);
  if (intlResponse) return intlResponse;

  // 🔵 Clerk (necesita 2 argumentos)
  const authResponse = authMiddleware(req, event);
  if (authResponse) return authResponse;

  return NextResponse.next();
}

// ⚠️ Importante: excluimos rutas de Clerk y estáticos
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf)$|sign-in|sign-up|sso-callback).*)",
  ],
};

