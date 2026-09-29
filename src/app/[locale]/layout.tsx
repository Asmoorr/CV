import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import localFont from "next/font/local";
import { EntryExperience } from "@/components/EntryExperience";
import { InlineBootstrapScript } from "@/components/InlineBootstrapScript";
import { LocaleTransitionProvider } from "@/components/LocaleTransition";
import { SmoothWheelScroll } from "@/components/SmoothWheelScroll";
import { content } from "@/content";
import { isLocale, locales } from "@/content/locale";
import { getSiteOrigin } from "@/lib/site";
import { ENTRY_BOOTSTRAP } from "@/lib/site-entry";
import "lenis/dist/lenis.css";
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

  return (
    <html lang={locale} className={manrope.variable} suppressHydrationWarning>
      <head>
        <InlineBootstrapScript code={ENTRY_BOOTSTRAP} />
      </head>
      <body>
        <SmoothWheelScroll />
        <LocaleTransitionProvider initialLocale={locale}>
          <EntryExperience content={content[locale].entry}>{children}</EntryExperience>
        </LocaleTransitionProvider>
      </body>
    </html>
  );
}
