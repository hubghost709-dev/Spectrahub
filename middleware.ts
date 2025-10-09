import { authMiddleware } from "@clerk/nextjs";
import createIntlMiddleware from "next-intl/middleware";

const locales = ["en", "es"];
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: "es",
});

export default authMiddleware({
  beforeAuth(req) {
    // Ejecuta next-intl antes de Clerk
    return intlMiddleware(req);
  },
  publicRoutes: [
    "/", 
    "/:locale",
    "/:locale/sign-in",
    "/:locale/sign-up",
  ],
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*|favicon.ico).*)",
    "/(en|es)/:path*",
  ],
};

