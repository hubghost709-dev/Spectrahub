import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@clerk/nextjs';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
  locales: ['en', 'es'],
  defaultLocale: 'es'
});

export default authMiddleware({
  // **LÍNEA COMENTADA:** Con esto, Clerk se ejecutará sin la lógica de localización
   beforeAuth: (req) => {
     return intlMiddleware(req);
   },
  
  publicRoutes: [
    '/',
    '/:locale',
    '/:locale/sign-in',
    '/:locale/sign-up'
  ]
});

export const config = {
  matcher: [
    '/((?!_next|.*\\..*|favicon.ico).*)',
    '/(en|es)/:path*'
  ]
};
