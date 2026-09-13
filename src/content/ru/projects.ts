import type { ProjectsContent } from "../schema";

export const projects: ProjectsContent = {
  label: "Практика",
  title: "Избранные проекты",
  intro: "Два проекта, в которых я отвечал за серверную основу и структуру данных.",
  items: [
    {
      id: "research-publications",
      title: "Анализ научных публикаций",
      kind: "Исследовательский backend",
      problem: "Инструменты для структурированного анализа корпуса научных публикаций.",
      contribution: "Проектирование базы данных и реализация серверной части библиотечного фреймворка.",
      technologies: ["Python", "Data Modeling", "Research"],
    },
    {
      id: "lkey-store",
      title: "Backend интернет-магазина Lkey",
      kind: "Коммерческий проект",
      problem: "Серверная часть каталога и пользовательских сценариев магазина освещения.",
      contribution: "Архитектура приложения, REST API, модель PostgreSQL и кэш Redis.",
      technologies: ["Django REST Framework", "PostgreSQL", "Redis"],
      href: "https://lkey-studio.ru",
      linkLabel: "Открыть сайт",
    },
  ],
};
