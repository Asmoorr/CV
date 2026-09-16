import { spawnSync } from "node:child_process";

const result = spawnSync("npm run build", {
  cwd: process.cwd(),
  env: { ...process.env, SITE_URL: process.env.SITE_URL ?? "https://artem-trikula.ru" },
  stdio: "inherit",
  shell: true,
});

if (result.error) console.error(result.error);
process.exit(result.status ?? 1);
