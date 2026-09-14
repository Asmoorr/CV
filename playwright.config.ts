import { defineConfig } from "@playwright/test";

const port = 3100;

export default defineConfig({
  testDir: "./tests/visual",
  testMatch: "**/*.visual.ts",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  outputDir: "artifacts/playwright/test-results",
  reporter: [
    ["list"],
    ["html", { outputFolder: "artifacts/playwright/report", open: "never" }],
  ],
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.001,
    },
  },
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    browserName: "chromium",
    colorScheme: "dark",
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-1440x1000",
      use: { viewport: { width: 1440, height: 1000 } },
    },
    {
      name: "tablet-768x1024",
      use: { viewport: { width: 768, height: 1024 } },
    },
    {
      name: "mobile-320x800",
      use: { viewport: { width: 320, height: 800 } },
    },
  ],
  webServer: {
    command: "node tests/visual/start-production-server.mjs",
    url: `http://127.0.0.1:${port}/ru`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
