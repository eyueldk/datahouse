import { Elysia } from "elysia";
import { datalakeRoutes } from "./datalake.routes";
import { datawarehouseRoutes } from "./datawarehouse.routes";
import { extractorRoutes } from "./extractors.routes";
import { runRoutes } from "./runs.routes";
import { sourceRoutes } from "./sources.routes";
import { transformerRoutes } from "./transformers.routes";

export const routes = new Elysia({ prefix: "/api" })
  .use(extractorRoutes)
  .use(sourceRoutes)
  .use(datalakeRoutes)
  .use(datawarehouseRoutes)
  .use(transformerRoutes)
  .use(runRoutes);
