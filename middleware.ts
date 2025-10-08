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
  "/search",
  "/:locale/sign-in",
],
beforeAuth: async (req: NextRequest) => {
  const path = req.nextUrl.pathname;

  if (
    path.startsWith('/api') ||
    path.startsWith('/_next') ||
    path.includes('.') ||
    path === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  try {
    const res = await intlMiddleware(req);
    return res || NextResponse.next(); // forzar respuesta
  } catch (err) {
    console.error('Error en intlMiddleware:', err);
    return NextResponse.next();
  }
}
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
