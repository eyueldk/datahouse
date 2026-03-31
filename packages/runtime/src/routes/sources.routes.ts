import { Elysia, t } from "elysia";
import { config } from "../configs/core.config";
import { extractQueue } from "../queues";
import { setupExtractCronJob } from "../services/queues.service";
import { createRun } from "../services/run.service";
import {
  createSource,
  deleteSource,
  findSource,
  paginateSources,
  updateSource,
} from "../services/source.service";

const SourceResponse = t.Object({
  id: t.String(),
  extractorId: t.String(),
  key: t.String(),
  config: t.Any(),
  cursor: t.Any(),
  schema: t.Any(),
  createdAt: t.Date(),
});

const ListSourcesResponse = t.Object({
  items: t.Array(SourceResponse),
  meta: t.Object({
    offset: t.Numeric(),
    limit: t.Numeric(),
    total: t.Numeric(),
  }),
});

const ListSourcesQueryRequest = t.Object({
  extractorId: t.Optional(t.String()),
  limit: t.Optional(t.Numeric()),
  offset: t.Optional(t.Numeric()),
});

const CreateSourceBodyRequest = t.Object({
  extractorId: t.String(),
  config: t.Optional(t.Any()),
});

const UpdateSourceBodyRequest = t.Object({
  extractorId: t.Optional(t.String()),
  key: t.Optional(t.String()),
  config: t.Optional(t.Any()),
  cursor: t.Optional(t.Any()),
});

const SourceParamsRequest = t.Object({
  id: t.String(),
});

const ExtractSourceResponse = t.Object({
  sourceId: t.String(),
  jobId: t.String(),
});

const ErrorResponse = t.Object({
  error: t.String(),
});

function getExtractorSchema(extractorId: string): unknown {
  const pipeline = config.pipelines.find(
    (item) => item.extractor.id === extractorId,
  );
  return pipeline?.extractor.config.schema.toJSONSchema() ?? {};
}

function withExtractorSchema<
  TSource extends {
    extractorId: string;
  },
>(source: TSource) {
  return {
    ...source,
    schema: getExtractorSchema(source.extractorId),
  };
}

export const sourceRoutes = new Elysia()
  .get(
    "/sources",
    async ({ query, status }) => {
      const limit = Math.max(1, query.limit ?? 50);
      const offset = Math.max(0, query.offset ?? 0);
      const result = await paginateSources({
        extractorId: query.extractorId,
        limit,
        offset,
      });
      return status(200, {
        items: result.items.map(withExtractorSchema),
        meta: { offset, limit, total: result.total },
      });
    },
    {
      query: ListSourcesQueryRequest,
      response: {
        200: ListSourcesResponse,
      },
    },
  )
  .post(
    "/sources",
    async ({ body, status }) => {
      try {
        const pipeline = config.pipelines.find(
          (p) => p.extractor.id === body.extractorId,
        );
        if (!pipeline) {
          return status(400, {
            error: `Extractor ${body.extractorId} not found`,
          });
        }

        const extractorInput =
          await pipeline.extractor.config.schema.parseAsync(body.config);
        const sourceDefinition =
          await pipeline.extractor.config.create(extractorInput);
        const source = await createSource({
          extractorId: body.extractorId,
          key: sourceDefinition.key,
          config: sourceDefinition.config,
        });
        if (!source) {
          return status(400, { error: "Failed to create source" });
        }
        await setupExtractCronJob({ source });
        return status(201, withExtractorSchema(source));
      } catch (err) {
        return status(400, { error: String(err) });
      }
    },
    {
      body: CreateSourceBodyRequest,
      response: {
        201: SourceResponse,
        400: ErrorResponse,
      },
    },
  )
  .get(
    "/sources/:id",
    async ({ params: { id }, status }) => {
      try {
        const source = await findSource({ id });
        return status(200, withExtractorSchema(source));
      } catch {
        return status(404, { error: `Source ${id} not found.` });
      }
    },
    {
      params: SourceParamsRequest,
      response: {
        200: SourceResponse,
        404: ErrorResponse,
      },
    },
  )
  .patch(
    "/sources/:id",
    async ({ params: { id }, body, status }) => {
      const source = await updateSource({ sourceId: id, ...body });
      if (!source) {
        return status(404, { error: `Source ${id} not found.` });
      }
      return status(200, withExtractorSchema(source));
    },
    {
      params: SourceParamsRequest,
      body: UpdateSourceBodyRequest,
      response: {
        200: SourceResponse,
        404: ErrorResponse,
      },
    },
  )
  .delete(
    "/sources/:id",
    async ({ params: { id }, status }) => {
      try {
        await deleteSource(id);
        return status(204, "");
      } catch (err) {
        return status(400, { error: String(err) });
      }
    },
    {
      params: SourceParamsRequest,
      response: {
        204: t.String(),
        400: ErrorResponse,
      },
    },
  )
  .post(
    "/sources/:id/extract",
    async ({ params: { id }, status }) => {
      try {
        const source = await findSource({ id });
        const run = await createRun({ type: "extract" });
        await extractQueue.enqueue({
          data: { sourceId: source.id, runId: run.id },
        });
        return status(200, {
          sourceId: source.id,
          jobId: run.id,
        });
      } catch {
        return status(404, { error: `Source ${id} not found.` });
      }
    },
    {
      params: SourceParamsRequest,
      response: {
        200: ExtractSourceResponse,
        404: ErrorResponse,
      },
    },
  );
