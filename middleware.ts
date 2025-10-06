import { authMiddleware } from '@clerk/nextjs';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse, type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

function isPublicRoute(path: string) {
  const exactRoutes = [
    '/',
    '/search',
    '/api/uploadthing',
  ];

  const regexRoutes = [
    /^\/api\/webhooks/,           // Rutas API específicas
    /^\/[^\/]+$/,                 // /:username
    /^\/[a-z]{2}-[A-Z]{2}\/sign-in$/ // /:locale/sign-in (ej: /es-ES/sign-in)
  ];

  if (exactRoutes.includes(path)) return true;
  return regexRoutes.some((regex) => regex.test(path));
}

export default authMiddleware({
  publicRoutes: [], // Usamos nuestro propio control
  beforeAuth: (req: NextRequest) => {
    const path = req.nextUrl.pathname;

    // Excluir estáticos y _next
    if (path.includes('.') || path.startsWith('/_next')) {
      return NextResponse.next();
    }

    // Rutas públicas
    if (isPublicRoute(path)) {
      return NextResponse.next();
    }

    // Aplicar next-intl mediante rewrite
    const intlResponse = intlMiddleware(req);

    // next-intl devuelve NextResponse o undefined, si es undefined, continuar con Clerk
    if (intlResponse instanceof NextResponse) {
      return intlResponse;
    }

    return undefined; // Continúa con authMiddleware
  },
  afterAuth: (auth, req) => {
    // Lógica post-auth opcional
  },
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/'
  ],
};

