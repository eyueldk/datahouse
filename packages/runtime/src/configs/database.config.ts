import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { createPgliteBackend } from "../backends/pglite.backend";
import { createPostgresBackend } from "../backends/postgres.backend";
import { DATA_DIR } from "./global.config";

const PGLITE_DATA_DIR = resolve(DATA_DIR, "pglite");

const envSchema = z.object({
  DATABASE_URL: z.string().trim().min(1).optional(),
});

const { DATABASE_URL } = envSchema.parse(process.env);
const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));

const migrationsFolder = resolve(CURRENT_DIR, "./migrations");

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
