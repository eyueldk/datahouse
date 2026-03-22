import { mkdirSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";
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
      data: Blob | ArrayBuffer,
      opts?: FilesWriteOptions,
    ): Promise<void> {
      const path = getPath(key);
      mkdirSync(dirname(path), { recursive: true });
      const payload =
        opts?.mimeType != null && data instanceof ArrayBuffer
          ? new Blob([data], { type: opts.mimeType })
          : data;
      await Bun.write(path, payload);
    },

    async read(key: string): Promise<ArrayBuffer> {
      return await Bun.file(getPath(key)).arrayBuffer();
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
