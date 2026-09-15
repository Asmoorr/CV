import type { ProjectsContent } from "../schema";

export const projects: ProjectsContent = {
  label: "Практика",
  title: "Избранные проекты",
  intro: "Кейсы о задачах, личном вкладе и инженерных решениях — без повторения карьерной хронологии.",
  items: [
    {
      id: "research-publications",
      title: "Платформа научных данных",
      kind: "Исследовательская разработка",
      problem: "Объединить сбор, обработку и валидацию сведений о научных публикациях в единой системе.",
      contribution: "Спроектировал данные и backend первого библиотечного фреймворка; после объединения команд отвечаю за микросервис эталонизации данных.",
      result: "Проект вырос из отдельной библиотеки в общую микросервисную платформу смежных команд.",
      tags: [
        { label: "Сервис эталонизации", category: "contribution" },
        { label: "Python", category: "technology" },
        { label: "Проектирование данных", category: "practice" },
        { label: "Научные публикации", category: "domain" },
      ],
    },
    {
      id: "lkey-store",
      title: "Backend интернет-магазина Lkey",
      kind: "Коммерческий проект",
      problem: "Серверная часть каталога и пользовательских сценариев магазина освещения.",
      contribution: "Архитектура приложения, REST API, модель PostgreSQL и кэш Redis.",
      result: "Монолитная backend-система была спроектирована и реализована с нуля для действующего сайта магазина.",
      tags: [
        { label: "Backend с нуля", category: "contribution" },
        { label: "Django REST Framework", category: "technology" },
        { label: "PostgreSQL", category: "technology" },
        { label: "Redis", category: "technology" },
        { label: "E-commerce", category: "domain" },
      ],
      href: "https://lkey-studio.ru",
      linkLabel: "Открыть сайт",
    },
  ],
};
