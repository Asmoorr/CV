import { expect, test } from "@playwright/test";

type WheelInput = {
  deltaX?: number;
  deltaY?: number;
  deltaMode?: number;
  ctrlKey?: boolean;
};

async function dispatchWheel(page: import("@playwright/test").Page, init: WheelInput) {
  await page.evaluate((wheelInit) => {
    window.dispatchEvent(new WheelEvent("wheel", { bubbles: true, cancelable: true, ...wheelInit }));
  }, init);
}

async function waitForSmoothScroll(page: import("@playwright/test").Page) {
  await expect(page.locator("html")).toHaveAttribute("data-smooth-scroll-state", "idle");
}

test.describe("smooth wheel scrolling", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ru", { waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("data-smooth-scroll", "enabled");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  });

  test("smooths a discrete wheel impulse and stops its frame loop", async ({ page }) => {
    await dispatchWheel(page, { deltaY: 120, deltaMode: 0 });
    await expect(page.locator("html")).toHaveAttribute("data-smooth-scroll-state", "active");
    await page.waitForTimeout(24);
    const intermediate = await page.evaluate(() => window.scrollY);
    expect(intermediate).toBeGreaterThan(0);
    expect(intermediate).toBeLessThan(120);

    await waitForSmoothScroll(page);
    await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(120);
  });

  test("keeps small trackpad-like deltas proportional", async ({ page }) => {
    await dispatchWheel(page, { deltaY: 8, deltaMode: 0 });
    await waitForSmoothScroll(page);
    await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(8);
  });

  test("reverses promptly and clamps both document boundaries", async ({ page }) => {
    await dispatchWheel(page, { deltaY: 160, deltaMode: 0 });
    await page.waitForTimeout(32);
    const beforeReverse = await page.evaluate(() => window.scrollY);
    await dispatchWheel(page, { deltaY: -80, deltaMode: 0 });
    await waitForSmoothScroll(page);
    const afterReverse = await page.evaluate(() => window.scrollY);
    expect(afterReverse).toBeLessThan(beforeReverse);

    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    const bottom = await page.evaluate(() => window.scrollY);
    await dispatchWheel(page, { deltaY: 180, deltaMode: 0 });
    await waitForSmoothScroll(page);
    expect(await page.evaluate(() => window.scrollY)).toBe(bottom);

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await dispatchWheel(page, { deltaY: -180, deltaMode: 0 });
    await waitForSmoothScroll(page);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("leaves zoom, horizontal gestures and nested scrolling untouched", async ({ page }) => {
    await dispatchWheel(page, { deltaY: 100, ctrlKey: true });
    await dispatchWheel(page, { deltaX: 120, deltaY: 20 });
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    const prevented = await page.evaluate(() => {
      const scroller = document.createElement("div");
      scroller.style.cssText = "position:fixed;inset:100px auto auto 100px;width:100px;height:80px;overflow-y:auto";
      scroller.innerHTML = '<div style="height:300px"></div>';
      document.body.append(scroller);
      const accepted = scroller.dispatchEvent(new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 40 }));
      scroller.remove();
      return !accepted;
    });
    expect(prevented).toBe(false);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });
});

test.describe("pointer affordances", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440x1000", "Fine-pointer hover is covered on desktop");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/ru", { waitUntil: "networkidle" });
  });

  test("enlarges the ring only over non-navigation controls", async ({ page }) => {
    const ring = page.locator(".cursor-ring");
    const contactLink = page.locator('a[href^="mailto:"]');
    await contactLink.hover();
    await expect(ring).toHaveAttribute("data-interactive", "true");
    await expect.poll(() => ring.locator("span").evaluate((element) => getComputedStyle(element).transform)).not.toBe("none");

    const navigationLink = page.locator('header nav a[href="#about"]');
    await navigationLink.hover();
    await expect(ring).toHaveAttribute("data-interactive", "false");
    await expect.poll(() => navigationLink.evaluate((element) => getComputedStyle(element).transform)).not.toBe("none");
  });

  test("does not enlarge the ring when reduced motion is requested", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator('a[href^="mailto:"]').hover();
    const ringVisual = page.locator(".cursor-ring span");
    await expect.poll(() => ringVisual.evaluate((element) => getComputedStyle(element).transform)).toBe("matrix(1, 0, 0, 1, 0, 0)");
  });
});

test.describe("language navigation", () => {
  test("opens the selected locale at the top from every source position", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const switchToEnglish = () => page.locator('header a[href="/en"]');
    const openMobileMenu = async () => {
      const button = page.getByRole("button", { name: "Открыть меню" });
      if (await button.isVisible()) await button.click();
    };

    await page.goto("/ru", { waitUntil: "networkidle" });
    await openMobileMenu();
    const firstNavigation = switchToEnglish().click();
    await expect(page.locator("[data-locale-transition]")).toHaveAttribute("data-locale-transition", /exiting|waiting/);
    await firstNavigation;
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("[data-locale-transition]")).toHaveAttribute("data-locale-transition", "idle");
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    await page.goto("/ru", { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo({ top: 700, behavior: "instant" }));
    await openMobileMenu();
    await switchToEnglish().click();
    await expect(page).toHaveURL(/\/en$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

    await page.goto("/ru#contact", { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await openMobileMenu();
    await switchToEnglish().click();
    await expect(page).toHaveURL(/\/en$/);
    expect(await page.evaluate(() => window.location.hash)).toBe("");
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });
});

test("keeps custom cursor disabled for a touch context", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440x1000", "One touch-context check is sufficient");
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("/ru", { waitUntil: "networkidle" });
  await expect(page.locator("html")).not.toHaveClass(/has-fine-cursor/);
  await expect(page.locator(".cursor-ring")).toBeHidden();
  await context.close();
});

test.describe("footer back-to-top control", () => {
  const controls = [
    ["ru", "Наверх"],
    ["en", "Back to top"],
  ] as const;

  for (const [locale, label] of controls) {
    test(`${locale} returns to the top from the footer`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(`/${locale}`, { waitUntil: "networkidle" });
      await expect(page.locator("#top")).toHaveCount(1);
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));

      const control = page.getByRole("button", { name: label });
      await expect(control).toBeVisible();
      await control.click();
      await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(0);
      await expect(page).toHaveURL(new RegExp(`/${locale}#top$`));
      await expect(page.locator("main")).toBeFocused();
    });
  }

  test("supports keyboard activation and visible focus", async ({ page }) => {
    await page.goto("/ru", { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));

    const control = page.getByRole("button", { name: "Наверх" });
    await control.focus();
    await expect(control).toBeFocused();
    await expect.poll(() => control.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
    await page.keyboard.press("Space");
    await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(0);
    await expect(page.locator("main")).toBeFocused();
  });

  test("uses an instant scroll when reduced motion is requested", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/ru", { waitUntil: "networkidle" });
    await page.evaluate(() => {
      const nativeScrollTo = window.scrollTo.bind(window);
      window.scrollTo = ((options: ScrollToOptions) => {
        document.documentElement.dataset.backToTopBehavior = options.behavior ?? "auto";
        nativeScrollTo(options);
      }) as typeof window.scrollTo;
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
    });

    await page.getByRole("button", { name: "Наверх" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-back-to-top-behavior", "auto");
    await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(0);
  });

  test("keeps the control within the viewport width", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    const control = page.getByRole("button", { name: "Back to top" });
    await expect(control).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("highlights the arrow without moving footer layout", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440x1000", "Hover is covered once on desktop");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/ru", { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));

    const control = page.getByRole("button", { name: "Наверх" });
    const meta = page.locator("footer > div:last-child");
    const before = await meta.boundingBox();
    await control.hover();
    await expect.poll(() => control.locator("svg").evaluate((element) => getComputedStyle(element).transform)).not.toBe("none");
    expect(await meta.boundingBox()).toEqual(before);
  });
});

test("keeps keyboard focus visible in both locales", async ({ page }) => {
  for (const locale of ["ru", "en"]) {
    await page.goto(`/${locale}`, { waitUntil: "networkidle" });
    await page.keyboard.press("Tab");
    const skipLink = page.locator('a[href="#main"]');
    await expect(skipLink).toBeFocused();
    await expect.poll(() => skipLink.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
  }
});
