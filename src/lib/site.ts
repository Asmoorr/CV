import type { Locale } from "../content/locale";

const LOCAL_ORIGIN = "http://localhost:3000";
const PREVIEW_HOST_SUFFIXES = [".vercel.app", ".netlify.app", ".pages.dev", ".github.io"];

export function normalizeSiteOrigin(value: string | undefined, environment = process.env.NODE_ENV): string {
  if (!value) {
    if (environment === "production") {
      throw new Error("SITE_URL is required for a production build");
    }
    return LOCAL_ORIGIN;
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("SITE_URL must be an absolute URL");
  }

  if (url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new Error("SITE_URL must contain only an origin without credentials, path, query, or hash");
  }

  if (environment === "production") {
    const hostname = url.hostname.toLowerCase();
    if (url.protocol !== "https:") throw new Error("SITE_URL must use HTTPS in production");
    if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "127.0.0.1" || hostname === "::1") {
      throw new Error("SITE_URL cannot use localhost in production");
    }
    if (PREVIEW_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
      throw new Error("SITE_URL cannot use a preview-host domain in production");
    }
  }

  return url.origin;
}

export function getSiteOrigin(): string {
  return normalizeSiteOrigin(process.env.SITE_URL);
}

export function localeUrl(origin: string, locale: Locale): string {
  return `${origin}/${locale}`;
}

export function languageAlternates(origin: string) {
  return {
    ru: localeUrl(origin, "ru"),
    en: localeUrl(origin, "en"),
    "x-default": localeUrl(origin, "ru"),
  } as const;
}
