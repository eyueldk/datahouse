import { sources } from "../schemas/sources";
export declare function listSources(params?: {
    extractorId?: string;
}): Promise<{
    id: string;
    extractorId: string;
    key: string;
    config: unknown;
    cursor: unknown;
    createdAt: Date;
}[]>;
export declare function paginateSources(params: {
    extractorId?: string;
    limit: number;
    offset: number;
}): Promise<{
    items: {
        id: string;
        extractorId: string;
        key: string;
        config: unknown;
        cursor: unknown;
        createdAt: Date;
    }[];
    total: number;
}>;
export declare function findSource(params: {
    id: string;
} | {
    extractorId: string;
    key: string;
}): Promise<{
    id: string;
    extractorId: string;
    key: string;
    config: unknown;
    cursor: unknown;
    createdAt: Date;
}>;
export declare function updateSource({ sourceId, ...data }: {
    sourceId: string;
} & Partial<typeof sources.$inferInsert>): Promise<{
    id: string;
    extractorId: string;
    key: string;
    config: unknown;
    cursor: unknown;
    createdAt: Date;
}>;
export declare function createSource(data: typeof sources.$inferInsert): Promise<{
    id: string;
    extractorId: string;
    key: string;
    config: unknown;
    cursor: unknown;
    createdAt: Date;
}>;
export declare function deleteSource(id: string): Promise<void>;
