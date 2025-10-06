import { authMiddleware } from "@clerk/nextjs";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse, type NextRequest } from "next/server";

// Inicializa next-intl middleware
const intlMiddleware = createMiddleware(routing);

export default authMiddleware({
  publicRoutes: [
    "/", 
    "/api/webhooks(.*)",
    "/api/uploadthing",
    "/:username",
    "/search",
    "/:locale/sign-in",
  ],

  beforeAuth: (req: NextRequest) => {
    const path = req.nextUrl.pathname;

    // Dejar pasar APIs y archivos estáticos
    if (
      path.startsWith("/api") ||
      path.startsWith("/_next") ||
      path.includes(".")
    ) {
      return NextResponse.next();
    }

    // Aplica traducción solo si la ruta es válida
    try {
      return intlMiddleware(req);
    } catch (err) {
      console.error("Error en next-intl middleware:", err);
      return NextResponse.next(); // fallback seguro
    }
  },

  afterAuth(auth, req) {
    // Aquí puedes manejar redirecciones después de auth si lo deseas
    // Ejemplo:
    // if (!auth.userId && !req.nextUrl.pathname.startsWith('/sign-in')) {
    //   const signInUrl = new URL('/sign-in', req.url);
    //   return NextResponse.redirect(signInUrl);
    // }
  },
});

// Configuración segura del matcher (evita interceptar estáticos)
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf)$).*)",
  ],
};

