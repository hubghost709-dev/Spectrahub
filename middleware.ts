import { authMiddleware } from '@clerk/nextjs';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse, type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default authMiddleware({
  publicRoutes: [
    "/", 
    /^\/api\/webhooks/, // Expresión regular más segura
    "/api/uploadthing",
    /^\/[^\/]+$/,        // Para "/:username"
    "/search",
    "/:locale/sign-in",
  ],
  beforeAuth: async (req: NextRequest) => { // Hacer async
    const path = req.nextUrl.pathname;

    if (
      path.startsWith('/api') ||
      path.includes('.') || 
      path.startsWith('/_next')
    ) {
      return NextResponse.next();
    }

    // Aplicar middleware de traducción y esperar resultado
    return await intlMiddleware(req);
  },
  afterAuth: (auth, req) => {
    // Lógica de autenticación posterior si es necesario
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/'
  ],
};

