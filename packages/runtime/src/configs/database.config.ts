import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { createPgliteBackend } from "../backends/pglite.backend";
import { createPostgresBackend } from "../backends/postgres.backend";
import { DATA_DIR } from "./global.config";

const PGLITE_DATA_DIR = resolve(DATA_DIR, "pglite");

const envSchema = z.object({
  DATABASE_URL: z.preprocess(
    (v) =>
      v === undefined || v === null || (typeof v === "string" && v.trim() === "")
        ? undefined
        : v,
    z.string().trim().min(1).optional(),
  ),
});

const { DATABASE_URL } = envSchema.parse(process.env);
const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));

function resolveMigrationsFolder() {
  const candidates = [
    resolve(CURRENT_DIR, "..", "..", "migrations"),
    resolve(CURRENT_DIR, "..", "migrations"),
    resolve(CURRENT_DIR, "migrations"),
  ];

  try {
    const runtimePackageUrl = import.meta.resolve(
      "@datahouse/runtime/package.json",
    );
    const runtimePackageDir = dirname(fileURLToPath(runtimePackageUrl));
    candidates.push(resolve(runtimePackageDir, "migrations"));
  } catch {}

  for (const candidate of candidates) {
    if (existsSync(resolve(candidate, "meta", "_journal.json"))) {
      return candidate;
    }
  }

  throw new Error(
    `Could not locate runtime migrations folder. Checked: ${candidates.join(", ")}`,
  );
}

const migrationsFolder = resolveMigrationsFolder();

export const dbBackend =
  DATABASE_URL !== undefined
    ? createPostgresBackend({
        connection: DATABASE_URL,
        migrationsFolder,
      })
    : createPgliteBackend({
        dataDir: PGLITE_DATA_DIR,
        migrationsFolder,
      });
