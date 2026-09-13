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
import { content, isLocale, locales } from "@/content";

type PageProps = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const resume = content[locale];
  return {
    title: `${resume.hero.name} — ${resume.hero.role}`,
    description: resume.hero.summary,
  };
}

export default async function ResumePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const resume = content[locale];

  return (
    <>
      <a className="skip-link" href="#main">{resume.navigation.skipLabel}</a>
      <FinePointerCursor />
      <Header locale={locale} content={resume.navigation} />
      <main id="main">
        <Hero content={resume.hero} />
        <About content={resume.about} />
        <Timeline content={resume.timeline} />
        <Projects content={resume.projects} />
        <Skills content={resume.skills} />
        <Contact content={resume.contact} />
      </main>
      <Footer content={resume.footer} />
    </>
  );
}
