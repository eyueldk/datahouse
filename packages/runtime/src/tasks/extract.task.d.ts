export interface ExtractTaskData {
    sourceId: string;
}
export interface ExtractTaskResult {
    extracted: number;
}
export declare const extractTask: import("..").Task<ExtractTaskData, ExtractTaskResult>;
