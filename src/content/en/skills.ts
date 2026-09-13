import type { SkillsContent } from "../schema";

export const skills: SkillsContent = {
  label: "Capabilities",
  title: "How I solve problems",
  coreLabel: "Core stack",
  core: ["Python", "Django REST Framework", "PostgreSQL", "Redis"],
  groups: [
    { id: "tools", title: "Used in projects", items: ["FastAPI", "Docker", "Linux", "Git / GitHub", "SQL", "Bash"] },
    { id: "architecture", title: "System design", items: ["REST APIs", "Database schemas", "Caching", "Monolithic architecture"] },
    { id: "practice", title: "Engineering practice", items: ["Code review", "Testing", "Documentation", "Teamwork"] },
  ],
};
