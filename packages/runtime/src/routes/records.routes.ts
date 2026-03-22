import { Elysia, t } from "elysia";
import { paginateGoldRecords } from "../services/gold-records.service";

const RecordResponse = t.Object({
  id: t.String(),
  runId: t.String(),
  bronzeRecordId: t.String(),
  transformerId: t.String(),
  collection: t.String(),
  key: t.String(),
  data: t.Any(),
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
  collection: t.Optional(t.String()),
  limit: t.Optional(t.Numeric()),
  offset: t.Optional(t.Numeric()),
});

export const recordRoutes = new Elysia().get(
  "/records",
  async ({ query, status }) => {
    const limit = Math.max(1, query.limit ?? 50);
    const offset = Math.max(0, query.offset ?? 0);
    const result = await paginateGoldRecords({
      collection: query.collection,
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
);
