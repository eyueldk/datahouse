import { Elysia } from "elysia";
export declare const runRoutes: Elysia<"", {
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
    runs: {
        get: {
            body: unknown;
            params: {};
            query: {
                type?: "extract" | "transform" | undefined;
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
                        type: "extract" | "transform";
                        status: "running" | "completed" | "failed";
                        error: string | null;
                        startedAt: Date;
                        completedAt: Date | null;
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
} & {
    runs: {
        ":id": {
            get: {
                body: unknown;
                params: {
                    id: string;
                };
                query: unknown;
                headers: unknown;
                response: {
                    200: {
                        id: string;
                        type: "extract" | "transform";
                        status: "running" | "completed" | "failed";
                        error: string | null;
                        startedAt: Date;
                        completedAt: Date | null;
                    };
                    404: {
                        error: string;
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
