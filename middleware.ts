export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import intlMiddleware from "./middleware/intl";
import { auth } from "@clerk/nextjs/server";

export async function middleware(req: NextRequest) {
  try {
    // 🟢 Ejecutar intl primero
    const intlResponse = intlMiddleware(req);
    if (intlResponse) return intlResponse;

    // 🔵 Comprobar sesión con Clerk (modo Node, no Edge)
    const { userId } = auth(req);

    // Si no está autenticado y la ruta es privada, redirigir
    const pathname = req.nextUrl.pathname;
    const isProtected = !pathname.startsWith("/public") && !pathname.includes("/sign-in");
    if (isProtected && !userId) {
      const signInUrl = new URL("/sign-in", req.url);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  } catch (err) {
    console.error("❌ Middleware error:", err);
    return NextResponse.json({ error: "Middleware failed", details: String(err) }, { status: 500 });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|apple-touch-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|pdf|txt|woff2?|ttf|mp4|webm)$|sign-in|sign-up|sso-callback|api/webhooks|api/public).*)",
  ],
};

