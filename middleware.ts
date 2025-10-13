// src/middleware.ts
import { authMiddleware } from "@clerk/nextjs";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing"; // tu configuración de locales
import { NextResponse, type NextRequest } from "next/server";

// Middleware de internacionalización
const intlMiddleware = createMiddleware(routing);

export default authMiddleware({
  // Rutas públicas que no requieren autenticación
  publicRoutes: [
    "/", 
    "/api/webhooks(.*)",
    "/api/uploadthing",
    "/:username",
    "/search",
    "/:locale/sign-in",
    "/:locale/sign-up",
  ],

  // Antes de autenticar, aplicar traducciones
  beforeAuth: (req: NextRequest) => {
    const path = req.nextUrl.pathname;

    // Ignorar rutas API, archivos estáticos y recursos _next
    if (
      path.startsWith("/api") ||
      path.includes(".") || // imágenes, favicon, etc.
      path.startsWith("/_next")
    ) {
      return NextResponse.next();
    }

    // Aplicar Middleware de traducción
    return intlMiddleware(req);
  },

  // afterAuth opcional para lógica adicional
  afterAuth: (auth, req) => {
    // Puedes agregar lógica después de la autenticación si es necesario
  },
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)", // Ignorar recursos estáticos
    "/(en|es)/:path*", // Rutas con locales
  ],
  runtime: "nodejs", // 🔑 Importante para AWS Amplify
};
