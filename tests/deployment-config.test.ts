import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  validateComposeContract,
  validateDeployEntrypoint,
  validateSudoersContract,
  validateWorkflowContract,
} from "../scripts/validate-deployment.mjs";

const root = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8").replace(/\r\n/g, "\n");

describe("production deployment contract", () => {
  it("keeps the application behind the loopback-only Nginx upstream", () => {
    const compose = read("compose.production.yaml");
    expect(() => validateComposeContract(compose)).not.toThrow();

    const publiclyBound = compose.replace("127.0.0.1:3000:3000", "0.0.0.0:3000:3000");
    expect(() => validateComposeContract(publiclyBound)).toThrow(/loopback|interfaces/i);
  });

  it("only accepts immutable lowercase commit SHAs in the server entrypoint", () => {
    const deploy = read("ops/deploy-artem-trikula");

    expect(() => validateDeployEntrypoint(deploy)).not.toThrow();
    expect(() => validateDeployEntrypoint(deploy.replace("^[0-9a-f]{40}$", ".+"))).toThrow(/SHA/i);
  });

  it("limits sudo to the fixed entrypoint and one SHA argument", () => {
    const sudoers = read("ops/artem-trikula-deploy.sudoers");

    expect(() => validateSudoersContract(sudoers)).not.toThrow();
  });

  it("runs quality gates before publishing and deploys the exact prepared SHA", () => {
    const workflow = read(".github/workflows/deploy-production.yml");

    expect(() => validateWorkflowContract(workflow)).not.toThrow();
  });
});
