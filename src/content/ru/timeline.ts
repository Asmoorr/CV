import type { TimelineContent } from "../schema";

export const timeline: TimelineContent = {
  label: "Путь",
  title: "Опыт и образование",
  intro: "Рабочие и учебные задачи, которые формируют мой подход к backend-разработке.",
  items: [
    {
      id: "itmo-research",
      period: "Март 2025 — сейчас",
      kind: "Работа",
      organization: "ИТМО, Санкт-Петербург",
      role: "Лаборант / Backend Developer",
      description: "Разрабатываю библиотеку-фреймворк для анализа научных публикаций: проектирую структуру данных и реализую серверную часть совместно с партнёром из сферы ИИ.",
      technologies: ["Python", "Database Design", "AI Integration", "Research"],
    },
    {
      id: "lkey",
      period: "Декабрь 2024 — май 2025",
      kind: "Проектная работа",
      organization: "Lkey Studio",
      role: "Backend Developer",
      description: "С нуля спроектировал серверную архитектуру интернет-магазина осветительных приборов: REST API, модель данных и слой кэширования.",
      technologies: ["Python", "Django REST Framework", "PostgreSQL", "Redis"],
    },
    {
      id: "itmo-review",
      period: "Ноябрь 2024 — январь 2025",
      kind: "Работа",
      organization: "ИТМО, Санкт-Петербург",
      role: "Лаборант",
      description: "Проводил ревью репозиториев лаборатории: анализировал код проектов, дополнял тесты и документацию.",
      technologies: ["Code Review", "Testing", "GitHub", "Documentation"],
    },
    {
      id: "itmo-education",
      period: "2024 — 2028",
      kind: "Образование",
      organization: "Университет ИТМО",
      role: "Прикладная информатика",
      description: "Изучаю алгоритмы, системное программирование, математику и проектирование программных систем.",
      technologies: ["Алгоритмы", "Системное программирование", "Математика"],
      status: "Обучаюсь",
    },
  ],
};
