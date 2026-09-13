import type { ReactNode } from "react";
import { headers } from "next/headers";
import localFont from "next/font/local";
import "./globals.css";

const manrope = localFont({
  src: [
    { path: "../fonts/manrope-regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/manrope-semibold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/manrope-bold.ttf", weight: "700", style: "normal" },
    { path: "../fonts/manrope-extrabold.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-manrope",
  display: "swap",
});

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-resume-locale") === "en" ? "en" : "ru";
  return <html lang={locale} className={manrope.variable}><body>{children}</body></html>;
}
