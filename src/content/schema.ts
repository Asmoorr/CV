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
  scrollPrompt: string;
};

export type EntryContent = {
  loading: string;
  enter: string;
  ariaLabel: string;
};

export type SeoContent = {
  title: string;
  description: string;
  socialTitle: string;
  socialDescription: string;
  imageAlt: string;
};

export type AboutContent = {
  label: string;
  title: string;
  blocks: Array<{ id: "general" | "work" | "hobbies"; title: string; text: string }>;
  facts: Array<{ value: string; label: string }>;
};

export type TagCategory = "contribution" | "technology" | "practice" | "domain";
export type ContentTag = { label: string; category: TagCategory };

export type TimelineItem = {
  id: string;
  period: string;
  start: `${number}-${number}`;
  end: `${number}-${number}` | null;
  track: "work" | "education";
  kind: string;
  organization: string;
  role: string;
  description: string;
  tags: ContentTag[];
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
  result: string;
  tags: ContentTag[];
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
  title: { lead: string; accent: string };
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
  form: {
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submitLabel: string;
    requiredError: string;
    emailError: string;
    messageLengthError: string;
    unavailableMessage: string;
  };
};

export type FooterContent = {
  name: string;
  role: string;
  location: string;
  status: string;
  backToTop: string;
  resetEntry: string;
  resetEntrySuccess: string;
  resetEntryError: string;
};

export type ResumeContent = {
  locale: Locale;
  seo: SeoContent;
  navigation: NavigationContent;
  entry: EntryContent;
  hero: HeroContent;
  about: AboutContent;
  timeline: TimelineContent;
  projects: ProjectsContent;
  skills: SkillsContent;
  contact: ContactContent;
  footer: FooterContent;
};
