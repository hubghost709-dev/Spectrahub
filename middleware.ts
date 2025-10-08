import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@clerk/nextjs';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
  locales: ['en', 'es'],
  defaultLocale: 'es'
});

// Exporta el middleware de Clerk correctamente envuelto
export default authMiddleware({
  beforeAuth: (req) => {
    // Ejecuta next-intl ANTES de la autenticación
    return intlMiddleware(req);
  },
  publicRoutes: [
    '/', // Página principal pública
    '/:locale', // Rutas de idioma
    '/:locale/sign-in',
    '/:locale/sign-up',
  ]
});

export const config = {
  matcher: [
    // Asegúrate de incluir TODAS las rutas que necesitan Clerk
    '/((?!_next|.*\\..*|favicon.ico).*)',
    '/(en|es)/:path*'
  ]
};

