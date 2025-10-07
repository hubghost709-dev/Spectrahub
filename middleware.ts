import { withClerkMiddleware } from "@clerk/nextjs/server";
import intlMiddleware from "./middleware/intl";

export const middleware = withClerkMiddleware((req) => {
  // next-intl sigue funcionando como antes
  const intlResponse = intlMiddleware(req);
  if (intlResponse) return intlResponse;

  return null; // Clerk se encarga del auth
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf)$|[a-z]{2}/sign-in|[a-z]{2}/sign-up|[a-z]{2}/sso-callback).*)",
  ],
};
