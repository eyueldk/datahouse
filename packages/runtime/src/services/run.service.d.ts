import { type RunType } from "../schemas/runs";
export declare function createRun({ type }: {
    type: RunType;
}): Promise<{
    id: string;
    type: RunType;
    status: import("../schemas").RunStatus;
    error: string | null;
    startedAt: Date;
    completedAt: Date | null;
}>;
export declare function completeRun({ runId }: {
    runId: string;
}): Promise<void>;
export declare function failRun({ runId, error, }: {
    runId: string;
    error: string;
}): Promise<void>;
export declare function listRuns(params?: {
    type?: RunType;
}): Promise<{
    id: string;
    type: RunType;
    status: import("../schemas").RunStatus;
    error: string | null;
    startedAt: Date;
    completedAt: Date | null;
}[]>;
export declare function paginateRuns(params: {
    type?: RunType;
    limit: number;
    offset: number;
}): Promise<{
    items: {
        id: string;
        type: RunType;
        status: import("../schemas").RunStatus;
        error: string | null;
        startedAt: Date;
        completedAt: Date | null;
    }[];
    total: number;
}>;
export declare function findRun(params: {
    id: string;
}): Promise<{
    id: string;
    type: RunType;
    status: import("../schemas").RunStatus;
    error: string | null;
    startedAt: Date;
    completedAt: Date | null;
}>;
