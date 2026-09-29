import { expect, test, type Page } from "@playwright/test";

async function visit(page: Page, path: string) {
  await page.addInitScript(() => sessionStorage.setItem("cv:entry-seen:v1", "1"));
  await page.goto(path, { waitUntil: "networkidle" });
}
async function switchLanguage(page: Page, locale: string) {
  const menu = page.locator("header button[aria-controls]");
  if (await menu.isVisible()) await menu.click();
  await page.locator(`header button[data-locale="${locale}"]`).click();
}
const shell = (page: Page) => page.locator("[data-locale-transition]");

test.describe("language switching in place", () => {
  for (const initial of ["ru", "en"] as const) {
    test(`${initial} switches both ways without navigation and reload restores route default`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await visit(page, `/${initial}`);
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const requests: string[] = [];
      page.on("request", (request) => requests.push(request.url()));
      await page.locator("main").evaluate((main) => { main.dataset.identity = "preserved"; });
      const next = initial === "ru" ? "en" : "ru";
      await switchLanguage(page, next);
      await expect(shell(page)).toHaveAttribute("data-locale-transition", "scrambling");
      const glyphs = await page.locator("[data-locale-scramble] > [aria-hidden] > span > span:last-child").allTextContents();
      expect(glyphs.length).toBeGreaterThan(5);
      expect(glyphs.join("")).toMatch(next === "ru" ? /[А-Яа-яЁё]/ : /[A-Za-z]/);
      await expect(page.locator("html")).toHaveAttribute("lang", next);
      await expect(page).toHaveURL(new RegExp(`/${initial}$`));
      await expect(shell(page)).toHaveAttribute("data-locale-transition", "idle");
      await expect(page.locator("#hero-name")).toHaveText(next === "ru" ? "Артём Трикула" : "Artyom Trikula");
      await expect(page.locator("main")).toHaveAttribute("data-identity", "preserved");
      await expect(page.locator("[data-locale-scramble]")).toHaveCount(0);
      await switchLanguage(page, initial);
      await expect(shell(page)).toHaveAttribute("data-locale-transition", "idle");
      await expect(page.locator("#hero-name")).toHaveText(initial === "ru" ? "Артём Трикула" : "Artyom Trikula");
      expect(requests).toEqual([]);
      expect(errors).toEqual([]);
      await switchLanguage(page, next);
      await expect(shell(page)).toHaveAttribute("data-locale-transition", "idle");
      await page.reload({ waitUntil: "networkidle" });
      await expect(page.locator("html")).toHaveAttribute("lang", initial);
    });
  }

  test("preserves scroll and fragment and animates visible sections", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await visit(page, "/ru#projects");
    await page.locator("#projects").evaluate((section) => window.scrollTo({ top: (section as HTMLElement).offsetTop - 100, behavior: "instant" }));
    const before = await page.evaluate(() => window.scrollY);
    await switchLanguage(page, "en");
    await expect(page.locator("#projects [data-locale-scramble]").first()).toBeAttached();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
    await expect(shell(page)).toHaveAttribute("data-locale-transition", "idle");
    await expect(page).toHaveURL(/\/ru#projects$/);
    expect(Math.abs(await page.evaluate(() => window.scrollY) - before)).toBeLessThan(5);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.mouse.move(150, 600);
    await page.mouse.wheel(0, 120);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before);
  });

  test("supports reduced motion and cancels cleanly when the preference changes", async ({ page }) => {
    await visit(page, "/ru");
    await switchLanguage(page, "en");
    await expect(page.locator("#hero-name")).toHaveText("Artyom Trikula");
    await expect(page.locator("[data-locale-scramble]")).toHaveCount(0);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await switchLanguage(page, "ru");
    await expect(shell(page)).toHaveAttribute("data-locale-transition", "scrambling");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(shell(page)).toHaveAttribute("data-locale-transition", "idle");
    await expect(page.locator("[data-locale-scramble]")).toHaveCount(0);
    await expect(page.locator("#hero-name")).toHaveText("Артём Трикула");
  });
});

 test("language animation resizes actions smoothly and ignores repeated input", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440x1000", "Desktop keyboard and geometry check");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await visit(page, "/ru");
  const action = page.locator('[data-dissolve-item="experience"]');
  const oldWidth = (await action.boundingBox())!.width;
  const toggle = page.locator('button[data-locale="en"]');
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(toggle).toBeFocused();
  await page.locator('button[data-locale="ru"]').evaluate((button) => (button as HTMLButtonElement).click());
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.waitForTimeout(250); // Sample inside the 2.2-second resize.
  const intermediate = (await action.boundingBox())!.width;
  expect(await action.evaluate((element) => element.getAnimations().length)).toBeGreaterThan(0);
  await page.screenshot({ path: testInfo.outputPath("language-scramble.png") });
  await expect(shell(page)).toHaveAttribute("data-locale-transition", "idle");
  const finalWidth = (await action.boundingBox())!.width;
  expect(Math.abs(oldWidth - finalWidth)).toBeGreaterThan(1);
  expect(intermediate).toBeGreaterThan(Math.min(oldWidth, finalWidth));
  expect(intermediate).toBeLessThan(Math.max(oldWidth, finalWidth));
  await switchLanguage(page, "ru");
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(shell(page)).toHaveAttribute("data-locale-transition", "idle");
  await expect(page.locator("[data-locale-scramble]")).toHaveCount(0);
  await expect(page.locator("#hero-name")).toHaveText("Артём Трикула");
 });
