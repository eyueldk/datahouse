import { mkdirSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { resolve } from "node:path";
import {
  createFilesBackend,
  type FilesBackend,
  type FilesWriteOptions,
} from "../lib/files-backend";

export interface FSBackendOptions {
  baseDir: string;
}

export function createFSBackend(options: FSBackendOptions): FilesBackend {
  mkdirSync(options.baseDir, { recursive: true });

  function getPath(key: string): string {
    const path = resolve(options.baseDir, key);
    const baseDir = resolve(options.baseDir);
    if (!path.startsWith(baseDir)) {
      throw new Error(`Invalid storage key path: ${key}`);
    }
    return path;
  }

  return createFilesBackend({
    async write(
      key: string,
      data: Blob | Buffer,
      _opts?: FilesWriteOptions,
    ): Promise<void> {
      const path = getPath(key);
      await Bun.write(path, data);
    },

    async read(key: string): Promise<Buffer> {
      return Buffer.from(await Bun.file(getPath(key)).arrayBuffer());
    },

    async delete(key: string): Promise<void> {
      try {
        await unlink(getPath(key));
      } catch (error) {
        if (
          error instanceof Error &&
          "code" in error &&
          error.code === "ENOENT"
        ) {
          return;
        }
        throw error;
      }
    },
  });
}
