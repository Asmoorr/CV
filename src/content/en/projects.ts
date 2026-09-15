import type { ProjectsContent } from "../schema";

export const projects: ProjectsContent = {
  label: "Practice",
  title: "Selected projects",
  intro: "Cases focused on the problem, my contribution, and engineering outcomes rather than repeating the career timeline.",
  items: [
    {
      id: "research-publications",
      title: "Scientific data platform",
      kind: "Research engineering",
      problem: "Bring collection, processing, and validation of scientific publication data into one system.",
      contribution: "Designed the data and backend for the initial library framework; after the teams merged, I took ownership of the data canonicalisation microservice.",
      result: "The project evolved from a standalone library into a shared microservice platform used by adjacent teams.",
      tags: [
        { label: "Canonicalisation service", category: "contribution" },
        { label: "Python", category: "technology" },
        { label: "Data design", category: "practice" },
        { label: "Scientific publications", category: "domain" },
      ],
    },
    {
      id: "lkey-store",
      title: "Lkey online store backend",
      kind: "Commercial project",
      problem: "Server-side catalogue and customer journeys for a lighting store.",
      contribution: "Application architecture, REST API, PostgreSQL model, and Redis cache.",
      result: "A monolithic backend system was designed and implemented from scratch for the live store website.",
      tags: [
        { label: "Backend from scratch", category: "contribution" },
        { label: "Django REST Framework", category: "technology" },
        { label: "PostgreSQL", category: "technology" },
        { label: "Redis", category: "technology" },
        { label: "E-commerce", category: "domain" },
      ],
      href: "https://lkey-studio.ru",
      linkLabel: "Visit website",
    },
  ],
};
