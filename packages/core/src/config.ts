export interface DataHouse<TPipelines> {
  pipelines: TPipelines;
}

export function createDataHouse<TPipelines>(
  config: DataHouse<TPipelines>,
): DataHouse<TPipelines> {
  return config;
}
