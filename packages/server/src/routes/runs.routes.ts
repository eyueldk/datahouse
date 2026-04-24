import { Elysia, t } from "elysia";
import { findRun, paginateRuns } from "../services/run.service";

const RunResponse = t.Object({
  id: t.String(),
  type: t.Union([t.Literal("extract"), t.Literal("transform")]),
  status: t.Union([
    t.Literal("running"),
    t.Literal("completed"),
    t.Literal("failed"),
  ]),
  error: t.Nullable(t.String()),
  startedAt: t.Date(),
  completedAt: t.Nullable(t.Date()),
});

const ListRunsResponse = t.Object({
  items: t.Array(RunResponse),
  meta: t.Object({
    offset: t.Numeric(),
    limit: t.Numeric(),
    total: t.Numeric(),
  }),
});

const ListRunsQueryRequest = t.Object({
  type: t.Optional(t.Union([t.Literal("extract"), t.Literal("transform")])),
  limit: t.Optional(t.Numeric()),
  offset: t.Optional(t.Numeric()),
});

const RunParamsRequest = t.Object({
  id: t.String(),
});

const ErrorResponse = t.Object({
  error: t.String(),
});

export const runRoutes = new Elysia({ tags: ["Runs"] })
  .get(
    "/runs",
    async ({ query, status }) => {
      const limit = Math.max(1, query.limit ?? 50);
      const offset = Math.max(0, query.offset ?? 0);
      const result = await paginateRuns({
        type: query.type,
        limit,
        offset,
      });
      return status(200, {
        items: result.items,
        meta: { offset, limit, total: result.total },
      });
    },
    {
      query: ListRunsQueryRequest,
      response: {
        200: ListRunsResponse,
      },
    },
  )
  .get(
    "/runs/:id",
    async ({ params: { id }, status }) => {
      const run = await findRun({ id });
      if (!run) {
        return status(404, { error: `Run ${id} not found.` });
      }
      return status(200, run);
    },
    {
      params: RunParamsRequest,
      response: {
        200: RunResponse,
        404: ErrorResponse,
      },
    },
  );
