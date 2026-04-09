import type { AnyDatahouse } from "@datahousejs/core";
import { createClient } from "@datahousejs/client";

type StudioConfig = AnyDatahouse;

export const client = createClient<StudioConfig>({
  domain: import.meta.env.VITE_DATAHOUSE_DOMAIN ?? "http://localhost:2510",
});
