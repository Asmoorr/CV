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

for (const locale of ["ru", "en"]) {
  test(`${locale} enters by pointer without outlining the hero name`, async ({ page }) => {
    await page.goto(`/${locale}`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: locale === "ru" ? "Войти" : "Enter" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-entry-state", "entered", { timeout: 4000 });
    await expect(page.locator("main")).toBeFocused();
    await expect.poll(() => page.locator("#hero-name").evaluate((element) => getComputedStyle(element).outlineStyle)).toBe("none");
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  for (const key of ["Enter", "Space"]) {
    test(`${locale} enters by ${key} with visible focus on the hero action`, async ({ page }) => {
      await page.goto(`/${locale}`, { waitUntil: "networkidle" });
      const enterButton = page.getByRole("button", { name: locale === "ru" ? "Войти" : "Enter" });
      await enterButton.focus();
      await page.keyboard.press(key);
      await expect(page.locator("html")).toHaveAttribute("data-entry-state", "entered", { timeout: 4000 });
      const action = page.locator('[data-entry-hero] a[href="#experience"]');
      await expect(action).toBeFocused();
      await expect.poll(() => action.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
      await expect.poll(() => page.locator("#hero-name").evaluate((element) => getComputedStyle(element).outlineStyle)).toBe("none");
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
      await page.keyboard.press("Tab");
      await expect(page.locator('[data-entry-hero] a[href="#contact"]')).toBeFocused();
    });
  }
}

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

  test("keeps the transition screen and scrollbar stable across the locale layout replacement", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440x1000", "Classic scrollbar geometry is checked on desktop");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await visitWithEntryComplete(page, "/ru");
    await page.evaluate(() => window.scrollTo({ top: 700, behavior: "instant" }));
    const before = await page.evaluate(() => ({
      headerRight: document.querySelector("header")!.getBoundingClientRect().right,
      contentLeft: document.querySelector("main section .container")!.getBoundingClientRect().left,
    }));
    await page.evaluate(() => {
      const shell = document.querySelector("[data-locale-transition]")!;
      const record = window as Window & { __localeWaiting?: unknown };
      new MutationObserver(() => {
        if (shell.getAttribute("data-locale-transition") !== "waiting") return;
        record.__localeWaiting = {
          scrollY: window.scrollY,
          opacity: getComputedStyle(document.querySelector("#locale-transition-screen")!).opacity,
          overflow: getComputedStyle(document.documentElement).overflowY,
          headerRight: document.querySelector("header")!.getBoundingClientRect().right,
          contentLeft: document.querySelector("main section .container")!.getBoundingClientRect().left,
        };
      }).observe(shell, { attributes: true, attributeFilter: ["data-locale-transition"] });
    });

    await page.locator('header a[href="/en"]').click();
    const screen = page.locator("#locale-transition-screen");
    await expect(screen).toBeVisible();
    await screen.evaluate((element) => { element.dataset.probe = "same-screen"; });
    await expect(page).toHaveURL(/\/en$/);
    expect(await page.evaluate(() => (window as Window & { __localeWaiting?: unknown }).__localeWaiting)).toEqual({
      scrollY: 0, opacity: "1", overflow: "scroll", ...before,
    });
    await expect(screen).toHaveAttribute("data-probe", "same-screen");
    await expect(page.locator("[data-locale-transition]")).toHaveAttribute("data-locale-transition", "idle");
    await expect(screen).toHaveCount(0);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect(await page.evaluate(() => document.querySelector("header")!.getBoundingClientRect().right)).toBe(before.headerRight);
  });

  test("blocks input during the transition and restores mobile scrolling", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-320x800", "Mobile scroll lock is checked on mobile");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await visitWithEntryComplete(page, "/ru");
    await page.getByRole("button", { name: "Открыть меню" }).click();
    await page.locator('header a[href="/en"]').click();
    await expect(page.locator("#locale-transition-screen")).toBeVisible();
    expect(await page.evaluate(() => {
      const wheel = new WheelEvent("wheel", { cancelable: true, deltaY: 100 });
      const touch = new Event("touchmove", { cancelable: true });
      window.dispatchEvent(wheel);
      window.dispatchEvent(touch);
      return { wheel: wheel.defaultPrevented, touch: touch.defaultPrevented };
    })).toEqual({ wheel: true, touch: true });
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("[data-locale-transition]")).toHaveAttribute("data-locale-transition", "idle");
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
    await page.mouse.move(160, 600);
    await page.mouse.wheel(0, 120);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  });

  test("cleans up a timed-out transition and works with reduced motion", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440x1000", "Timeout and reduced-motion behavior is checked on desktop");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await visitWithEntryComplete(page, "/ru");
    await page.evaluate(() => {
      const original = window.setTimeout;
      window.setTimeout = ((handler: TimerHandler, delay?: number, ...args: unknown[]) =>
        original(handler, delay === 8000 ? 25 : delay, ...args)) as typeof window.setTimeout;
    });
    await page.locator('header a[href="/en"]').click();
    await expect(page.locator("#locale-transition-screen")).toHaveCount(0);
    await expect(page.locator("[data-locale-transition]")).toHaveAttribute("data-locale-transition", "idle");
    await page.mouse.wheel(0, 120);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

    await page.reload({ waitUntil: "networkidle" });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator('header a[href="/en"]').click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("[data-locale-transition]")).toHaveAttribute("data-locale-transition", "idle");
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
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

test.describe("hero text dissolve", () => {
  async function setHeroProgress(page: import("@playwright/test").Page, progress: number) {
    const target = await page.locator("#top").evaluate((hero, requestedProgress) => {
      const distance = (hero as HTMLElement).offsetHeight - window.innerHeight;
      return Math.round(Math.max(0, Math.min(1, requestedProgress)) * distance);
    }, progress);

    await page.evaluate((scrollTop) => window.scrollTo({ top: scrollTop, behavior: "instant" }), target);
    await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(target);
    await page.waitForTimeout(80);
  }

  async function readWordState(page: import("@playwright/test").Page) {
    return page.locator("[data-dissolve-word]").evaluateAll((words) => words.map((word) => {
      const style = getComputedStyle(word);
      const transform = style.transform;
      const z = transform.startsWith("matrix3d(") ? Number(transform.slice(9, -1).split(",")[14]) : 0;
      return { opacity: Number(style.opacity), transform, z };
    }));
  }

  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await visitWithEntryComplete(page, "/ru");
    await setHeroProgress(page, 0);
  });

  test("keeps localized semantic text and readable words at the top", async ({ page }) => {
    const name = page.locator("#hero-name");
    await expect(name).toHaveText("Артём Трикула");
    await expect(name).toHaveAttribute("data-dissolve-text", "true");
    await expect.poll(async () => (await readWordState(page)).every((word) => word.opacity === 1 && word.transform === "none")).toBe(true);
  });

  test("flies words into positive Z at the midpoint and returns on reverse scroll", async ({ page }) => {
    await setHeroProgress(page, 0.5);
    const midpoint = await readWordState(page);
    expect(midpoint.some((word) => word.opacity < 1 && word.transform !== "none")).toBe(true);
    expect(midpoint.every((word) => word.z > 0)).toBe(true);

    await page.reload({ waitUntil: "networkidle" });
    await setHeroProgress(page, 0.5);
    expect(await readWordState(page)).toEqual(midpoint);

    await setHeroProgress(page, 0);
    const returned = await readWordState(page);
    expect(returned.every((word) => word.opacity === 1 && word.transform === "none")).toBe(true);

    await setHeroProgress(page, 1);
    const bottom = await readWordState(page);
    expect(bottom.every((word) => word.opacity >= 0 && word.opacity <= 1)).toBe(true);
    expect(bottom.every((word) => word.opacity === 0 && word.z > 0)).toBe(true);
  });

  test("includes both actions, metadata and circles in the reversible exit", async ({ page }) => {
    const items = page.locator("[data-dissolve-item]");
    await expect(items).toHaveCount(6);
    const opacities = () => items.evaluateAll((elements) => elements.map((element) => Number(getComputedStyle(element).opacity)));
    await setHeroProgress(page, 0.5);
    expect((await opacities()).every((opacity) => opacity > 0 && opacity < 1)).toBe(true);
    await setHeroProgress(page, 1);
    expect((await opacities()).every((opacity) => opacity === 0)).toBe(true);
    await page.locator('[data-dissolve-item="experience"]').focus();
    await expect(page.locator('[data-dissolve-item="experience"]')).toHaveCSS("opacity", "1");
    await page.locator('[data-dissolve-item="experience"]').evaluate((element) => (element as HTMLElement).blur());
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect.poll(async () => (await opacities()).every((opacity) => opacity === 1)).toBe(true);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await setHeroProgress(page, 0);
    expect((await opacities()).every((opacity) => opacity === 1)).toBe(true);
  });

  test("keeps CTA focusable and the document within the viewport width during retreat", async ({ page }) => {
    await setHeroProgress(page, 0.75);
    const contact = page.getByRole("link", { name: "Связаться" });
    await expect(contact).toBeVisible();
    await contact.focus();
    await expect(contact).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("does not dissolve while the entry overlay is locking the page", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    await page.evaluate(() => sessionStorage.removeItem("cv:entry-seen:v1"));
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("data-entry-state", "required");
    const words = page.locator("[data-dissolve-word]");
    await expect.poll(async () => (await readWordState(page)).every((word) => word.opacity === 1 && word.transform === "none")).toBe(true);
    await expect(words.first()).toBeAttached();
  });

  test("returns immediately to a static visible state when reduced motion changes live", async ({ page }) => {
    await setHeroProgress(page, 0.5);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect.poll(async () => (await readWordState(page)).every((word) => word.opacity === 1 && word.transform === "none")).toBe(true);
  });
});

test.describe("hero text dissolve locales", () => {
  for (const [locale, expectedName] of [["ru", "Артём Трикула"], ["en", "Artyom Trikula"]] as const) {
    test(`${locale} keeps the server-rendered hero name`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await visitWithEntryComplete(page, `/${locale}`);
      await expect(page.locator("#hero-name")).toHaveText(expectedName);
      await expect(page.locator("#hero-name [data-dissolve-word]")).toHaveCount(2);
    });
  }
});
