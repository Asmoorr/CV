import path from "node:path";
import { expect, test } from "@playwright/test";

const locales = ["ru", "en"] as const;
const screenshotStyle = path.join(__dirname, "screenshot.css");

for (const locale of locales) {
  test(`${locale} full page`, async ({ page }) => {
    await page.goto(`/${locale}`, { waitUntil: "networkidle" });
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
}
