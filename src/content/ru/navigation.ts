import type { NavigationContent } from "../schema";

export const navigation: NavigationContent = {
  brand: "А.Трикула",
  skipLabel: "Перейти к содержанию",
  ariaLabel: "Основная навигация",
  languageLabel: "Выбрать язык",
  menuOpen: "Открыть меню",
  menuClose: "Закрыть меню",
  items: [
    { id: "about", label: "Обо мне" },
    { id: "experience", label: "Опыт" },
    { id: "projects", label: "Проекты" },
    { id: "skills", label: "Навыки" },
    { id: "contact", label: "Контакты" },
  ],
};
