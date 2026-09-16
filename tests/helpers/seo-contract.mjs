import assert from "node:assert/strict";

function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([:\w-]+)=["']([^"']*)["']/g)].map((match) => [match[1], match[2]]),
  );
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((match) => attributes(match[0]));
}

export function validateSeoHtml(html, { locale, origin, title, description }) {
  assert.match(html, new RegExp(`<html[^>]+lang=["']${locale}["']`, "i"));
  assert.equal((html.match(/<h1\b/gi) ?? []).length, 1, "page must contain exactly one h1");
  assert.match(html, /<main\b[^>]*>[\s\S]*?\S[\s\S]*?<\/main>/i, "main content must not be empty");
  assert.ok(html.includes(`<title>${title}</title>`), "localized title is missing");

  const meta = tags(html, "meta");
  const links = tags(html, "link");
  const canonical = `${origin}/${locale}`;
  const metaByName = (name) => meta.find((item) => item.name === name);
  const metaByProperty = (property) => meta.find((item) => item.property === property);

  assert.equal(metaByName("description")?.content, description);
  assert.match(metaByName("robots")?.content ?? "", /index/);
  assert.match(metaByName("robots")?.content ?? "", /follow/);
  assert.equal(links.find((item) => item.rel === "canonical")?.href, canonical);

  const alternates = Object.fromEntries(
    links
      .filter((item) => item.rel === "alternate" && (item.hreflang || item.hrefLang))
      .map((item) => [item.hreflang || item.hrefLang, item.href]),
  );
  assert.deepEqual(alternates, {
    ru: `${origin}/ru`,
    en: `${origin}/en`,
    "x-default": `${origin}/ru`,
  });

  assert.equal(metaByProperty("og:url")?.content, canonical);
  assert.equal(metaByName("twitter:card")?.content, "summary_large_image");
  const socialImage = metaByProperty("og:image")?.content;
  assert.ok(socialImage?.startsWith(origin), "Open Graph image must use the canonical origin");

  const jsonLdMatch = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  assert.ok(jsonLdMatch, "JSON-LD payload is missing");
  const jsonLd = JSON.parse(jsonLdMatch[1]);
  assert.equal(jsonLd["@context"], "https://schema.org");
  assert.equal(jsonLd["@graph"]?.[0]?.url, canonical);
  assert.equal(jsonLd["@graph"]?.[1]?.["@id"], `${origin}/#person`);

  return { socialImage, links };
}
