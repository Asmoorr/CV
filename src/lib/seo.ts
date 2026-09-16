import type { Metadata } from "next";
import type { Locale, ResumeContent } from "../content/schema";
import { languageAlternates, localeUrl } from "./site";

const OPEN_GRAPH_LOCALES: Record<Locale, string> = { ru: "ru_RU", en: "en_US" };

export function buildPageMetadata(resume: ResumeContent, origin: string): Metadata {
  const canonical = localeUrl(origin, resume.locale);
  const socialImage = `${canonical}/opengraph-image`;
  const otherLocale: Locale = resume.locale === "ru" ? "en" : "ru";

  return {
    metadataBase: new URL(origin),
    title: resume.seo.title,
    description: resume.seo.description,
    applicationName: "Artyom Trikula CV",
    authors: [{ name: resume.hero.name, url: canonical }],
    creator: resume.hero.name,
    alternates: {
      canonical,
      languages: languageAlternates(origin),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "profile",
      url: canonical,
      siteName: "Artyom Trikula CV",
      title: resume.seo.socialTitle,
      description: resume.seo.socialDescription,
      locale: OPEN_GRAPH_LOCALES[resume.locale],
      alternateLocale: [OPEN_GRAPH_LOCALES[otherLocale]],
      images: [{ url: socialImage, width: 1200, height: 630, alt: resume.seo.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: resume.seo.socialTitle,
      description: resume.seo.socialDescription,
      images: [{ url: socialImage, width: 1200, height: 630, alt: resume.seo.imageAlt }],
    },
  };
}

export type ProfileJsonLd = {
  "@context": "https://schema.org";
  "@graph": [
    {
      "@type": "ProfilePage";
      "@id": string;
      url: string;
      inLanguage: Locale;
      name: string;
      description: string;
      mainEntity: { "@id": string };
    },
    {
      "@type": "Person";
      "@id": string;
      name: string;
      url: string;
      jobTitle: string;
      description: string;
      address: { "@type": "PostalAddress"; addressLocality: string };
      knowsAbout: string[];
      sameAs: string[];
    },
  ];
};

export function buildProfileJsonLd(resume: ResumeContent, origin: string): ProfileJsonLd {
  const canonical = localeUrl(origin, resume.locale);
  const personId = `${origin}/#person`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${canonical}#profile-page`,
        url: canonical,
        inLanguage: resume.locale,
        name: resume.seo.title,
        description: resume.seo.description,
        mainEntity: { "@id": personId },
      },
      {
        "@type": "Person",
        "@id": personId,
        name: resume.hero.name,
        url: canonical,
        jobTitle: resume.hero.role,
        description: resume.hero.summary,
        address: { "@type": "PostalAddress", addressLocality: resume.hero.location },
        knowsAbout: resume.hero.technologies,
        sameAs: [resume.contact.github],
      },
    ],
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
