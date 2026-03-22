export declare class UploadedFile {
    id: string;
    name: string;
    mimeType?: string | null;
    size?: number | null;
    createdAt: Date;
    constructor(params: {
        id: string;
        name: string;
        mimeType?: string | null;
        size?: number | null;
        createdAt: Date | string;
    });
}
