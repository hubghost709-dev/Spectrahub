// Solución de Middleware Asegurada
import { NextRequest, NextFetchEvent } from "next/server";
import { authMiddleware } from "@clerk/nextjs";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);
const clerkMiddleware = authMiddleware({ debug: false });

export default function middleware(req: NextRequest, event: NextFetchEvent) { // <--- Clave: Incluir NextFetchEvent
  const intlResponse = intlMiddleware(req);
  if (intlResponse) return intlResponse;

  // Clave: Pasar ambos argumentos a Clerk
  return clerkMiddleware(req, event);
}
// ... config
