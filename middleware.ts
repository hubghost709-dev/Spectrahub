import { authMiddleware } from '@clerk/nextjs';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse, type NextRequest } from 'next/server';

// 1. Inicialización de next-intl
const intlMiddleware = createMiddleware(routing);

// Lista de idiomas soportados (debe coincidir con la config de next-intl)
// Esto ayuda a construir las rutas públicas dinámicas de Clerk.
const supportedLocales = routing.locales; // Asumiendo que 'routing' exporta 'locales: string[]'

// 2. Definición de Rutas Públicas de Clerk
// Creamos un array que combina rutas estáticas y rutas dinámicas por idioma.
const publicRoutesArray: (string | RegExp)[] = [
    "/",
    "/search",
    "/api/uploadthing",
    /^\/api\/webhooks\/(.*)$/, 
    /^\/[^\/]+$/, // Para /:username (siempre pública)
];

// Añadir rutas de autenticación para todos los idiomas: /es/sign-in, /en/sign-up, etc.
supportedLocales.forEach(locale => {
    publicRoutesArray.push(`/${locale}/sign-in`);
    publicRoutesArray.push(`/${locale}/sign-up`);
    // Añade aquí cualquier otra ruta pública que dependa del locale
});


// 3. Middlewares Combinados
export default authMiddleware({
    // Utilizamos el array construido para mayor claridad
    publicRoutes: publicRoutesArray, 

    // ----------------------------------------------------
    // Lógica para aplicar la traducción ANTES de la Autenticación
    // ----------------------------------------------------
    beforeAuth: async (req: NextRequest) => {
        const path = req.nextUrl.pathname;

        // Excluir assets, archivos y carpetas internas
        if (
            path.startsWith('/api') ||
            path.includes('.') || 
            path.startsWith('/_next')
        ) {
            return NextResponse.next();
        }

        // A. Aplicar middleware de traducción y esperar resultado
        const response = await intlMiddleware(req);

        // B. SI la respuesta de next-intl es un REDIRECT (ej: / a /es), 
        //    Clerk debe usar esa nueva URL.
        if (response.headers.get('location')) {
            return response;
        }

        // C. Si next-intl no redirige, permite que Clerk continue con la request
        //    (IMPORTANTE: usa la respuesta de next-intl para pasar los headers de locale)
        return response; 
    },

    // ----------------------------------------------------
    // Lógica de Autenticación Posterior (Redirección forzada, etc.)
    // ----------------------------------------------------
    afterAuth: (auth, req, evt) => {
        // Lógica para manejar usuarios no autenticados si es necesario
        // Ejemplo: Redirigir a /sign-in si no está autenticado y no está en una ruta pública
        // (Dejar vacío si no necesitas esta funcionalidad)
    }
});


// 4. Configuración del Matcher
// Este es el patrón de Next.js más recomendado para excluir archivos estáticos.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf)$).*)',
    '/',
  ],
};
