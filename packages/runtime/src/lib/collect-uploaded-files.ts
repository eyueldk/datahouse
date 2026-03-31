import { UploadedFile } from "@datahouse/core";
import traverse from "traverse";

/**
 * Walk arbitrary JSON-like `data` and collect every {@link UploadedFile}.
 * Deduplicated by `id` (later occurrences replace earlier).
 */
export function collectUploadedFiles(data: unknown): UploadedFile[] {
  if (data === null || data === undefined) {
    return [];
  }
  const byId = new Map<string, UploadedFile>();
  traverse(data).forEach((node) => {
    if (node instanceof UploadedFile) {
      byId.set(node.id, node);
    }
  });
  return [...byId.values()];
}
