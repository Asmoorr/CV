import { describe, expect, it } from "vitest";
import { content, locales } from "../src/content";

describe("resume content", () => {
  it("keeps both locales structurally aligned", () => {
    expect(locales).toEqual(["ru", "en"]);
    expect(Object.keys(content.ru)).toEqual(Object.keys(content.en));
    expect(content.ru.timeline.items.map((item) => item.id)).toEqual(content.en.timeline.items.map((item) => item.id));
    expect(content.ru.projects.items.map((item) => item.id)).toEqual(content.en.projects.items.map((item) => item.id));
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
});
