import { listSources } from "./source.service";
export declare function setupExtractCronJob(params: {
    source: Awaited<ReturnType<typeof listSources>>[number];
}): Promise<void>;
export declare function setupExtractCronJobs(): Promise<void>;
