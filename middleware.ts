import { NextRequest, NextResponse, NextFetchEvent } from "next/server";
import intlMiddleware from "./middleware/intl";
import authMiddleware from "./middleware/auth";

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  // 🟢 next-intl
  const intlResponse = intlMiddleware(req);
  if (intlResponse) return intlResponse;

  // 🔵 Clerk
  const authResponse = await authMiddleware(req, event);
  if (authResponse) return authResponse;

  return NextResponse.next();
}

export const config = {
  matcher: [
    // ⚠️ Excluir rutas estáticas + auth localizadas
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf)$|[a-z]{2}/sign-in|[a-z]{2}/sign-up|[a-z]{2}/sso-callback).*)",
  ],
};


