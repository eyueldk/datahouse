export declare function uploadFile(params: {
    content: File | Blob | ArrayBuffer;
    name?: string;
    mimeType?: string;
}): Promise<{
    id: string;
    name: string;
    key: string;
    createdAt: Date;
    mimeType: string | null;
    size: number | null;
    checksum: string;
}>;
export declare function downloadFile(params: {
    id: string;
}): Promise<{
    record: {
        id: string;
        key: string;
        name: string;
        mimeType: string | null;
        size: number | null;
        checksum: string;
        createdAt: Date;
    };
    content: ArrayBuffer;
}>;
export declare function deleteFile(params: {
    id: string;
}): Promise<void>;
