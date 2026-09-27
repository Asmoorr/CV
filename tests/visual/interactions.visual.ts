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

async function waitForScroll(page: import("@playwright/test").Page, target: number) {
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY)), { timeout: 4000 }).toBe(target);
}

async function visitWithEntryComplete(page: import("@playwright/test").Page, path: string) {
  await page.goto(path, { waitUntil: "networkidle" });
  const root = page.locator("html");
  if (await root.getAttribute("data-entry-state") === "required") {
    await page.getByRole("button", { name: /ВОЙТИ|ENTER/ }).click();
    await expect(root).toHaveAttribute("data-entry-state", "entered", { timeout: 4000 });
  }
}

test.describe("smooth wheel scrolling", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await visitWithEntryComplete(page, "/ru");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(page.locator("html")).toHaveClass(/lenis/);
  });

  test("smooths a discrete wheel impulse to the requested document position", async ({ page }) => {
    await dispatchWheel(page, { deltaY: 120, deltaMode: 0 });
    await page.waitForTimeout(24);
    const intermediate = await page.evaluate(() => window.scrollY);
    expect(intermediate).toBeGreaterThan(0);
    expect(intermediate).toBeLessThan(120);

    await waitForScroll(page, 120);
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => Math.round(window.scrollY))).toBe(120);
  });

  test("keeps small trackpad-like deltas proportional", async ({ page }) => {
    await dispatchWheel(page, { deltaY: 8, deltaMode: 0 });
    await waitForScroll(page, 8);
  });

  test("reverses promptly and clamps both document boundaries", async ({ page }) => {
    await dispatchWheel(page, { deltaY: 160, deltaMode: 0 });
    await page.waitForTimeout(32);
    await dispatchWheel(page, { deltaY: -80, deltaMode: 0 });
    await waitForScroll(page, 80);
    const afterReverse = await page.evaluate(() => window.scrollY);
    expect(afterReverse).toBeLessThan(160);

    const bottom = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    await dispatchWheel(page, { deltaY: 10000, deltaMode: 0 });
    await waitForScroll(page, bottom);
    await dispatchWheel(page, { deltaY: 180, deltaMode: 0 });
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => window.scrollY)).toBe(bottom);

    await dispatchWheel(page, { deltaY: -10000, deltaMode: 0 });
    await waitForScroll(page, 0);
    await dispatchWheel(page, { deltaY: -180, deltaMode: 0 });
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("leaves zoom and horizontal gestures native", async ({ page }) => {
    await dispatchWheel(page, { deltaY: 100, ctrlKey: true });
    await dispatchWheel(page, { deltaX: 120, deltaY: 20 });
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("lets the open mobile menu scroll without moving the document", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 480 });
    await page.getByRole("button", { name: "Открыть меню" }).click();
    const panel = page.locator("header [data-lenis-prevent]");
    await expect(panel).toBeVisible();
    const panelBounds = await panel.boundingBox();
    expect(panelBounds).not.toBeNull();
    const initialPanelScroll = await panel.evaluate((element) => element.scrollTop);
    await page.mouse.move(panelBounds!.x + panelBounds!.width / 2, panelBounds!.y + panelBounds!.height / 2);
    await page.mouse.wheel(0, 160);
    await expect.poll(() => panel.evaluate((element) => element.scrollTop)).toBeGreaterThan(initialPanelScroll);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });
});

test("locks scrolling behind the entry overlay and restores it for a returning session", async ({ page }) => {
  await page.goto("/ru", { waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("data-entry-state", "required");
  await dispatchWheel(page, { deltaY: 180 });
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-entry-state", "entered", { timeout: 4000 });
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("cv:entry-seen:v1"))).toBe("1");

  await page.reload({ waitUntil: "networkidle" });
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("cv:entry-seen:v1"))).toBe("1");
  await expect(page.locator("html")).toHaveAttribute("data-entry-state", "bypassed");
  await page.waitForTimeout(100);
  await dispatchWheel(page, { deltaY: 120 });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

test.describe("pointer affordances", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440x1000", "Fine-pointer hover is covered on desktop");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await visitWithEntryComplete(page, "/ru");
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

    await visitWithEntryComplete(page, "/ru");
    await openMobileMenu();
    const firstNavigation = switchToEnglish().click();
    await expect(page.locator("[data-locale-transition]")).toHaveAttribute("data-locale-transition", /exiting|waiting/);
    await firstNavigation;
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("[data-locale-transition]")).toHaveAttribute("data-locale-transition", "idle");
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    await visitWithEntryComplete(page, "/ru");
    await page.evaluate(() => window.scrollTo({ top: 700, behavior: "instant" }));
    await openMobileMenu();
    await switchToEnglish().click();
    await expect(page).toHaveURL(/\/en$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

    await visitWithEntryComplete(page, "/ru#contact");
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
      await visitWithEntryComplete(page, `/${locale}`);
      await expect(page.locator("#top")).toHaveCount(1);
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));

      const control = page.getByRole("button", { name: label });
      await expect(control).toBeVisible();
      await control.click();
      await page.waitForTimeout(800);
      expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
      await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(0);
      await expect(page).toHaveURL(new RegExp(`/${locale}#top$`));
      await expect(page.locator("main")).toBeFocused();
    });
  }

  test("supports keyboard activation and visible focus", async ({ page }) => {
    await visitWithEntryComplete(page, "/ru");
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
    await visitWithEntryComplete(page, "/ru");
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));

    await page.getByRole("button", { name: "Наверх" }).click();
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("keeps the control within the viewport width", async ({ page }) => {
    await visitWithEntryComplete(page, "/en");
    const control = page.getByRole("button", { name: "Back to top" });
    await expect(control).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("highlights the arrow without moving footer layout", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440x1000", "Hover is covered once on desktop");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await visitWithEntryComplete(page, "/ru");
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));

    const control = page.getByRole("button", { name: "Наверх" });
    const meta = page.locator("footer > div:last-child");
    const before = await meta.boundingBox();
    await control.hover();
    await expect.poll(() => control.locator("span").evaluate((element) => getComputedStyle(element).transform)).not.toBe("none");
    expect(await meta.boundingBox()).toEqual(before);
  });
});

test("keeps keyboard focus visible in both locales", async ({ page }) => {
  for (const locale of ["ru", "en"]) {
    await visitWithEntryComplete(page, `/${locale}`);
    await expect(page.locator("[data-entry-content]")).not.toHaveAttribute("inert", "");
    await page.evaluate(() => {
      document.body.tabIndex = 0;
      document.body.focus();
      document.body.tabIndex = -1;
    });
    await page.keyboard.press("Tab");
    const skipLink = page.locator('a[href="#main"]');
    await expect(skipLink).toBeFocused();
    await expect.poll(() => skipLink.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
  }
});

test("uses Lenis for fragment links and keeps section targets below the fixed header", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await visitWithEntryComplete(page, "/ru");
  const menuButton = page.getByRole("button", { name: "Открыть меню" });
  if (await menuButton.isVisible()) await menuButton.click();
  await page.locator('header nav a[href="#contact"]').click();
  await expect(page).toHaveURL(/#contact$/);
  await expect.poll(() => page.locator("#contact").evaluate((element) => element.getBoundingClientRect().top)).toBeLessThanOrEqual(160);
  const contactTop = await page.locator("#contact").evaluate((element) => element.getBoundingClientRect().top);
  expect(contactTop).toBeGreaterThanOrEqual(74);
  await page.waitForTimeout(100);

  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBeGreaterThan(0);
  const skipLink = page.locator('a[href="#main"]');
  await skipLink.evaluate((element) => (element as HTMLElement).focus());
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
  await expect(page.locator("main")).toBeFocused();
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY)), { timeout: 4000 }).toBe(0);
  const positionAfterSkip = await page.evaluate(() => window.scrollY);
  await page.locator("main").evaluate((element) => (element as HTMLElement).focus({ preventScroll: true }));
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await page.evaluate(() => window.scrollY)).toBe(positionAfterSkip);
});
