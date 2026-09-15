import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { content } from "../src/content";
import { About } from "../src/components/sections/About";
import { Contact } from "../src/components/sections/Contact";
import { Timeline } from "../src/components/sections/Timeline";
import { TagList } from "../src/components/ui/TagList";

describe("portfolio storytelling components", () => {
  it("renders structured profile blocks and a hidden section number", () => {
    const html = renderToStaticMarkup(<About content={content.ru.about} />);
    expect(html).toContain('aria-hidden="true">01</span>');
    expect(html).toContain("Обо мне");
    expect(html).toContain("Работа");
    expect(html).toContain("Вне кода");
  });

  it("keeps the complete timeline readable in server-rendered markup", () => {
    const html = renderToStaticMarkup(<Timeline content={content.ru.timeline} />);
    for (const item of content.ru.timeline.items) {
      expect(html).toContain(item.period);
      expect(html).toContain(item.organization);
      expect(html).toContain(item.role);
    }
  });

  it("renders categorized tags as meaningful text", () => {
    const tags = content.ru.projects.items[0].tags;
    const html = renderToStaticMarkup(<TagList items={tags} />);
    expect(html).toContain("Сервис эталонизации");
    expect(html).toContain("Научные публикации");
  });

  it("renders accent contact copy and direct links without a form", () => {
    const html = renderToStaticMarkup(<Contact content={content.ru.contact} />);
    expect(html).toContain("backend-задачу</span>");
    expect(html).toContain('href="mailto:asmorr@yandex.ru"');
    expect(html).toContain('href="tel:+79803892383"');
    expect(html).not.toContain("<form");
  });
});
