import { S3Client } from "bun";
import {
  createFilesBackend,
  type FilesBackend,
  type FilesWriteOptions,
} from "../lib/files-backend";

export interface S3BackendOptions {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

export function createS3Backend(options: S3BackendOptions): FilesBackend {
  const client = new S3Client({
    endpoint: options.endpoint,
    accessKeyId: options.accessKeyId,
    secretAccessKey: options.secretAccessKey,
    bucket: options.bucket,
  });

  return createFilesBackend({
    async write(
      key: string,
      data: Blob | Buffer,
      opts?: FilesWriteOptions,
    ): Promise<void> {
      await client.file(key).write(data, {
        type: opts?.mimeType ?? "application/octet-stream",
      });
    },

    async read(key: string): Promise<Buffer> {
      return Buffer.from(await client.file(key).arrayBuffer());
    },

    async delete(key: string): Promise<void> {
      await client.file(key).delete();
    },
  });
}
