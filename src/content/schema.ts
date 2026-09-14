import type { Locale } from "./locale";

export type { Locale } from "./locale";

export type NavigationContent = {
  brand: string;
  skipLabel: string;
  ariaLabel: string;
  languageLabel: string;
  menuOpen: string;
  menuClose: string;
  items: Array<{ id: "about" | "experience" | "projects" | "skills" | "contact"; label: string }>;
};

export type HeroContent = {
  greeting: string;
  name: string;
  role: string;
  summary: string;
  primaryAction: string;
  secondaryAction: string;
  status: string;
  location: string;
  technologies: string[];
};

export type AboutContent = {
  label: string;
  title: string;
  paragraphs: string[];
  facts: Array<{ value: string; label: string }>;
};

export type TimelineItem = {
  id: string;
  period: string;
  kind: string;
  organization: string;
  role: string;
  description: string;
  technologies: string[];
  status?: string;
  result?: string;
};

export type TimelineContent = {
  label: string;
  title: string;
  intro: string;
  items: TimelineItem[];
};

export type ProjectItem = {
  id: string;
  title: string;
  kind: string;
  problem: string;
  contribution: string;
  technologies: string[];
  href?: string;
  linkLabel?: string;
};

export type ProjectsContent = {
  label: string;
  title: string;
  intro: string;
  items: ProjectItem[];
};

export type SkillsContent = {
  label: string;
  title: string;
  coreLabel: string;
  core: string[];
  groups: Array<{ id: string; title: string; items: string[] }>;
};

export type ContactContent = {
  label: string;
  title: string;
  description: string;
  status: string;
  responseTime: string;
  phone: string;
  phoneLabel: string;
  email: string;
  emailLabel: string;
  github: string;
  githubLabel: string;
  location: string;
  locationLabel: string;
};

export type FooterContent = {
  name: string;
  role: string;
  location: string;
  status: string;
  signature: string;
};

export type ResumeContent = {
  locale: Locale;
  navigation: NavigationContent;
  hero: HeroContent;
  about: AboutContent;
  timeline: TimelineContent;
  projects: ProjectsContent;
  skills: SkillsContent;
  contact: ContactContent;
  footer: FooterContent;
};
