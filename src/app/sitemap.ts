import type { MetadataRoute } from "next";
import { locales } from "../content/locale";
import { getSiteOrigin, languageAlternates, localeUrl } from "../lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteOrigin();
  const languages = languageAlternates(origin);

  return locales.map((locale) => ({
    url: localeUrl(origin, locale),
    alternates: { languages },
  }));
}
