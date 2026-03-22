import { type FilesBackend } from "../lib/files-backend";
export interface FSBackendOptions {
    baseDir: string;
}
export declare function createFSBackend(options: FSBackendOptions): FilesBackend;
