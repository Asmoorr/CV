import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));

function requireMatch(content, pattern, message) {
  if (!pattern.test(content)) {
    throw new Error(message);
  }
}

export function validateComposeContract(compose) {
  requireMatch(
    compose,
    /image:\s*["']\$\{IMAGE_REPOSITORY:\?[^}]+}:\$\{IMAGE_TAG:\?[^}]+}["']/,
    "Production image must require IMAGE_REPOSITORY and IMAGE_TAG.",
  );
  requireMatch(compose, /["']127\.0\.0\.1:3000:3000["']/, "Port 3000 must bind only to IPv4 loopback.");
  if (/^\s*-\s*["']?(?:0\.0\.0\.0:|\[::\]:)?3000:3000/m.test(compose)) {
    throw new Error("Port 3000 must not be published on all interfaces.");
  }
  requireMatch(compose, /fetch\('http:\/\/127\.0\.0\.1:3000\/ru'/, "Health check must request the Russian route.");
  requireMatch(compose, /restart:\s*unless-stopped/, "Production container must restart unless stopped.");
}

export function validateDeployEntrypoint(deploy) {
  requireMatch(deploy, /\^\[0-9a-f]\{40\}\$/, "Deploy entrypoint must accept only a full lowercase SHA.");
  requireMatch(deploy, /IMAGE_REPOSITORY="ghcr\.io\/asmoorr\/cv"/, "Deploy entrypoint must use the fixed GHCR repository.");
  requireMatch(deploy, /flock -n 9/, "Deploy entrypoint must serialize server-side operations.");
  requireMatch(deploy, /Rollback succeeded:/, "Deploy entrypoint must implement rollback reporting.");
  if (/\beval\s/.test(deploy)) {
    throw new Error("Deploy entrypoint must not evaluate caller-controlled shell text.");
  }
}

export function validateWorkflowContract(workflow) {
  requireMatch(workflow, /push:\n\s+branches:\s*\[main]/, "Workflow must run for pushes to main.");
  requireMatch(workflow, /workflow_dispatch:/, "Workflow must support manual deployment.");
  for (const command of ["npm run lint", "npm run typecheck", "npm test", "npm run build"]) {
    if (!workflow.includes(command)) throw new Error(`Workflow quality gate is missing: ${command}`);
  }
  requireMatch(workflow, /ghcr\.io\/asmoorr\/cv:\$\{\{ needs\.prepare\.outputs\.sha }}/, "Workflow must publish and deploy the selected SHA.");
  if (workflow.includes("ghcr.io/asmoorr/cv:latest")) {
    throw new Error("Workflow must not deploy a floating latest tag.");
  }
  requireMatch(workflow, /StrictHostKeyChecking=yes/, "SSH must require the pinned host key.");
  requireMatch(workflow, /cancel-in-progress:\s*false/, "Production deployments must be serialized without cancelling an active server operation.");
  requireMatch(workflow, /needs:\s*\[prepare, quality]/, "Image publication must depend on successful quality gates.");
  requireMatch(workflow, /needs:\s*\[prepare, publish]/, "Deployment must depend on the immutable image job.");
  requireMatch(workflow, /imagetools inspect/, "Manual rollback must verify and reuse an existing image.");
}

export function validateSudoersContract(sudoers) {
  requireMatch(sudoers, /deploy ALL=\(root\) NOPASSWD: \/usr\/local\/sbin\/deploy-artem-trikula \*/, "Sudo must restrict elevation to the fixed entrypoint.");
  if (/\/usr\/bin\/docker|\/bin\/bash/.test(sudoers)) {
    throw new Error("Deploy user must not receive direct Docker or shell sudo access.");
  }
}

export function validateRepository(root = projectRoot) {
  const read = (path) => readFileSync(resolve(root, path), "utf8").replace(/\r\n/g, "\n");
  validateComposeContract(read("compose.production.yaml"));
  validateDeployEntrypoint(read("ops/deploy-artem-trikula"));
  validateSudoersContract(read("ops/artem-trikula-deploy.sudoers"));
  validateWorkflowContract(read(".github/workflows/deploy-production.yml"));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    validateRepository();
    console.log("Deployment configuration is valid.");
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
