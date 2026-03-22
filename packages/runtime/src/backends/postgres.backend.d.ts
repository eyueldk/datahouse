import { type DatabaseBackend } from "../lib/database-backend";
export interface PostgresBackendOptions {
    connection: string;
    migrationsFolder: string;
}
export declare function createPostgresBackend(options: PostgresBackendOptions): DatabaseBackend;
