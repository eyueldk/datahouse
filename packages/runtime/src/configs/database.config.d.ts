export declare const dbBackend: Readonly<{
    db: import("../lib/database-backend").Db;
    migrate: () => Promise<void>;
}>;
