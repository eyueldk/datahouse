import { Elysia } from "elysia";
export declare const routes: Elysia<"/api", {
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
    api: {
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
    };
} & {
    api: {
        sources: {
            get: {
                body: unknown;
                params: {};
                query: {
                    extractorId?: string | undefined;
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
                            schema: any;
                            extractorId: string;
                            key: string;
                            config: any;
                            cursor: any;
                            createdAt: Date;
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
        sources: {
            post: {
                body: {
                    config?: any;
                    extractorId: string;
                };
                params: {};
                query: unknown;
                headers: unknown;
                response: {
                    201: {
                        id: string;
                        schema: any;
                        extractorId: string;
                        key: string;
                        config: any;
                        cursor: any;
                        createdAt: Date;
                    };
                    400: {
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
    } & {
        sources: {
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
                            schema: any;
                            extractorId: string;
                            key: string;
                            config: any;
                            cursor: any;
                            createdAt: Date;
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
    } & {
        sources: {
            ":id": {
                patch: {
                    body: {
                        extractorId?: string | undefined;
                        key?: string | undefined;
                        config?: any;
                        cursor?: any;
                    };
                    params: {
                        id: string;
                    };
                    query: unknown;
                    headers: unknown;
                    response: {
                        200: {
                            id: string;
                            schema: any;
                            extractorId: string;
                            key: string;
                            config: any;
                            cursor: any;
                            createdAt: Date;
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
    } & {
        sources: {
            ":id": {
                delete: {
                    body: unknown;
                    params: {
                        id: string;
                    };
                    query: unknown;
                    headers: unknown;
                    response: {
                        204: string;
                        400: {
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
    } & {
        sources: {
            ":id": {
                trigger: {
                    post: {
                        body: unknown;
                        params: {
                            id: string;
                        };
                        query: unknown;
                        headers: unknown;
                        response: {
                            200: {
                                sourceId: string;
                                jobId: string;
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
        };
    };
} & {
    api: {
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
    };
} & {
    api: {
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
} & {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
}>;
