import type { NavigationContent } from "../schema";

export const navigation: NavigationContent = {
  brand: "A.Trikula",
  skipLabel: "Skip to content",
  ariaLabel: "Primary navigation",
  languageLabel: "Choose language",
  menuOpen: "Open menu",
  menuClose: "Close menu",
  items: [
    { id: "about", label: "About" },
    { id: "experience", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills" },
    { id: "contact", label: "Contact" },
  ],
};
