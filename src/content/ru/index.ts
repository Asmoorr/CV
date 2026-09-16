import type { ResumeContent } from "../schema";
import { about } from "./about";
import { contact } from "./contact";
import { entry } from "./entry";
import { footer } from "./footer";
import { hero } from "./hero";
import { navigation } from "./navigation";
import { projects } from "./projects";
import { seo } from "./seo";
import { skills } from "./skills";
import { timeline } from "./timeline";

export const ru: ResumeContent = { locale: "ru", seo, navigation, entry, hero, about, timeline, projects, skills, contact, footer };
