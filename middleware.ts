import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse, type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    
    // 1. Excluir assets y rutas internas de Next.js
    if (
        path.startsWith('/api') ||
        path.includes('.') || 
        path.startsWith('/_next') ||
        path.startsWith('/api/webhooks') // Excluir webhooks directamente aquí
    ) {
        return NextResponse.next();
    }

    // 2. Aplicar solo el middleware de traducción
    return intlMiddleware(req);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf)$).*)',
    '/',
  ],
};

