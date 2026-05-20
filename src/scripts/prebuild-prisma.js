#!/usr/bin/env node

/**
 * Runs Prisma generate before `next build`. Retries on Windows EPERM when the
 * query engine binary is locked (often `next dev` or another Node process).
 *
 * Set SKIP_PRISMA_GENERATE=1 to skip entirely (client must already match the schema).
 */

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { setTimeout: delay } = require("timers/promises");

const MAX_ATTEMPTS = 5;
const DELAY_MS = 1500;
const dbDir = path.join(__dirname, "../../shared/db");
const packageRunner = process.platform === "win32" ? "corepack.cmd" : "corepack";

function resolvePrismaEngineDir() {
  let clientEntry;
  try {
    clientEntry = require.resolve("@prisma/client", { paths: [dbDir] });
  } catch {
    return null;
  }
  const clientPkgRoot = path.dirname(clientEntry);
  const candidates = [
    path.join(clientPkgRoot, "..", ".prisma", "client"),
    path.join(path.dirname(clientPkgRoot), ".prisma", "client"),
  ];
  for (const dir of candidates) {
    const normalized = path.normalize(dir);
    if (fs.existsSync(normalized)) {
      return normalized;
    }
  }
  return null;
}

function hasEngineBinary() {
  const engineDir = resolvePrismaEngineDir();
  if (!engineDir) {
    return false;
  }
  return fs.readdirSync(engineDir).some(
    (name) => name.startsWith("query_engine") || name.startsWith("libquery_engine"),
  );
}

async function main() {
  if (process.env.SKIP_PRISMA_GENERATE === "1") {
    console.info("[prebuild] SKIP_PRISMA_GENERATE=1 — skipping Prisma generate.");
    return;
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const result = spawnSync(packageRunner, ["pnpm", "run", "db:generate"], {
      cwd: dbDir,
      env: process.env,
      shell: true,
      encoding: "utf8",
      stdio: ["inherit", "inherit", "pipe"],
    });

    if (result.status === 0) {
      return;
    }

    const combined = `${result.stderr || ""}${result.stdout || ""}`;
    const isEperm = /EPERM|operation not permitted/i.test(combined);

    if (isEperm && attempt < MAX_ATTEMPTS) {
      console.warn(
        `[prebuild] Prisma generate failed (file lock / EPERM). Retry ${attempt}/${MAX_ATTEMPTS - 1} after ${DELAY_MS}ms…`,
      );
      await delay(DELAY_MS);
      continue;
    }

    if (isEperm && hasEngineBinary()) {
      console.warn(
        "[prebuild] Prisma generate could not replace the query engine (EPERM). " +
          "An existing @prisma/client engine was found — continuing the build. " +
          "Stop `pnpm dev` and run `pnpm run db:generate` if the schema changed.\n",
      );
      return;
    }

    if (combined.trim()) {
      console.error(combined);
    }
    console.error(
      "\n[prebuild] Prisma generate failed. Close processes using the Prisma engine, then retry. " +
        "To skip: SKIP_PRISMA_GENERATE=1 pnpm run build\n",
    );
    process.exit(result.status === null ? 1 : result.status);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
