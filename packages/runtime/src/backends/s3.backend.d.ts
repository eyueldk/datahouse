import { type FilesBackend } from "../lib/files-backend";
export interface S3BackendOptions {
    endpoint: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
}
export declare function createS3Backend(options: S3BackendOptions): FilesBackend;
