export interface FilesWriteOptions {
    mimeType?: string;
}
export type FilesBackend = {
    write(key: string, data: Blob | ArrayBuffer, options?: FilesWriteOptions): Promise<void>;
    read(key: string): Promise<ArrayBuffer>;
    delete(key: string): Promise<void>;
};
export declare function createFilesBackend<TImpl extends FilesBackend>(impl: TImpl): TImpl;
