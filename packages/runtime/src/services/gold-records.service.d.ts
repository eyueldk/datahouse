export declare function saveGoldRecords({ runId, bronzeRecordId, transformerId, items, }: {
    runId: string;
    bronzeRecordId: string;
    transformerId: string;
    items: {
        collection: string;
        key: string;
        data: unknown;
    }[];
}): Promise<void>;
export declare function listGoldRecords(params?: {
    collection?: string;
}): Promise<{
    id: string;
    runId: string;
    bronzeRecordId: string;
    transformerId: string;
    collection: string;
    key: string;
    data: unknown;
    createdAt: Date;
}[]>;
export declare function paginateGoldRecords(params: {
    collection?: string;
    limit: number;
    offset: number;
}): Promise<{
    items: {
        id: string;
        runId: string;
        bronzeRecordId: string;
        transformerId: string;
        collection: string;
        key: string;
        data: unknown;
        createdAt: Date;
    }[];
    total: number;
}>;
