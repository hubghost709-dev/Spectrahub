import { NextRequest, NextResponse } from "next/server";
import { withClerkMiddleware } from "@clerk/nextjs/server";
import intlMiddleware from "./middleware/intl";

// 🧠 Middleware inteligente con soporte Amplify + SSR + Dev
const handler = (req: NextRequest) => {
  const url = req.nextUrl;
  const hostname = url.hostname;
  const isDev = process.env.NODE_ENV === "development";
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";

  // 🚫 Saltar middleware en entorno de build o prerender (ISR)
  if (isBuild) {
    return NextResponse.next();
  }

  // ⚙️ Saltar Clerk e intl en rutas de prefetch o en desarrollo local si hace falta
  if (isDev && (url.pathname.startsWith("/_next") || url.pathname.startsWith("/api"))) {
    return NextResponse.next();
  }

  // 🌍 Ejecutar next-intl primero (manejo de idioma y localización)
  const intlResponse = intlMiddleware(req);
  if (intlResponse) return intlResponse;

  // ✅ Continuar flujo normal
  return NextResponse.next();
};

// 🟢 Envuelto con Clerk para manejo de sesión seguro
export default withClerkMiddleware(handler);

// ⚙️ Matcher optimizado para AWS Amplify + App Router
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|apple-touch-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|pdf|txt|woff2?|ttf|mp4|webm)$|[a-z]{2}/sign-in|[a-z]{2}/sign-up|[a-z]{2}/sso-callback|api/webhooks|api/public).*)",
  ],
};
