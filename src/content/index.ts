import { en } from "./en";
import { ru } from "./ru";
import type { Locale, ResumeContent } from "./schema";

export const content: Record<Locale, ResumeContent> = { ru, en };
export const locales: Locale[] = ["ru", "en"];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
