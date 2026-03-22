import type { DataHouse } from "@datahouse/core";
import { createTreatyClient } from "./internal/treaty";
import { createExtractorsApi } from "./apis/extractors";
import { createRecordsApi } from "./apis/records";
import { createRunsApi } from "./apis/runs";
import { createSourcesApi } from "./apis/sources";

export { createExtractorsApi } from "./apis/extractors";
export { createRecordsApi } from "./apis/records";
export { createRunsApi } from "./apis/runs";
export { createSourcesApi } from "./apis/sources";

export function createClient<TConfig extends DataHouse<unknown>>(params: {
  domain: string;
}) {
  const client = createTreatyClient({ domain: params.domain });

  return {
    extractors: createExtractorsApi({ client }),
    runs: createRunsApi({ client }),
    sources: createSourcesApi({ client }),
    records: createRecordsApi<TConfig>({ client }),
  };
}

export type DatahouseClient<TConfig extends DataHouse<unknown>> = ReturnType<
  typeof createClient<TConfig>
>;

export type * from "./types";
