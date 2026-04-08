import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import type * as appSchema from "../schemas";

export type AppSchema = typeof appSchema;
export type Db = NodePgDatabase<AppSchema> | PgliteDatabase<AppSchema>;

export type DatabaseBackend = Readonly<{
  db: Db;
  migrate: () => Promise<void>;
}>;

export function createDatabaseBackend(
  params: DatabaseBackend,
): DatabaseBackend {
  return {
    db: params.db,
    migrate: params.migrate,
  };
}
