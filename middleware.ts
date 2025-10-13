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

<<<<<<< HEAD
    // Ignorar rutas API, archivos estáticos y recursos _next
    if (
      path.startsWith("/api") ||
      path.includes(".") || // imágenes, favicon, etc.
=======
    if (
      path.startsWith("/api") || 
      path.includes(".") || 
>>>>>>> 0199162e331afada491f80b15b26aa8f6b4e5996
      path.startsWith("/_next")
    ) {
      return NextResponse.next();
    }

<<<<<<< HEAD
    // Aplicar Middleware de traducción
=======
>>>>>>> 0199162e331afada491f80b15b26aa8f6b4e5996
    return intlMiddleware(req);
  },

  // afterAuth opcional para lógica adicional
  afterAuth: (auth, req) => {
<<<<<<< HEAD
    // Puedes agregar lógica después de la autenticación si es necesario
=======
    // Lógica opcional después de autenticar
>>>>>>> 0199162e331afada491f80b15b26aa8f6b4e5996
  },
});

export const config = {
  matcher: [
<<<<<<< HEAD
    "/((?!_next/static|_next/image|favicon.ico).*)", // Ignorar recursos estáticos
    "/(en|es)/:path*", // Rutas con locales
  ],
  runtime: "nodejs", // 🔑 Importante para AWS Amplify
=======
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/(en|es)/:path*"
  ],
  runtime: "nodejs", // 🔑 Obligatorio para Clerk en AWS
>>>>>>> 0199162e331afada491f80b15b26aa8f6b4e5996
};
