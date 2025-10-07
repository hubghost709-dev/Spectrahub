import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware;

// Opcional: rutas protegidas
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    // Protege solo ciertas rutas si quieres:
    // "/dashboard/:path*",
    // "/profile/:path*",
  ],
};
