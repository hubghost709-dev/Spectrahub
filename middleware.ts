import { authMiddleware } from '@clerk/nextjs';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse, type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default authMiddleware({
  publicRoutes: [
    "/",
    "/api/uploadthing",
    "/search",
    "/:locale/sign-in",
    /^\/api\/webhooks/, // Regex más seguro
    /^\/[^\/]+$/,       // Para "/:username"
  ],
  beforeAuth: async (req: NextRequest) => {
    const path = req.nextUrl.pathname;

    // Excluir rutas API y estáticos
    if (path.startsWith('/api') || path.includes('.') || path.startsWith('/_next')) {
      return NextResponse.next();
    }

    // Ejecutar next-intl middleware de manera segura
    try {
      const intlResponse = await intlMiddleware(req);
      // Si intlMiddleware devuelve NextResponse, retornamos, si no, seguimos
      if (intlResponse instanceof NextResponse) {
        return intlResponse;
      }
    } catch (e) {
      console.error("Error en intlMiddleware:", e);
      // Si falla, continuamos para no bloquear la app
    }

    return undefined; // Continúa con authMiddleware normalmente
  },
  afterAuth: (auth, req) => {
    // Lógica de autenticación posterior si se requiere
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/'
  ],
};

