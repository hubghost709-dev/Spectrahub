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

export const config = {
  matcher: [
    // ⚠️ Excluir rutas estáticas + auth localizadas
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf)$|[a-z]{2}/sign-in|[a-z]{2}/sign-up|[a-z]{2}/sso-callback).*)",
  ],
};

