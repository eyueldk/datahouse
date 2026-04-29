import { Elysia, t } from "elysia";
import {
  deleteDatalakeRecord,
  paginateDatalakeRecords,
} from "../services/datalake.service";
import { enqueueTransformations } from "../services/transform-enqueue.service";

const RecordResponse = t.Object({
  id: t.String(),
  runId: t.String(),
  sourceId: t.String(),
  extractorId: t.String(),
  key: t.String(),
  data: t.Any(),
  metadata: t.Any(),
  createdAt: t.Date(),
});

const ListRecordsResponse = t.Object({
  items: t.Array(RecordResponse),
  meta: t.Object({
    offset: t.Numeric(),
    limit: t.Numeric(),
    total: t.Numeric(),
  }),
});

const ListRecordsQueryRequest = t.Object({
  extractorId: t.Optional(t.String()),
  sourceId: t.Optional(t.String()),
  since: t.Optional(t.Date()),
  limit: t.Optional(t.Numeric()),
  offset: t.Optional(t.Numeric()),
});

const DatalakeIdParamsRequest = t.Object({
  id: t.String(),
});

const DeleteSuccessResponse = t.Object({
  success: t.Literal(true),
});

const DatalakeTransformBodyRequest = t.Object({
  transformerIds: t.Optional(t.Array(t.String())),
});

const TriggerTransformsResponse = t.Object({
  jobId: t.String(),
  enqueued: t.Numeric(),
  runIds: t.Array(t.String()),
});

export const datalakeRoutes = new Elysia({ tags: ["Datalake"] })
  .get(
    "/datalake-records",
    async ({ query, status }) => {
      const limit = Math.max(1, query.limit ?? 50);
      const offset = Math.max(0, query.offset ?? 0);
      const result = await paginateDatalakeRecords({
        extractorId: query.extractorId,
        sourceId: query.sourceId,
        since: query.since,
        limit,
        offset,
      });
      return status(200, {
        items: result.items,
        meta: { offset, limit, total: result.total },
      });
    },
    {
      query: ListRecordsQueryRequest,
      response: {
        200: ListRecordsResponse,
      },
    },
  )
  .delete(
    "/datalake-records/:id",
    async ({ params: { id }, status }) => {
      await deleteDatalakeRecord({ id });
      return status(200, { success: true });
    },
    {
      params: DatalakeIdParamsRequest,
      response: {
        200: DeleteSuccessResponse,
      },
    },
  )
  .post(
    "/datalake-records/:id/transform",
    async ({ params: { id }, body, status }) => {
      const result = await enqueueTransformations({
        datalakeRecordId: id,
        transformerIds: body?.transformerIds,
      });
      return status(200, {
        jobId: result.runIds[0] ?? "",
        enqueued: result.enqueued,
        runIds: result.runIds,
      });
    },
    {
      params: DatalakeIdParamsRequest,
      body: DatalakeTransformBodyRequest,
      response: {
        200: TriggerTransformsResponse,
      },
    },
  );
