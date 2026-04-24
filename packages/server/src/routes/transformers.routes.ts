import { Elysia, t } from "elysia";
import { datahouse } from "../configs/core.config";

const TransformerItemResponse = t.Object({
  id: t.String(),
});

const ListTransformersResponse = t.Object({
  items: t.Array(TransformerItemResponse),
});

const ListTransformersQueryRequest = t.Object({
  extractorId: t.Optional(t.String()),
});

export const transformerRoutes = new Elysia({ tags: ["Transformers"] }).get(
  "/transformers",
  ({ query, status }) => {
    let pipelines = datahouse.pipelines;
    if (query.extractorId) {
      pipelines = pipelines.filter(
        (p) => p.extractor.id === query.extractorId,
      );
    }
    const seen = new Set<string>();
    const items: { id: string }[] = [];
    for (const p of pipelines) {
      const tid = p.transformer.id;
      if (!seen.has(tid)) {
        seen.add(tid);
        items.push({ id: tid });
      }
    }
    return status(200, { items });
  },
  {
    query: ListTransformersQueryRequest,
    response: {
      200: ListTransformersResponse,
    },
  },
);
