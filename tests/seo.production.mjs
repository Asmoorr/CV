import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { cpSync, existsSync } from "node:fs";
import path from "node:path";
import { validateSeoHtml } from "./helpers/seo-contract.mjs";

const projectRoot = process.cwd();
const standaloneRoot = path.join(projectRoot, ".next", "standalone");
const origin = "https://artem-trikula.ru";
const localOrigin = "http://127.0.0.1:3200";

assert.ok(existsSync(path.join(standaloneRoot, "server.js")), "Run npm run build before npm run test:seo");
cpSync(path.join(projectRoot, ".next", "static"), path.join(standaloneRoot, ".next", "static"), { recursive: true });
cpSync(path.join(projectRoot, "public"), path.join(standaloneRoot, "public"), { recursive: true });

const server = spawn(process.execPath, [path.join(standaloneRoot, "server.js")], {
  cwd: standaloneRoot,
  env: { ...process.env, HOSTNAME: "127.0.0.1", PORT: "3200", SITE_URL: origin },
  stdio: ["ignore", "pipe", "pipe"],
});

async function waitUntilReady() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${localOrigin}/ru`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Production server did not become ready");
}

async function verifyPage(locale, expected) {
  const response = await fetch(`${localOrigin}/${locale}`);
  assert.equal(response.status, 200);
  const html = await response.text();
  const { socialImage, links } = validateSeoHtml(html, { locale, origin, ...expected });

  const localImageUrl = socialImage.replace(origin, localOrigin);
  const imageResponse = await fetch(localImageUrl);
  assert.equal(imageResponse.status, 200, `${localImageUrl} must resolve`);
  assert.match(imageResponse.headers.get("content-type") ?? "", /^image\/png/);

  const internalPaths = new Set(
    links
      .map((link) => link.href)
      .filter((href) => href?.startsWith("/") && !href.startsWith("/#")),
  );
  for (const href of internalPaths) {
    const linkedResponse = await fetch(`${localOrigin}${href}`, { redirect: "manual" });
    assert.ok(linkedResponse.status < 400, `${href} returned ${linkedResponse.status}`);
  }
}

try {
  await waitUntilReady();

  const root = await fetch(`${localOrigin}/`, { redirect: "manual" });
  assert.ok([307, 308].includes(root.status));
  assert.equal(new URL(root.headers.get("location"), localOrigin).pathname, "/ru");

  await verifyPage("ru", {
    title: "Артём Трикула — Backend-разработчик Python",
    description: "Backend-разработчик из Санкт-Петербурга: Python, Django REST, FastAPI, PostgreSQL, Redis, API и платформы обработки данных.",
  });
  await verifyPage("en", {
    title: "Artyom Trikula — Python Backend Developer",
    description: "Backend developer in Saint Petersburg working with Python, Django REST, FastAPI, PostgreSQL, Redis, APIs, and data platforms.",
  });

  const invalidLocale = await fetch(`${localOrigin}/de`);
  assert.equal(invalidLocale.status, 404);

  const robots = await (await fetch(`${localOrigin}/robots.txt`)).text();
  assert.match(robots, /Allow: \/(?:\r?\n|$)/);
  assert.match(robots, new RegExp(`Host: ${origin.replaceAll(".", "\\.")}`));
  assert.match(robots, new RegExp(`Sitemap: ${origin.replaceAll(".", "\\.")}\/sitemap\\.xml`));

  const sitemap = await (await fetch(`${localOrigin}/sitemap.xml`)).text();
  assert.equal((sitemap.match(/<url>/g) ?? []).length, 2);
  assert.equal((sitemap.match(new RegExp(`<loc>${origin}/ru</loc>`, "g")) ?? []).length, 1);
  assert.equal((sitemap.match(new RegExp(`<loc>${origin}/en</loc>`, "g")) ?? []).length, 1);
  assert.ok(!sitemap.includes("localhost") && !sitemap.includes("#") && !sitemap.includes("<lastmod>"));

  console.log("SEO production contract passed for /, /ru, /en, robots, sitemap, social images, and internal metadata links.");
} finally {
  server.kill("SIGINT");
}
