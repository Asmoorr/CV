import type { TimelineContent } from "../schema";

export const timeline: TimelineContent = {
  label: "Journey",
  title: "Experience and education",
  intro: "Professional and academic work shaping how I approach backend engineering.",
  items: [
    {
      id: "itmo-research",
      period: "March 2025 — present",
      kind: "Work",
      organization: "ITMO University, Saint Petersburg",
      role: "Lab Assistant / Backend Developer",
      description: "I’m building a library framework for analysing scientific publications, designing its data structure and implementing the backend with an AI industry partner.",
      technologies: ["Python", "Database Design", "AI Integration", "Research"],
    },
    {
      id: "lkey",
      period: "December 2024 — May 2025",
      kind: "Project work",
      organization: "Lkey Studio",
      role: "Backend Developer",
      description: "Designed the server architecture for an online lighting store from scratch, including its REST API, data model, and caching layer.",
      technologies: ["Python", "Django REST Framework", "PostgreSQL", "Redis"],
    },
    {
      id: "itmo-review",
      period: "November 2024 — January 2025",
      kind: "Work",
      organization: "ITMO University, Saint Petersburg",
      role: "Lab Assistant",
      description: "Reviewed laboratory repositories, analysed project code, and improved tests and documentation.",
      technologies: ["Code Review", "Testing", "GitHub", "Documentation"],
    },
    {
      id: "itmo-education",
      period: "2024 — 2028",
      kind: "Education",
      organization: "ITMO University",
      role: "Applied Computer Science",
      description: "Studying algorithms, systems programming, mathematics, and software system design.",
      technologies: ["Algorithms", "Systems Programming", "Mathematics"],
      status: "Ongoing",
    },
  ],
};
