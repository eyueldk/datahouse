import { mkdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import {
  createDatabaseBackend,
  type DatabaseBackend,
} from "../lib/database-backend";
import * as schema from "../schemas";

export interface PgliteBackendOptions {
  /** Directory on disk where PGlite stores its data (e.g. `DATA_DIR/pglite`). */
  dataDir: string;
  migrationsFolder: string;
}

/**
 * Embedded PostgreSQL via [PGlite](https://github.com/electric-sql/pglite), persisted under {@link PgliteBackendOptions.dataDir}.
 */
export function createPgliteBackend(
  options: PgliteBackendOptions,
): DatabaseBackend {
  mkdirSync(options.dataDir, { recursive: true });
  const client = new PGlite(options.dataDir);
  const db = drizzle(client, { schema });
  return createDatabaseBackend({
    db,
    migrate: async () => {
      await client.waitReady;
      await migrate(db, { migrationsFolder: options.migrationsFolder });
    },
  });
}
