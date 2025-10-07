export const runtime = "nodejs";

import { NextRequest, NextResponse, NextFetchEvent } from "next/server";
import intlMiddleware from "./middleware/intl";
import authMiddleware from "./middleware/auth";

function callIntlMiddlewareMaybe(req: NextRequest) {
  // next-intl cambió su firma entre versiones:
  // - v2: createMiddleware(...) -> middleware()  (sin args)
  // - v3+: middleware(req)
  // Aquí intentamos ambas sin romper TS en tiempo de ejecución.
  try {
    const fn: any = intlMiddleware as any;
    if (typeof fn !== "function") return null;
    // si fn.length === 0 -> no espera args
    return fn.length === 0 ? fn() : fn(req);
  } catch (err) {
    console.error("[MW] intlMiddleware call failed:", err);
    return null;
  }
}

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  const pathname = req.nextUrl.pathname;
  console.log("[MW] start:", pathname);

  // 1) SKIP: assets estáticos y rutas con extensión
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon.ico") ||
    /\.\w+$/.test(pathname) // cualquier URL con extensión (.js, .css, .png...)
  ) {
    // no procesar esto en middleware
    return NextResponse.next();
  }

  // 2) SKIP: no interceptar XHR / fetch (solo HTML navegations)
  const accept = req.headers.get("accept") || "";
  if (!accept.includes("text/html")) {
    return NextResponse.next();
  }

  try {
    // 3) next-intl (compatible)
    console.log("[MW] running intlMiddleware...");
    const intlResponse = callIntlMiddlewareMaybe(req);
    if (intlResponse) {
      console.log("[MW] intlMiddleware returned a response (redirect/next).");
      return intlResponse;
    }
    console.log("[MW] intlMiddleware passed.");

    // 4) auth (Clerk) - envuelve y protege rutas
    console.log("[MW] running authMiddleware...");
    const authResponse = await authMiddleware(req, event);
    if (authResponse) {
      console.log("[MW] authMiddleware returned a response (redirect/next).");
      return authResponse;
    }

    console.log("[MW] all middleware passed -> next()");
    return NextResponse.next();
  } catch (err) {
    console.error("[MW] unexpected error:", err);
    // **NO** devolver JSON de error en middleware (puede romper la UI del modal).
    // En su lugar, dejar pasar la petición para que la página pueda renderizar.
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // proteger todas las rutas de aplicación excepto assets, APIs públicas y páginas de auth
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|apple-touch-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|pdf|txt|woff2?|ttf|mp4|webm)$|sign-in|sign-up|sso-callback|api/webhooks|api/public).*)",
  ],
};


