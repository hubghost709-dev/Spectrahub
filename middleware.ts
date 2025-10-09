import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { authMiddleware } from '@clerk/nextjs';

const intlMiddleware = createMiddleware({
  locales: ['en', 'es'],
  defaultLocale: 'es',
});

const handler = authMiddleware({
  beforeAuth: (req) => {
    return intlMiddleware(req);
  },
  publicRoutes: [
    '/',
    '/:locale',
    '/:locale/sign-in',
    '/:locale/sign-up',
  ],
});

export default handler;

export const config = {
  matcher: [
    '/((?!_next|.*\\..*|favicon.ico).*)',
    '/(en|es)/:path*',
  ],
  runtime: 'nodejs', // 👈 Fuerza ejecución en entorno Node.js (no Edge)
};
