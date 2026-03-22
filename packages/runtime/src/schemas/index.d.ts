export { sources } from "./sources";
export { runs, type RunType, type RunStatus } from "./runs";
export { bronzeRecords } from "./bronze-records";
export { goldRecords } from "./gold-records";
export { files } from "./files";
export declare const sourcesRelations: import("drizzle-orm").Relations<"sources", {
    bronzeRecords: import("drizzle-orm").Many<"bronze_records">;
}>;
export declare const bronzeRecordsRelations: import("drizzle-orm").Relations<"bronze_records", {
    run: import("drizzle-orm").One<"runs", true>;
    source: import("drizzle-orm").One<"sources", true>;
    goldRecords: import("drizzle-orm").Many<"gold_records">;
}>;
export declare const runsRelations: import("drizzle-orm").Relations<"runs", {
    bronzeRecords: import("drizzle-orm").Many<"bronze_records">;
    goldRecords: import("drizzle-orm").Many<"gold_records">;
}>;
export declare const goldRecordsRelations: import("drizzle-orm").Relations<"gold_records", {
    run: import("drizzle-orm").One<"runs", true>;
    bronzeRecord: import("drizzle-orm").One<"bronze_records", true>;
}>;
