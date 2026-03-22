import { Elysia } from "elysia";
export declare const extractorRoutes: Elysia<"", {
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
    extractors: {
        get: {
            body: unknown;
            params: {};
            query: {
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
                        cron?: string | undefined;
                        id: string;
                        schema: any;
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
