import { authMiddleware } from '@clerk/nextjs';
import createIntlMiddleware from 'next-intl/middleware';
// Asume que esta importación trae tu configuración de i18n
import { routing } from './i18n/routing'; 
import { NextResponse, type NextRequest } from 'next/server';

const intlMiddleware = createIntlMiddleware(routing);

// Rutas públicas: Asegúrate de que TODAS las rutas de auth estén cubiertas.
const PUBLIC_ROUTES = [
    "/", 
    "/api/uploadthing",
    "/api/webhooks",
    "/:locale/sign-in",
    "/:locale/sign-up",
    "/:locale/sso-callback", // Incluye el callback de SSO explícitamente
    // Agrega aquí cualquier otra ruta pública base
];

export default authMiddleware({
    publicRoutes: PUBLIC_ROUTES,

    // 🔴 El punto clave: Usar beforeAuth para ejecutar next-intl y forzar el orden
    beforeAuth: (req: NextRequest) => {
        const path = req.nextUrl.pathname;

        // 1. Excluir estáticos y APIs (opcional, pero limpio)
        if (
            path.includes('.') || 
            path.startsWith('/_next')
        ) {
            return NextResponse.next();
        }

        // 2. Ejecutar el middleware de internacionalización de next-intl.
        // La respuesta de intlMiddleware será una reescritura o una redirección.
        // Clerk usará esta respuesta/reescritura para continuar su lógica.
        const intlResponse = intlMiddleware(req);

        // Devolvemos la respuesta para que Clerk la use.
        // Si intlMiddleware hizo una reescritura, Clerk la respetará.
        return intlResponse;
    },
    
    // Si necesitas lógica post-autenticación
    afterAuth: (auth, req) => {
        // ... (Dejar vacío si no necesitas redirecciones post-login)
    }
});

export const config = {
  // Este matcher es más simple y lo manejará Clerk con las exclusiones de publicRoutes
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/'
  ],
};
