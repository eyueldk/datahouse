import { type DatabaseBackend } from "../lib/database-backend";
export interface PgliteBackendOptions {
    /** Directory on disk where PGlite stores its data (e.g. `DATA_DIR/pglite`). */
    dataDir: string;
    migrationsFolder: string;
}
/**
 * Embedded PostgreSQL via [PGlite](https://github.com/electric-sql/pglite), persisted under {@link PgliteBackendOptions.dataDir}.
 */
export declare function createPgliteBackend(options: PgliteBackendOptions): DatabaseBackend;
