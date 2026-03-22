import type { DataHouse } from "@datahouse/core";
import { createClient } from "@datahouse/client";

type StudioConfig = DataHouse<unknown>;

export const client = createClient<StudioConfig>({
  domain: import.meta.env.VITE_DATAHOUSE_DOMAIN ?? "http://localhost:2510",
});
