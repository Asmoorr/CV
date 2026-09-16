import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import localFont from "next/font/local";
import { isLocale, locales } from "@/content/locale";
import { getSiteOrigin } from "@/lib/site";
import "../globals.css";

const manrope = localFont({
  src: [
    { path: "../../fonts/manrope-regular.ttf", weight: "400", style: "normal" },
    { path: "../../fonts/manrope-semibold.ttf", weight: "600", style: "normal" },
    { path: "../../fonts/manrope-bold.ttf", weight: "700", style: "normal" },
    { path: "../../fonts/manrope-extrabold.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-manrope",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export function generateMetadata(): Metadata {
  return { metadataBase: new URL(getSiteOrigin()) };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <html lang={locale} className={manrope.variable}><body>{children}</body></html>;
}
