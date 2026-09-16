import { expect, test } from "@playwright/test";

test("entry is scoped to the tab and survives locale switching", async ({ page }) => {
  await page.goto("/ru", { waitUntil: "networkidle" });
  const dialog = page.getByRole("dialog", { name: "Открыть портфолио" });
  await expect(dialog).toBeVisible();
  const enter = dialog.getByRole("button", { name: "Войти" });
  await expect(enter).toBeEnabled();
  await expect(page).toHaveScreenshot("entry-ready.png", { animations: "disabled", caret: "hide" });
  await enter.click();
  await expect(page.locator("html")).toHaveAttribute("data-entry-state", "entered");
  if ((page.viewportSize()?.width ?? 0) <= 900) {
    await page.getByRole("button", { name: "Открыть меню" }).click();
  }
  await page.getByRole("link", { name: "EN" }).click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("language segments remain symmetric", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("portfolio-entry-complete", "true"));
  await page.goto("/en", { waitUntil: "networkidle" });
  const links = page.locator('[aria-label="Choose language"] a');
  await expect(links).toHaveCount(2);
  const boxes = await links.evaluateAll((elements) => elements.map((element) => {
    const box = element.getBoundingClientRect();
    return { width: box.width, height: box.height };
  }));
  expect(boxes[0]).toEqual(boxes[1]);
});

test("contact form validates locally and transmits nothing", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("portfolio-entry-complete", "true"));
  await page.goto("/en", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("#contact-name-error")).toBeVisible();
  await page.getByLabel("Name").fill("Ada");
  await page.getByLabel("Reply email").fill("ada@example.com");
  await page.getByLabel("Message").fill("Let’s discuss a backend role.");
  const transmitted: string[] = [];
  page.on("request", (request) => {
    if (request.method() !== "GET") transmitted.push(request.url());
  });
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("status").filter({ hasText: "delivery is coming later" })).toBeVisible();
  expect(transmitted).toEqual([]);
  await expect(page.getByLabel("Message")).toHaveValue("Let’s discuss a backend role.");
});

test("footer reset restores entry on the next load and go up returns focus", async ({ page }) => {
  await page.goto("/en", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Enter" }).click();
  await page.getByRole("button", { name: "Show entry again" }).click();
  await expect(page.getByRole("status").filter({ hasText: "next page load" })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByRole("dialog", { name: "Enter the portfolio" })).toBeVisible();
  await page.getByRole("button", { name: "Enter" }).click();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.getByRole("button", { name: "Go up" }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(2);
  await expect(page.locator("#top")).toBeFocused();
});

test("reveals content once without horizontal overflow", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("portfolio-entry-complete", "true"));
  await page.goto("/en", { waitUntil: "networkidle" });
  await page.locator("#about").scrollIntoViewIfNeeded();
  await expect(page.locator("#about [data-reveal]").first()).toHaveAttribute("data-revealed", "true");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("server content remains visible", async ({ page }) => {
    await page.goto("/ru");
    await expect(page.getByRole("heading", { level: 1, name: "Артём Трикула" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Обсудим/ })).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});
