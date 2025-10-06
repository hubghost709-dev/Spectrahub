import { authMiddleware } from '@clerk/nextjs';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse, type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

function isPublicRoute(path: string) {
  // Rutas públicas exactas
  const exactRoutes = [
    '/',
    '/search',
    '/api/uploadthing',
  ];

  // Rutas dinámicas y regex
  const regexRoutes = [
    /^\/api\/webhooks/,  // Para webhooks
    /^\/[^\/]+$/,        // Para /:username
    /^\/[a-z]{2}-[A-Z]{2}\/sign-in$/ // Para /:locale/sign-in (ej: /es-ES/sign-in)
  ];

  if (exactRoutes.includes(path)) return true;

  return regexRoutes.some((regex) => regex.test(path));
}

export default authMiddleware({
  publicRoutes: [], // Dejamos vacío para usar nuestro propio control
  beforeAuth: async (req: NextRequest) => {
    const path = req.nextUrl.pathname;

    // Excluir archivos estáticos y rutas _next
    if (path.includes('.') || path.startsWith('/_next')) {
      return NextResponse.next();
    }

    // Si es ruta pública, continuar sin auth
    if (isPublicRoute(path)) {
      return NextResponse.next();
    }

    // Ejecutar next-intl de forma segura
    try {
      const intlResponse = await intlMiddleware(req);
      if (intlResponse instanceof NextResponse) {
        return intlResponse;
      }
    } catch (e) {
      console.error("Error en intlMiddleware:", e);
    }

    // Continuar con authMiddleware
    return undefined;
  },
  afterAuth: (auth, req) => {
    // Aquí puedes agregar lógica post-auth si necesitas
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/'
  ],
};
