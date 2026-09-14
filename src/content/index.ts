import { en } from "./en";
import type { Locale } from "./locale";
import { ru } from "./ru";
import type { ResumeContent } from "./schema";

export const content: Record<Locale, ResumeContent> = { ru, en };
export { isLocale, locales } from "./locale";
export type { Locale } from "./locale";
