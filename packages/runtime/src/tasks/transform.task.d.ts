export interface TransformTaskData {
    transformerId: string;
    bronzeRecordId: string;
}
export interface TransformTaskResult {
    transformed: number;
}
export declare const transformTask: import("..").Task<TransformTaskData, TransformTaskResult>;
