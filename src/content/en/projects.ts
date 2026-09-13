import type { ProjectsContent } from "../schema";

export const projects: ProjectsContent = {
  label: "Practice",
  title: "Selected projects",
  intro: "Two projects where I was responsible for the server-side foundation and data structure.",
  items: [
    {
      id: "research-publications",
      title: "Scientific publication analysis",
      kind: "Research backend",
      problem: "Tools for structured analysis of a scientific publication corpus.",
      contribution: "Database design and backend implementation for a library framework.",
      technologies: ["Python", "Data Modeling", "Research"],
    },
    {
      id: "lkey-store",
      title: "Lkey online store backend",
      kind: "Commercial project",
      problem: "Server-side catalogue and customer journeys for a lighting store.",
      contribution: "Application architecture, REST API, PostgreSQL model, and Redis cache.",
      technologies: ["Django REST Framework", "PostgreSQL", "Redis"],
      href: "https://lkey-studio.ru",
      linkLabel: "Visit website",
    },
  ],
};
