"use client";

import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { Timeline } from "@/components/sections/Timeline";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LocaleTransitionSurface, useLocaleTransition } from "@/components/LocaleTransition";
import { content } from "@/content";
import styles from "@/app/[locale]/PageShell.module.css";

export function ResumeContent() {
  const { locale } = useLocaleTransition();
  const resume = content[locale];
  return <>
      <a className={styles.skipLink} href="#main">{resume.navigation.skipLabel}</a>
      <Header locale={locale} content={resume.navigation} />
      <LocaleTransitionSurface>
        <main id="main" tabIndex={-1}>
          <Hero content={resume.hero} />
          <About content={resume.about} />
          <Timeline content={resume.timeline} />
          <Projects content={resume.projects} />
          <Skills content={resume.skills} />
          <Contact content={resume.contact} />
        </main>
        <Footer content={resume.footer} />
      </LocaleTransitionSurface>
  </>;
}
