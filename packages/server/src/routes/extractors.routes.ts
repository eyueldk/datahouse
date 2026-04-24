import { Elysia, t } from "elysia";
import { datahouse } from "../configs/core.config";

const ExtractorResponse = t.Object({
  id: t.String(),
  cron: t.Optional(t.String()),
  schema: t.Any(),
});

const PaginationMetaResponse = t.Object({
  offset: t.Numeric(),
  limit: t.Numeric(),
  total: t.Numeric(),
});

const ListExtractorsResponse = t.Object({
  items: t.Array(ExtractorResponse),
  meta: PaginationMetaResponse,
});

const ListExtractorsQueryRequest = t.Object({
  limit: t.Optional(t.Numeric()),
  offset: t.Optional(t.Numeric()),
});

export const extractorRoutes = new Elysia({ tags: ["Extractors"] }).get(
  "/extractors",
  ({ query, status }) => {
    const limit = Math.max(1, query.limit ?? 50);
    const offset = Math.max(0, query.offset ?? 0);

    const extractorsMap = new Map();
    for (const pipeline of datahouse.pipelines) {
      if (!extractorsMap.has(pipeline.extractor.id)) {
        extractorsMap.set(pipeline.extractor.id, {
          id: pipeline.extractor.id,
          cron: pipeline.extractor.cron,
          schema: pipeline.extractor.config.schema.toJSONSchema(),
        });
      }
    }

    const extractors = Array.from(extractorsMap.values());
    const total = extractors.length;

    return status(200, {
      items: extractors.slice(offset, offset + limit),
      meta: { offset, limit, total },
    });
  },
  {
    query: ListExtractorsQueryRequest,
    response: {
      200: ListExtractorsResponse,
    },
  },
);
