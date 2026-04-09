import { customType } from "drizzle-orm/pg-core";
import superjson, { type SuperJSONResult } from "superjson";
import { UploadedFile } from "@datahousejs/core";

superjson.registerClass(UploadedFile);

/**
 * Custom Drizzle type that stores JSON in a jsonb column using SuperJSON
 * for serialization/deserialization (preserves Date, BigInt, Map, Set, UploadedFile, etc.).
 */
export const superjsonb = customType<{
  data: unknown;
  driverData: SuperJSONResult;
}>({
  dataType() {
    return "jsonb";
  },
  toDriver(value) {
    return superjson.serialize(value);
  },
  fromDriver(value) {
    return superjson.deserialize(value);
  },
});
