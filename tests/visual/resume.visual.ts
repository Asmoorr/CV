import path from "node:path";
import { expect, test } from "@playwright/test";

const locales = ["ru", "en"] as const;
const screenshotStyle = path.join(__dirname, "screenshot.css");

for (const locale of locales) {
  test(`${locale} full page`, async ({ page }) => {
    await page.goto(`/${locale}`, { waitUntil: "networkidle" });
    const entryState = await page.locator("html").getAttribute("data-entry-state");
    if (entryState === "required") {
      await page.getByRole("button", { name: locale === "ru" ? "ВОЙТИ" : "ENTER" }).click();
      await expect(page.locator("html")).toHaveAttribute("data-entry-state", "entered");
    }
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page).toHaveScreenshot(`${locale}-full-page.png`, {
      animations: "disabled",
      caret: "hide",
      fullPage: true,
      stylePath: screenshotStyle,
    });
  });

  test(`${locale} hero midpoint`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(`/${locale}`, { waitUntil: "networkidle" });
    if (await page.locator("html").getAttribute("data-entry-state") === "required") {
      await page.getByRole("button", { name: locale === "ru" ? "ВОЙТИ" : "ENTER" }).click();
      await expect(page.locator("html")).toHaveAttribute("data-entry-state", "entered");
    }

    const target = await page.locator("#top").evaluate((hero) => {
      const distance = (hero as HTMLElement).offsetHeight - window.innerHeight;
      return Math.round(distance * 0.5);
    });
    await page.evaluate((scrollTop) => window.scrollTo({ top: scrollTop, behavior: "instant" }), target);
    await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(target);
    await page.waitForTimeout(80);
    await expect(page).toHaveScreenshot(`${locale}-hero-midpoint.png`, {
      animations: "disabled",
      caret: "hide",
      stylePath: screenshotStyle,
    });
  });
}
