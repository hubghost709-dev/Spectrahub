import { authMiddleware } from '@clerk/nextjs';
import createMiddleware from 'next-intl/middleware';
import { routing, DEFAULT_LOCALE } from './i18n/routing'; // DEFAULT_LOCALE: ej. 'en-US'
import { NextResponse, type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

// Función para determinar rutas públicas
function isPublicRoute(path: string) {
  const exactRoutes = [
    '/',
    '/search',
    '/api/uploadthing',
  ];

  const regexRoutes = [
    /^\/api\/webhooks/,           // Webhooks
    /^\/[^\/]+$/,                 // /:username
    /^\/[a-z]{2}-[A-Z]{2}\/sign-in$/ // /:locale/sign-in, ej: /es-ES/sign-in
  ];

  if (exactRoutes.includes(path)) return true;
  return regexRoutes.some((regex) => regex.test(path));
}

// Middleware principal
export default authMiddleware({
  publicRoutes: [],
  beforeAuth: (req: NextRequest) => {
    const { pathname } = req.nextUrl;

    // 1️⃣ Excluir archivos estáticos y _next
    if (pathname.includes('.') || pathname.startsWith('/_next')) {
      return NextResponse.next();
    }

    // 2️⃣ Rutas públicas
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    // 3️⃣ Detectar si la URL tiene locale
    const localeRegex = /^\/([a-z]{2}-[A-Z]{2})(\/|$)/;
    if (!localeRegex.test(pathname)) {
      // Redirigir a la misma ruta con locale por defecto
      const url = req.nextUrl.clone();
      url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
      return NextResponse.redirect(url);
    }

    // 4️⃣ Aplicar next-intl para traducciones
    const intlResponse = intlMiddleware(req);
    if (intlResponse instanceof NextResponse) {
      return intlResponse;
    }

    // 5️⃣ Continuar con Clerk si no aplica intl
    return undefined;
  },
  afterAuth: (auth, req) => {
    // Lógica post-auth opcional
  },
});

// Configuración de matcher
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/'
  ],
};

