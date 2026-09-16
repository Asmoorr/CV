import { describe, expect, it } from "vitest";
import { content, locales } from "../src/content";

const categoryOrder = ["contribution", "technology", "practice", "domain"];

describe("resume content", () => {
  it("keeps both locales structurally aligned", () => {
    expect(locales).toEqual(["ru", "en"]);
    expect(Object.keys(content.ru)).toEqual(Object.keys(content.en));
    expect(content.ru.timeline.items.map((item) => item.id)).toEqual(content.en.timeline.items.map((item) => item.id));
    expect(content.ru.projects.items.map((item) => item.id)).toEqual(content.en.projects.items.map((item) => item.id));
    expect(content.ru.about.blocks.map((block) => block.id)).toEqual(["general", "work", "hobbies"]);
    expect(content.en.about.blocks.map((block) => block.id)).toEqual(["general", "work", "hobbies"]);
    expect(content.ru.timeline.items.map(({ id, start, end, track }) => ({ id, start, end, track }))).toEqual(
      content.en.timeline.items.map(({ id, start, end, track }) => ({ id, start, end, track })),
    );
  });

  it("has one linked and one intentionally unlinked project", () => {
    for (const locale of locales) {
      const projects = content[locale].projects.items;
      expect(projects.some((project) => project.href)).toBe(true);
      expect(projects.some((project) => !project.href)).toBe(true);
      expect(projects.every((project) => Boolean(project.href) === Boolean(project.linkLabel))).toBe(true);
    }
  });

  it("exposes usable direct contact values", () => {
    for (const locale of locales) {
      const contact = content[locale].contact;
      expect(contact.email).toMatch(/^[^@]+@[^@]+\.[^@]+$/);
      expect(contact.github).toBe("https://github.com/asmorr");
      expect(contact.phone.replace(/\D/g, "")).toBe("79803892383");
    }
  });

  it("does not publish editorial placeholders", () => {
    expect(JSON.stringify(content)).not.toMatch(/\[(?:указать|уточнить|добавить|подтвердить)/i);
  });

  it("uses resume-accurate career periods and descriptions", () => {
    const [research, lkey, review, education] = content.ru.timeline.items;
    expect([research.start, research.end]).toEqual(["2025-03", null]);
    expect(research.description).toMatch(/января 2026.+микросервисн.+эталонизац/i);
    expect([lkey.start, lkey.end]).toEqual(["2024-12", "2025-05"]);
    expect([review.start, review.end]).toEqual(["2024-11", "2025-01"]);
    expect(review.description).toMatch(/код.+тест/i);
    expect(review.description).not.toMatch(/документац/i);
    expect(education.end).toBe("2028-06");
  });

  it("keeps tags informative, unique, and category ordered", () => {
    for (const locale of locales) {
      const tagged = [...content[locale].timeline.items, ...content[locale].projects.items];
      for (const item of tagged) {
        const labels = item.tags.map((tag) => tag.label);
        const ranks = item.tags.map((tag) => categoryOrder.indexOf(tag.category));
        expect(new Set(labels).size).toBe(labels.length);
        expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
        expect(ranks.every((rank) => rank >= 0)).toBe(true);
      }
    }
  });

  it("keeps localized frontend-only form copy aligned", () => {
    for (const locale of locales) {
      expect(Object.keys(content[locale].contact)).toContain("form");
      expect(content[locale].contact.title.lead).toBeTruthy();
      expect(content[locale].contact.title.accent).toBeTruthy();
      expect(content[locale].contact.form.submitLabel).toBeTruthy();
      expect(content[locale].contact.form.unavailableMessage).toBeTruthy();
    }
  });
});
