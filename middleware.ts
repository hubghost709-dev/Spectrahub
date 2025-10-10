// src/middleware.ts
import { authMiddleware } from "@clerk/nextjs";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing"; // tu configuración de locales
import { NextResponse, type NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default authMiddleware({
  publicRoutes: [
    "/", 
    "/api/webhooks(.*)",
    "/api/uploadthing",
    "/:username",
    "/search",
    "/:locale/sign-in",
    "/:locale/sign-up",
  ],
  beforeAuth: (req: NextRequest) => {
    const path = req.nextUrl.pathname;

    if (
      path.startsWith("/api") || 
      path.includes(".") || 
      path.startsWith("/_next")
    ) {
      return NextResponse.next();
    }

    return intlMiddleware(req);
  },
  afterAuth: (auth, req) => {
    // Lógica opcional después de autenticar
  },
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/(en|es)/:path*"
  ],
  runtime: "nodejs", // 🔑 Obligatorio para Clerk en AWS
};
