import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResumeContent } from "@/components/ResumeContent";
import { content, isLocale } from "@/content";
import { buildPageMetadata, buildProfileJsonLd, serializeJsonLd } from "@/lib/seo";
import { getSiteOrigin } from "@/lib/site";

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
      <ResumeContent />
    </>
  );
}
