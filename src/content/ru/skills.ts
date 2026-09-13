import type { SkillsContent } from "../schema";

export const skills: SkillsContent = {
  label: "Компетенции",
  title: "Чем решаю задачи",
  coreLabel: "Основной стек",
  core: ["Python", "Django REST Framework", "PostgreSQL", "Redis"],
  groups: [
    { id: "tools", title: "Применяю в проектах", items: ["FastAPI", "Docker", "Linux", "Git / GitHub", "SQL", "Bash"] },
    { id: "architecture", title: "Проектирование", items: ["REST API", "Схемы баз данных", "Кэширование", "Монолитная архитектура"] },
    { id: "practice", title: "Инженерная практика", items: ["Code Review", "Тестирование", "Документация", "Командная работа"] },
  ],
};
