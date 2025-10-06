import { NextResponse, type NextRequest } from 'next/server';

// 1. Deshabilitar completamente Clerk y next-intl
// El objetivo es que este archivo NO importe nada de las librerías problemáticas.

export function middleware(req: NextRequest) {
    // Si esta línea no se ejecuta en AWS, la falla es en el entorno
    console.log("Middleware Mínimo Ejecutado para:", req.nextUrl.pathname); 

    // Simplemente deja pasar la solicitud.
    return NextResponse.next();
}

// 2. Mantener el matcher amplio para asegurar que se ejecute en todas las rutas
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf)$).*)',
    '/',
  ],
};
