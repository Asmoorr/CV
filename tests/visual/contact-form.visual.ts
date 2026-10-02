import { expect, test } from "@playwright/test";

async function openPage(page: import("@playwright/test").Page, locale: "ru" | "en") {
  await page.goto(`/${locale}`, { waitUntil: "networkidle" });
  if (await page.locator("html").getAttribute("data-entry-state") === "required") {
    await page.getByRole("button", { name: locale === "ru" ? /войти/i : /enter/i }).click();
    await expect(page.locator("html")).toHaveAttribute("data-entry-state", "entered");
  }
  await page.locator("#contact").scrollIntoViewIfNeeded();
}

async function fillValidForm(page: import("@playwright/test").Page, locale: "ru" | "en") {
  await page.getByLabel(locale === "ru" ? "Ваше имя" : "Your name").fill("Ada Lovelace");
  await page.getByLabel(locale === "ru" ? "Email для ответа" : "Reply email").fill("ada@example.com");
  await page.getByLabel(locale === "ru" ? "Сообщение" : "Message").fill("I'd like to discuss a project.");
}

for (const locale of ["ru", "en"] as const) {
  const copy = locale === "ru"
    ? { submit: "Отправить сообщение", sending: "Отправляем…", success: "Сообщение отправлено. Спасибо!", direct: "Написать на email" }
    : { submit: "Send message", sending: "Sending…", success: "Message sent. Thank you!", direct: "Send an email" };

  test(`${locale} contact form validates required fields and focuses the first error`, async ({ page }) => {
    await openPage(page, locale);
    const submit = page.getByRole("button", { name: copy.submit });
    await submit.click();

    const name = page.getByLabel(locale === "ru" ? "Ваше имя" : "Your name");
    await expect(name).toBeFocused();
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(name).toHaveAttribute("aria-describedby", /name-error$/);
    await expect(name).toHaveAttribute("name", "name");
    await expect(name).toHaveAttribute("autocomplete", "name");
    await expect(name).toHaveAttribute("required", "");
    await expect(name).toHaveAttribute("maxlength", "240");

    await name.fill("Ada");
    await page.getByLabel(locale === "ru" ? "Email для ответа" : "Reply email").fill("not-an-email");
    await page.getByLabel(locale === "ru" ? "Сообщение" : "Message").fill("Hello");
    await submit.click();
    const email = page.getByLabel(locale === "ru" ? "Email для ответа" : "Reply email");
    await expect(email).toBeFocused();
    await expect(email).toHaveAttribute("aria-invalid", "true");
    expect(await page.locator("html").evaluate((element) => element.scrollWidth <= window.innerWidth)).toBe(true);

    await email.fill("ada@example.com");
    const message = page.getByLabel(locale === "ru" ? "Сообщение" : "Message");
    await message.fill("x".repeat(1501));
    await submit.click();
    await expect(message).toBeFocused();
    await expect(message).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator(`#${await message.getAttribute("id")}-error`)).toHaveText(locale === "ru" ? "Превышена допустимая длина." : "The maximum length has been exceeded.");
  });

  test(`${locale} contact form reports confirmed delivery and preserves direct email`, async ({ page }) => {
    let requestBody: unknown;
    await page.route("**/api/contact", async (route) => {
      requestBody = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });

    await openPage(page, locale);
    await fillValidForm(page, locale);
    await page.getByRole("button", { name: copy.submit }).click();
    await expect(page.locator("#contact form [role=status]")).toHaveText(copy.success);
    expect(requestBody).toEqual({ name: "Ada Lovelace", email: "ada@example.com", message: "I'd like to discuss a project." });
    await expect(page.getByLabel(locale === "ru" ? "Ваше имя" : "Your name")).toHaveValue("");
    await expect(page.getByRole("link", { name: new RegExp(copy.direct) })).toHaveAttribute("href", "mailto:asmorr@yandex.ru");
  });
}

test("contact form keeps values after rate limiting and blocks a second submit while pending", async ({ page }) => {
  let releaseResponse!: () => void;
  let requestCount = 0;
  const responseGate = new Promise<void>((resolve) => { releaseResponse = resolve; });
  await page.route("**/api/contact", async (route) => {
    requestCount += 1;
    await responseGate;
    await route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ ok: false, error: "RATE_LIMIT" }) });
  });

  await openPage(page, "ru");
  await fillValidForm(page, "ru");
  const submit = page.getByRole("button", { name: "Отправить сообщение" });
  try {
    await submit.click();
    await expect(page.getByRole("button", { name: "Отправляем…" })).toBeDisabled();
    await expect.poll(() => requestCount).toBe(1);
    expect(requestCount).toBe(1);
    releaseResponse();
    await expect(page.locator("#contact form [role=status]")).toHaveText("Слишком много попыток. Подождите немного и попробуйте снова.");
    await expect(page.getByLabel("Ваше имя")).toHaveValue("Ada Lovelace");
    await expect(page.getByLabel("Email для ответа")).toHaveValue("ada@example.com");
    await expect(page.getByLabel("Сообщение")).toHaveValue("I'd like to discuss a project.");
  } finally {
    releaseResponse();
  }
});

test("contact form maps server and network failures without discarding the draft", async ({ page }) => {
  const failures = [
    { status: 400, expected: "Проверьте введённые данные и попробуйте ещё раз." },
    { status: 502, expected: "Не удалось отправить сообщение. Попробуйте ещё раз или напишите напрямую." },
    { status: 503, expected: "Форма временно недоступна. Напишите напрямую на email." },
    { status: 0, expected: "Не удалось отправить сообщение. Попробуйте ещё раз или напишите напрямую." },
  ];
  let failureIndex = 0;
  await page.route("**/api/contact", async (route) => {
    const failure = failures[failureIndex++];
    if (failure.status === 0) await route.abort("failed");
    else await route.fulfill({ status: failure.status, contentType: "application/json", body: JSON.stringify({ ok: false }) });
  });

  await openPage(page, "ru");
  await fillValidForm(page, "ru");
  const submit = page.getByRole("button", { name: "Отправить сообщение" });
  for (const failure of failures) {
    await submit.click();
    await expect(page.locator("#contact form [role=status]")).toHaveText(failure.expected);
    await expect(page.getByLabel("Ваше имя")).toHaveValue("Ada Lovelace");
  }
});

test("contact form fields and submit button follow keyboard tab order", async ({ page }) => {
  await openPage(page, "en");
  const name = page.getByLabel("Your name");
  const email = page.getByLabel("Reply email");
  const message = page.getByLabel("Message");
  const submit = page.getByRole("button", { name: "Send message" });
  await name.focus();
  await page.keyboard.press("Tab");
  await expect(email).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(message).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(submit).toBeFocused();
});

test("contact form preserves its draft through a locale transition", async ({ page }) => {
  await openPage(page, "ru");
  await fillValidForm(page, "ru");
  const enButton = page.getByRole("button", { name: "EN", exact: true });
  if (!(await enButton.isVisible())) await page.getByRole("button", { name: "Открыть меню" }).click();
  await enButton.click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByLabel("Your name")).toHaveValue("Ada Lovelace");
  await expect(page.getByLabel("Reply email")).toHaveValue("ada@example.com");
  await expect(page.getByLabel("Message")).toHaveValue("I'd like to discuss a project.");
});

test("contact field errors stay associated and change language with the form", async ({ page }) => {
  await openPage(page, "ru");
  await page.getByLabel("Ваше имя").fill("Ada");
  await page.getByLabel("Email для ответа").fill("not-an-email");
  await page.getByLabel("Сообщение").fill("Hello");
  await page.getByRole("button", { name: "Отправить сообщение" }).click();
  const email = page.getByLabel("Email для ответа");
  await expect(email).toBeFocused();
  await expect(page.locator(`#${await email.getAttribute("id")}-error`)).toHaveText("Введите корректный email.");

  const enButton = page.getByRole("button", { name: "EN", exact: true });
  if (!(await enButton.isVisible())) await page.getByRole("button", { name: "Открыть меню" }).click();
  await enButton.click();
  const translatedEmail = page.getByLabel("Reply email");
  await expect(translatedEmail).toHaveValue("not-an-email");
  await expect(translatedEmail).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator(`#${await translatedEmail.getAttribute("id")}-error`)).toHaveText("Enter a valid email address.");
});

test("contact section remains within the viewport and reveals once", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openPage(page, "en");
  const grid = page.locator("#contact > div");
  await expect.poll(() => grid.getAttribute("data-contact-revealed")).toBe("true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expect(grid).toHaveAttribute("data-contact-revealed", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("contact fields are immediately visible when reduced motion is requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openPage(page, "en");
  const grid = page.locator("#contact > div");
  await expect(grid).toHaveAttribute("data-contact-revealed", "true");
  await expect(page.getByLabel("Message")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("contact form and information fit one desktop 16:9 viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 810 });
  await openPage(page, "ru");
  await expect(page.locator("#contact > div")).toHaveAttribute("data-contact-revealed", "true");
  const layout = await page.evaluate(() => {
    const section = document.querySelector<HTMLElement>("#contact")!;
    const grid = section.querySelector<HTMLElement>("[class*='grid']")!;
    const form = section.querySelector("form")!;
    const intro = section.querySelector<HTMLElement>("#contact-heading")!.parentElement!;
    const links = section.querySelector<HTMLElement>("[class*='links']")!;
    const sectionRect = section.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();
    return {
      viewportHeight: window.innerHeight,
      viewportWidth: document.documentElement.clientWidth,
      headerHeight: document.querySelector("header")!.getBoundingClientRect().height,
      linksTop: links.getBoundingClientRect().top - sectionRect.top,
      sectionHeight: Math.round(sectionRect.height),
      gridWidth: gridRect.width,
      gridLeft: gridRect.left,
      firstContactValueAlignment: getComputedStyle(links.querySelector("strong")!).textAlign,
      formBottom: form.getBoundingClientRect().bottom - sectionRect.top,
      introTop: intro.getBoundingClientRect().top - sectionRect.top,
      infoBottom: Math.max(intro.getBoundingClientRect().bottom, links.getBoundingClientRect().bottom) - sectionRect.top,
    };
  });

  expect(layout.sectionHeight).toBe(layout.viewportHeight - layout.headerHeight);
  expect(layout.gridWidth).toBeLessThanOrEqual(1240);
  expect(Math.abs(layout.linksTop - layout.introTop)).toBeLessThanOrEqual(1);
  expect(Math.abs(layout.gridLeft - (layout.viewportWidth - layout.gridWidth) / 2)).toBeLessThanOrEqual(8);
  expect(layout.firstContactValueAlignment).toBe("right");
  expect(layout.formBottom).toBeLessThanOrEqual(layout.introTop);
  expect(layout.infoBottom).toBeLessThanOrEqual(layout.sectionHeight);
});
