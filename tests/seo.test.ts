import { afterEach, describe, expect, it } from "vitest";
import { content } from "../src/content";
import robots from "../src/app/robots";
import sitemap from "../src/app/sitemap";
import { buildPageMetadata, buildProfileJsonLd, serializeJsonLd } from "../src/lib/seo";
import { languageAlternates, normalizeSiteOrigin } from "../src/lib/site";

const productionOrigin = "https://artem-trikula.ru";
const originalSiteUrl = process.env.SITE_URL;

afterEach(() => {
  if (originalSiteUrl === undefined) delete process.env.SITE_URL;
  else process.env.SITE_URL = originalSiteUrl;
});

describe("site origin", () => {
  it("normalizes the confirmed production origin", () => {
    expect(normalizeSiteOrigin(`${productionOrigin}/`, "production")).toBe(productionOrigin);
  });

  it.each([
    undefined,
    "http://artem-trikula.ru",
    "https://localhost:3000",
    "https://cv-preview.vercel.app",
    "https://artem-trikula.ru/resume",
    "https://artem-trikula.ru?preview=true",
  ])("rejects unsafe production SITE_URL %s", (value) => {
    expect(() => normalizeSiteOrigin(value, "production")).toThrow();
  });

  it("uses localhost only outside production", () => {
    expect(normalizeSiteOrigin(undefined, "development")).toBe("http://localhost:3000");
  });
});

describe("localized metadata", () => {
  it.each(["ru", "en"] as const)("builds complete %s metadata", (locale) => {
    const resume = content[locale];
    const metadata = buildPageMetadata(resume, productionOrigin);
    const canonical = `${productionOrigin}/${locale}`;

    expect(metadata.title).toBe(resume.seo.title);
    expect(metadata.description).toBe(resume.seo.description);
    expect(metadata.alternates).toEqual({
      canonical,
      languages: languageAlternates(productionOrigin),
    });
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({
      type: "profile",
      url: canonical,
      title: resume.seo.socialTitle,
      description: resume.seo.socialDescription,
    });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });
});

describe("crawler discovery", () => {
  it("publishes only canonical localized URLs in the sitemap", () => {
    process.env.SITE_URL = productionOrigin;
    const entries = sitemap();
    expect(entries.map((entry) => entry.url)).toEqual([
      `${productionOrigin}/ru`,
      `${productionOrigin}/en`,
    ]);
    expect(new Set(entries.map((entry) => entry.url)).size).toBe(2);
    for (const entry of entries) {
      expect(entry.url).not.toContain("#");
      expect(entry.lastModified).toBeUndefined();
      expect(entry.alternates?.languages).toEqual(languageAlternates(productionOrigin));
    }
  });

  it("links robots to the canonical sitemap", () => {
    process.env.SITE_URL = productionOrigin;
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: `${productionOrigin}/sitemap.xml`,
      host: productionOrigin,
    });
  });
});

describe("profile structured data", () => {
  it.each(["ru", "en"] as const)("uses visible facts for %s", (locale) => {
    const resume = content[locale];
    const graph = buildProfileJsonLd(resume, productionOrigin);
    const [profile, person] = graph["@graph"];

    expect(profile).toMatchObject({
      "@type": "ProfilePage",
      url: `${productionOrigin}/${locale}`,
      inLanguage: locale,
      mainEntity: { "@id": `${productionOrigin}/#person` },
    });
    expect(person).toMatchObject({
      "@type": "Person",
      "@id": `${productionOrigin}/#person`,
      name: resume.hero.name,
      jobTitle: resume.hero.role,
      description: resume.hero.summary,
      sameAs: [resume.contact.github],
    });
    expect(person.knowsAbout).toEqual(resume.hero.technologies);
    expect(JSON.stringify(graph)).not.toMatch(/rating|review|placeholder/i);
  });

  it("escapes script-closing input", () => {
    const serialized = serializeJsonLd({ value: "</script><script>alert(1)</script>" });
    expect(serialized).not.toContain("<");
    expect(JSON.parse(serialized)).toEqual({ value: "</script><script>alert(1)</script>" });
  });
});
