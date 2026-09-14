import { cpSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = process.cwd();
const standaloneRoot = path.join(projectRoot, ".next", "standalone");

cpSync(
  path.join(projectRoot, ".next", "static"),
  path.join(standaloneRoot, ".next", "static"),
  { recursive: true },
);
cpSync(path.join(projectRoot, "public"), path.join(standaloneRoot, "public"), {
  recursive: true,
});

process.env.HOSTNAME = "127.0.0.1";
process.env.PORT = "3100";

await import(pathToFileURL(path.join(standaloneRoot, "server.js")).href);
