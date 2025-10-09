import { NextResponse } from 'next/server';
import { authMiddleware } from '@clerk/nextjs';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
  locales: ['en', 'es'],
  defaultLocale: 'es'
});

export default authMiddleware({
  publicRoutes: [
    '/',
    '/:locale',
    '/:locale/sign-in',
    '/:locale/sign-up'
  ],
  async beforeAuth(req) {
    // Ejecuta el middleware de idiomas y guarda la respuesta (si existe)
    const response = intlMiddleware(req);

    // Si el middleware devuelve algo (ej. redirección), devuélvelo
    if (response) return response;

    // Si no devuelve nada, continúa normalmente
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    '/((?!_next|.*\\..*|favicon.ico).*)',
    '/(en|es)/:path*'
  ]
};
