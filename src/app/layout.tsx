import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { LocaleProvider } from "./LocaleProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Luth's Playground! — Learn, Play & Grow",
  description: "A dark blocky 3D, ad-free learning adventure built for 5-year-old Luth using free/freemium API options listed by pasarapi.xyz.",
  applicationName: "Luth's Playground!",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#080b1f",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const msMessages = (await import("../../messages/ms.json")).default;
  const enMessages = (await import("../../messages/en.json")).default;

  return (
    <html lang="ms">
      <body>
        <LocaleProvider msMessages={msMessages} enMessages={enMessages}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
