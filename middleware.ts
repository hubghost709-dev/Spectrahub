import { NextRequest, NextResponse } from "next/server";
import { withClerkMiddleware } from "@clerk/nextjs/server";
import intlMiddleware from "./middleware/intl";

// 🟢 Middleware combinado y seguro para Amplify
export default withClerkMiddleware((req: NextRequest) => {
  // Primero ejecutamos next-intl
  const intlResponse = intlMiddleware(req);
  if (intlResponse) return intlResponse;

  // Si todo bien, continuamos normalmente
  return NextResponse.next();
});

// ⚙️ Configuración del matcher
export const config = {
  matcher: [
    // Excluimos recursos estáticos y rutas de autenticación
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|apple-touch-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|pdf|txt)$|[a-z]{2}/sign-in|[a-z]{2}/sign-up|[a-z]{2}/sso-callback|api/webhooks).*)",
  ],
};
