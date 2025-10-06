// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Si ya incluye locale (ej: /es, /en), no hacemos nada
  if (pathname.startsWith('/es') || pathname.startsWith('/en')) {
    return NextResponse.next();
  }

  // Redirigir root "/" a /es (o el idioma que prefieras por defecto)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/es', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};

