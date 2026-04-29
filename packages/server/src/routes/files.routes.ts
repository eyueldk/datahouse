import { Elysia, t } from "elysia";
import {
  downloadFile,
  findUploadedFile,
  paginateFiles,
} from "../services/files.service";
import { attachmentContentDisposition } from "../utils/file.utils";

const FileListItemResponse = t.Object({
  id: t.String(),
  name: t.String(),
  mimeType: t.Union([t.String(), t.Null()]),
  size: t.Union([t.Numeric(), t.Null()]),
  checksum: t.String(),
  createdAt: t.Date(),
  references: t.Array(
    t.Object({
      id: t.String(),
      fileId: t.String(),
      kind: t.Union([t.Literal("datalake"), t.Literal("datawarehouse")]),
      recordId: t.String(),
      createdAt: t.Date(),
    }),
  ),
});

const ListFilesResponse = t.Object({
  items: t.Array(FileListItemResponse),
  meta: t.Object({
    offset: t.Numeric(),
    limit: t.Numeric(),
    total: t.Numeric(),
  }),
});

const ListFilesQueryRequest = t.Object({
  kind: t.Optional(t.Union([t.Literal("datalake"), t.Literal("datawarehouse")])),
  recordId: t.Optional(t.String()),
  limit: t.Optional(t.Numeric()),
  offset: t.Optional(t.Numeric()),
});

const FileIdParamsRequest = t.Object({
  id: t.String(),
});

export const filesRoutes = new Elysia({ tags: ["Files"] })
  .get(
    "/files",
    async ({ query, status }) => {
      const limit = Math.max(1, query.limit ?? 50);
      const offset = Math.max(0, query.offset ?? 0);
      const result = await paginateFiles({
        kind: query.kind,
        recordId: query.recordId,
        limit,
        offset,
      });
      return status(200, {
        items: result.items,
        meta: { offset, limit, total: result.total },
      });
    },
    {
      query: ListFilesQueryRequest,
      response: {
        200: ListFilesResponse,
      },
    },
  )
  .get(
    "/files/:id/download",
    async ({ params: { id }, status }) => {
      const file = await findUploadedFile({ id });
      if (!file) {
        return status(404, { error: "File not found" });
      }
      const content = await downloadFile({ id });
      if (!content) {
        return status(404, { error: "File not found" });
      }
      return new Response(new Uint8Array(content), {
        status: 200,
        headers: {
          "Content-Type": file.mimeType ?? "application/octet-stream",
          "Content-Length": String(content.byteLength),
          "Content-Disposition": attachmentContentDisposition({
            filename: file.name,
          }),
        },
      });
    },
    {
      params: FileIdParamsRequest,
    },
  );
