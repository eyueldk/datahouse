export declare function findBronzeRecord(params: {
    id: string;
}): Promise<{
    id: string;
    runId: string;
    sourceId: string;
    key: string;
    data: unknown;
    createdAt: Date;
}>;
export declare function saveBronzeRecords({ runId, sourceId, items, }: {
    runId: string;
    sourceId: string;
    items: {
        key: string;
        data: unknown;
    }[];
}): Promise<{
    id: string;
}[]>;
