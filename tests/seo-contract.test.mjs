import { describe, expect, it } from "vitest";
import { validateSeoHtml } from "./helpers/seo-contract.mjs";

const options = {
  locale: "en",
  origin: "https://artem-trikula.ru",
  title: "Expected title",
  description: "Expected description",
};

describe("production SEO contract", () => {
  it("rejects a deliberately invalid HTML fixture", () => {
    expect(() => validateSeoHtml("<html lang=\"en\"><main></main></html>", options)).toThrow();
  });
});
