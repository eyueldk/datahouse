import { Elysia } from "elysia";
export declare const recordRoutes: Elysia<"", {
    decorator: {};
    store: {};
    derive: {};
    resolve: {};
}, {
    typebox: {};
    error: {};
}, {
    schema: {};
    standaloneSchema: {};
    macro: {};
    macroFn: {};
    parser: {};
    response: {};
}, {
    records: {
        get: {
            body: unknown;
            params: {};
            query: {
                collection?: string | undefined;
                limit?: number | undefined;
                offset?: number | undefined;
            };
            headers: unknown;
            response: {
                200: {
                    meta: {
                        limit: number;
                        offset: number;
                        total: number;
                    };
                    items: {
                        id: string;
                        data: any;
                        key: string;
                        createdAt: Date;
                        runId: string;
                        bronzeRecordId: string;
                        transformerId: string;
                        collection: string;
                    }[];
                };
                422: {
                    type: "validation";
                    on: string;
                    summary?: string;
                    message?: string;
                    found?: unknown;
                    property?: string;
                    expected?: string;
                };
            };
        };
    };
}, {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
}, {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
}>;
