import { UploadedFile } from "@datahousejs/core";
import traverse from "traverse";

function uploadedFilesById(data: unknown): Map<string, UploadedFile> {
  const byId = new Map<string, UploadedFile>();
  if (data === null || data === undefined) {
    return byId;
  }
  traverse(data).forEach(function (node: unknown) {
    if (node instanceof UploadedFile) {
      byId.set(node.id, node);
    }
  });
  return byId;
}

export function diffUploadedFiles(params: {
  initialData: unknown;
  finalData: unknown;
}): { added: UploadedFile[]; removed: UploadedFile[] } {
  const initialFilesById = uploadedFilesById(params.initialData);
  const finalFilesById = uploadedFilesById(params.finalData);

  return {
    added: [...finalFilesById]
      .filter(([id]) => !initialFilesById.has(id))
      .map(([, file]) => file),
    removed: [...initialFilesById]
      .filter(([id]) => !finalFilesById.has(id))
      .map(([, file]) => file),
  };
}
