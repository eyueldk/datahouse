import type { AnyPipeline } from "./pipeline";

/** Root config: keep `TPipelines` concrete (no default `= readonly AnyPipeline[]` on `Datahouse`). */
export interface Datahouse<TPipelines extends readonly AnyPipeline[]> {
  pipelines: TPipelines;
}

export type AnyDatahouse = Datahouse<readonly AnyPipeline[]>;

export function createDatahouse<const TPipelines extends readonly AnyPipeline[]>(
  datahouse: Datahouse<TPipelines>,
): Datahouse<TPipelines> {
  return datahouse;
}
