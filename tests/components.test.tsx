import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { content } from "../src/content";
import { About } from "../src/components/sections/About";
import { Contact } from "../src/components/sections/Contact";
import { Footer } from "../src/components/Footer";
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

  it("renders a localized contact form alongside direct links", () => {
    const html = renderToStaticMarkup(<Contact content={content.ru.contact} />);
    expect(html).toContain("backend-задачу</span>");
    expect(html).toContain('href="mailto:asmorr@yandex.ru"');
    expect(html).toContain('href="tel:+79803892383"');
    expect(html).toContain("<form");
    expect(html).toContain('name="name"');
    expect(html).toContain('name="email"');
    expect(html).toContain('name="message"');
    expect(html).toContain('autoComplete="name"');
    expect(html).toContain('autoComplete="email"');
    expect(html).toContain("Сообщение");
    expect(html).not.toContain("Открыт к предложениям");
  });

  it("renders form labels and controls in both locales", () => {
    for (const locale of ["ru", "en"] as const) {
      const html = renderToStaticMarkup(<Contact content={content[locale].contact} />);
      expect(html).toContain(content[locale].contact.form.nameLabel);
      expect(html).toContain(content[locale].contact.form.emailLabel);
      expect(html).toContain(content[locale].contact.form.messageLabel);
      expect(html).toContain(content[locale].contact.form.submitLabel);
      expect(html).toContain('type="email"');
    }
  });

  it("renders localized footer back-to-top controls without dropping footer details", () => {
    for (const locale of ["ru", "en"] as const) {
      const footer = content[locale].footer;
      const html = renderToStaticMarkup(<Footer content={footer} contact={content[locale].contact} navigation={content[locale].navigation} />);
      expect(html).toContain(footer.backToTopLabel);
      expect(html).toContain(`aria-label="${footer.backToTopLabel}"`);
      expect(html).toContain('data-scroll-target="top"');
      expect(html).not.toContain(footer.signature);
      expect(html).not.toContain(footer.status);
      expect(html).not.toContain("©");
      expect(html).toContain(footer.role);
      expect(html).toContain(footer.location);
    }
  });
});
