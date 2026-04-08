export interface FilesWriteOptions {
  mimeType?: string;
}

export type FilesBackend = {
  write(
    key: string,
    data: Blob | Buffer,
    options?: FilesWriteOptions,
  ): Promise<void>;
  read(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
};

export function createFilesBackend<TImpl extends FilesBackend>(
  impl: TImpl,
): TImpl {
  return impl;
}
