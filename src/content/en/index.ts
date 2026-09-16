import type { ResumeContent } from "../schema";
import { about } from "./about";
import { contact } from "./contact";
import { footer } from "./footer";
import { hero } from "./hero";
import { navigation } from "./navigation";
import { projects } from "./projects";
import { seo } from "./seo";
import { skills } from "./skills";
import { timeline } from "./timeline";

export const en: ResumeContent = { locale: "en", seo, navigation, hero, about, timeline, projects, skills, contact, footer };
