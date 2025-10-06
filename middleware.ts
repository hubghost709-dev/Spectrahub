// middleware.ts
import { authMiddleware } from '@clerk/nextjs';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse, type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default authMiddleware({
    // Rutas públicas: Asegúrate de que las rutas de auth y la raíz sean públicas
    publicRoutes: [
        "/", 
        /^\/api\/webhooks/, 
        "/api/uploadthing",
        "/search",
        "/:locale/sign-in",
        "/:locale/sign-up",
        // Incluye cualquier otra ruta pública de la app
    ],

    // Ejecuta next-intl ANTES de que Clerk verifique la autenticación
    beforeAuth: (req: NextRequest) => { 
        const path = req.nextUrl.pathname;
        
        // Excluir estáticos y APIs que no necesitan middleware
        if (
            path.includes('.') || 
            path.startsWith('/_next')
        ) {
            return NextResponse.next();
        }

        // Ejecutar el middleware de internacionalización
        const intlResponse = intlMiddleware(req);

        // Devolver la respuesta de next-intl (ya sea la reescritura o la redirección 307)
        return intlResponse;
    },

    // afterAuth opcional si necesitas manejar redirecciones a medida
    afterAuth: (auth, req, evt) => {
        // ...
    }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/'
  ],
};

