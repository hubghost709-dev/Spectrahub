import { authMiddleware } from '@clerk/nextjs';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse, type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default authMiddleware({
  publicRoutes: [
    "/",                         // Home
    "/api/webhooks(.*)",          // Webhooks
    "/api/uploadthing",           // Upload
    "/:username",                 // Perfil de usuario
    "/search",                    // Búsqueda
    "/:locale/sign-in",           // Sign-in con idioma
  ],
  beforeAuth: async (req: NextRequest) => {
    const path = req.nextUrl.pathname;

    // Excluir rutas de API, archivos estáticos y _next
    if (
      path.startsWith('/api') ||
      path.startsWith('/_next') ||
      path.includes('.') ||       // favicon, imágenes, JS, CSS
      path === '/favicon.ico'
    ) {
      return NextResponse.next();
    }

    // Aplicar middleware de next-intl
    try {
      return await intlMiddleware(req);
    } catch (err) {
      console.error('Error en intlMiddleware:', err);
      return NextResponse.next(); // Evita 500 y permite continuar
    }
  },
  afterAuth: (auth, req) => {
    // Lógica de autenticación posterior (opcional)
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)', // Excluye recursos estáticos y APIs
    '/', // Home
  ],
};
