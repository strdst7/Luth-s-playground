import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["en", "ms"],
  defaultLocale: "ms",
  localeDetection: true,
  localePrefix: "always",
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
