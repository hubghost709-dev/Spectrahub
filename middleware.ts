import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/search',
    '/api/uploadthing',
    '/:locale/sign-in',
    /^\/api\/webhooks/,
    /^\/[^\/]+$/, // /:username
  ],
  afterAuth: (auth, req) => {
    // Opcional: lógica post-auth
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/'
  ],
};


