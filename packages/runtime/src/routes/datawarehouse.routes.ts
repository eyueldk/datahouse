import { Elysia, t } from "elysia";
import {
  listDatawarehouseCollectionIds,
  paginateDatawarehouseRecords,
  paginateDatawarehouseTombstones,
} from "../services/datawarehouse.service";

const TombstoneEntryResponse = t.Object({
  key: t.String(),
  deletedAt: t.Date(),
});

const OffsetPaginationMetaResponse = t.Object({
  offset: t.Numeric(),
  limit: t.Numeric(),
  total: t.Numeric(),
});

const ListTombstonesResponse = t.Object({
  items: t.Array(TombstoneEntryResponse),
  meta: OffsetPaginationMetaResponse,
});

const ListTombstonesRequest = t.Object({
  collection: t.String(),
  since: t.Optional(t.Nullable(t.Date())),
  limit: t.Optional(t.Numeric()),
  offset: t.Optional(t.Numeric()),
});

const RecordResponse = t.Object({
  id: t.String(),
  runId: t.String(),
  datalakeId: t.String(),
  transformerId: t.String(),
  collection: t.String(),
  key: t.String(),
  data: t.Any(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

const ListRecordsPostResponse = t.Object({
  items: t.Array(RecordResponse),
  meta: OffsetPaginationMetaResponse,
});

const ListRecordsPostRequest = t.Object({
  collection: t.String(),
  since: t.Optional(t.Nullable(t.Date())),
  limit: t.Optional(t.Numeric()),
  offset: t.Optional(t.Numeric()),
});

const ListCollectionsResponse = t.Object({
  items: t.Array(t.String()),
});

export const datawarehouseRoutes = new Elysia()
  .get(
    "/datawarehouse/collections",
    async ({ status }) => {
      const items = await listDatawarehouseCollectionIds();
      return status(200, { items });
    },
    {
      response: { 200: ListCollectionsResponse },
    },
  )
  .post(
    "/datawarehouse/tombstones",
    async ({ body, status }) => {
      const limit = body.limit !== undefined ? Number(body.limit) : 50;
      const offset = body.offset !== undefined ? Number(body.offset) : 0;
      const result = await paginateDatawarehouseTombstones({
        collection: body.collection,
        since: body.since ?? undefined,
        limit,
        offset,
      });
      return status(200, {
        items: result.items,
        meta: {
          offset: result.meta.offset,
          limit: result.meta.limit,
          total: result.meta.total,
        },
      });
    },
    {
      body: ListTombstonesRequest,
      response: { 200: ListTombstonesResponse },
    },
  )
  .post(
    "/datawarehouse/records",
    async ({ body, status }) => {
      const limit = body.limit !== undefined ? Number(body.limit) : 50;
      const offset = body.offset !== undefined ? Number(body.offset) : 0;
      const result = await paginateDatawarehouseRecords({
        collection: body.collection,
        since: body.since ?? undefined,
        limit,
        offset,
      });
      return status(200, {
        items: result.items,
        meta: {
          offset: result.meta.offset,
          limit: result.meta.limit,
          total: result.meta.total,
        },
      });
    },
    {
      body: ListRecordsPostRequest,
      response: { 200: ListRecordsPostResponse },
    },
  );
