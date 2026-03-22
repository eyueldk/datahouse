import { type SuperJSONResult } from "superjson";
/**
 * Custom Drizzle type that stores JSON in a jsonb column using SuperJSON
 * for serialization/deserialization (preserves Date, BigInt, Map, Set, UploadedFile, etc.).
 */
export declare const superjsonType: {
    (): import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
        name: "";
        dataType: "custom";
        columnType: "PgCustomColumn";
        data: unknown;
        driverParam: SuperJSONResult;
        enumValues: undefined;
    }>;
    <TConfig extends Record<string, any>>(fieldConfig?: TConfig | undefined): import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
        name: "";
        dataType: "custom";
        columnType: "PgCustomColumn";
        data: unknown;
        driverParam: SuperJSONResult;
        enumValues: undefined;
    }>;
    <TName extends string>(dbName: TName, fieldConfig?: unknown): import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
        name: TName;
        dataType: "custom";
        columnType: "PgCustomColumn";
        data: unknown;
        driverParam: SuperJSONResult;
        enumValues: undefined;
    }>;
};
