import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { Timeline } from "@/components/sections/Timeline";
import { Footer } from "@/components/Footer";
import { FinePointerCursor } from "@/components/FinePointerCursor";
import { Header } from "@/components/Header";
import { LocaleTransitionSurface } from "@/components/LocaleTransition";
import { SmoothWheelScroll } from "@/components/SmoothWheelScroll";
import { SiteEntry } from "@/components/SiteEntry";
import { RevealController } from "@/components/RevealController";
import { content, isLocale } from "@/content";
import { buildPageMetadata, buildProfileJsonLd, serializeJsonLd } from "@/lib/seo";
import { getSiteOrigin } from "@/lib/site";
import styles from "./PageShell.module.css";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildPageMetadata(content[locale], getSiteOrigin());
}

export default async function ResumePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const resume = content[locale];
  const jsonLd = buildProfileJsonLd(resume, getSiteOrigin());

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <a className={styles.skipLink} href="#main">{resume.navigation.skipLabel}</a>
      <SmoothWheelScroll />
      <RevealController />
      <FinePointerCursor />
      <SiteEntry content={resume.entry} />
      <Header locale={locale} content={resume.navigation} />
      <LocaleTransitionSurface>
        <main id="main">
          <Hero content={resume.hero} />
          <About content={resume.about} />
          <Timeline content={resume.timeline} />
          <Projects content={resume.projects} />
          <Skills content={resume.skills} />
          <Contact content={resume.contact} />
        </main>
        <Footer content={resume.footer} />
      </LocaleTransitionSurface>
    </>
  );
}
