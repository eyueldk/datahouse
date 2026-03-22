import { Elysia } from "elysia";
import { extractorRoutes } from "./extractors.routes";
import { recordRoutes } from "./records.routes";
import { runRoutes } from "./runs.routes";
import { sourceRoutes } from "./sources.routes";

export const routes = new Elysia({ prefix: "/api" })
  .use(extractorRoutes)
  .use(sourceRoutes)
  .use(recordRoutes)
  .use(runRoutes);
