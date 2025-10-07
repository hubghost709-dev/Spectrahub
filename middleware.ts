import { NextRequest, NextResponse } from "next/server";
import { withClerkMiddleware } from "@clerk/nextjs/server";
import intlMiddleware from "./middleware/intl";

// 🟢 Middleware seguro para Next.js App Router + Amplify
const handler = (req: NextRequest) => {
  // Ejecutar next-intl primero (detección de idioma, redirecciones, etc.)
  const intlResponse = intlMiddleware(req);
  if (intlResponse) return intlResponse;

  // Continuar con la respuesta normal
  return NextResponse.next();
};

// Exportamos el middleware envuelto con Clerk
export default withClerkMiddleware(handler);

// ⚙️ Matcher optimizado para AWS Amplify y App Router
export const config = {
  matcher: [
    // Excluye archivos estáticos, rutas públicas y endpoints especiales
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|apple-touch-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|pdf|txt|woff2?|ttf|mp4|webm)$|[a-z]{2}/sign-in|[a-z]{2}/sign-up|[a-z]{2}/sso-callback|api/webhooks|api/public).*)",
  ],
};
