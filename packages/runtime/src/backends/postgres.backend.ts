import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import {
  createDatabaseBackend,
  type DatabaseBackend,
} from "../lib/database-backend";
import * as schema from "../schemas";

export interface PostgresBackendOptions {
  connection: string;
  migrationsFolder: string;
}

export function createPostgresBackend(
  options: PostgresBackendOptions,
): DatabaseBackend {
  const db = drizzle(options.connection, { schema });
  return createDatabaseBackend({
    db,
    migrate: async () => await migrate(db, { migrationsFolder: options.migrationsFolder }),
  });
}
