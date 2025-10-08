import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@clerk/nextjs';
import createMiddleware from 'next-intl/middleware';

// Configuración de internacionalización
const intlMiddleware = createMiddleware({
  locales: ['en', 'es'],
  defaultLocale: 'es'
});

export default authMiddleware({
  beforeAuth: (req: NextRequest) => {
    // Ejecuta el middleware de internacionalización
    const response = intlMiddleware(req);

    // Si next-intl devuelve una respuesta, Clerk debe respetarla
    if (response) return response;

    // Si no hay respuesta, continúa el flujo normal
    return NextResponse.next();
  },
  publicRoutes: [
    '/',
    '/:locale',
    '/:locale/sign-in',
    '/:locale/sign-up'
  ]
});

// Aplica el middleware a todas las rutas necesarias
export const config = {
  matcher: [
    '/((?!_next|.*\\..*|favicon.ico).*)',
    '/(en|es)/:path*'
  ]
};
