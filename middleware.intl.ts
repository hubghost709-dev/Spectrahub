import createMiddleware from 'next-intl/middleware';
import { routing, DEFAULT_LOCALE } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
    '/' // Solo rutas públicas que no sean API
  ],
};
