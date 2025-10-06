import { authMiddleware } from '@clerk/nextjs';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse, type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default authMiddleware({
  publicRoutes: [
    "/",
    "/api/webhooks(.*)",
    "/api/uploadthing",
    "/:username",
    "/search",
    "/:locale/sign-in",
  ],
  beforeAuth: (req: NextRequest) => {
    // Excluir rutas API y recursos estáticos
    const path = req.nextUrl.pathname;
    
    if (
      path.startsWith('/api') || 
      path.includes('.') || // Excluye archivos (imágenes, favicon, etc)
      path.startsWith('/_next')
    ) {
      return NextResponse.next();
    }

    // Aplicar middleware de traducción a rutas no-API
    return intlMiddleware(req);
  },
  afterAuth: (auth, req) => {
    // Lógica de autenticación posterior (si es necesaria)
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)', // Exclusión más limpia
    '/'
  ],
};
