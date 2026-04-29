import { Elysia } from "elysia";
import { datalakeRoutes } from "./datalake.routes";
import { datawarehouseRoutes } from "./datawarehouse.routes";
import { filesRoutes } from "./files.routes";
import { extractorRoutes } from "./extractors.routes";
import { runRoutes } from "./runs.routes";
import { sourceRoutes } from "./sources.routes";
import { transformerRoutes } from "./transformers.routes";
import { versionRoutes } from "./version.routes";

export const routes = new Elysia({ prefix: "/api" })
  .use(versionRoutes)
  .use(extractorRoutes)
  .use(sourceRoutes)
  .use(datalakeRoutes)
  .use(datawarehouseRoutes)
  .use(filesRoutes)
  .use(transformerRoutes)
  .use(runRoutes);
