export interface DataHouse<TPipelines> {
    pipelines: TPipelines;
}
export declare function createDataHouse<TPipelines>(config: DataHouse<TPipelines>): DataHouse<TPipelines>;
