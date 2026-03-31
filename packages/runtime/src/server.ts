import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import logixlysia from "logixlysia";
import { configure } from "./configs/core.config";
import { dbBackend } from "./configs/database.config";
import { setupCronJobs } from "./services/queues.service";
import { routes } from "./routes/index.routes";
import packagejson from "../package.json";

/**
 * Datahouse Elysia server. Use startServer() to run with config, migrations, and jobs.
 */
export const server = new Elysia()
  .use(cors())
  .use(logixlysia())
  .use(
    openapi({
      documentation: {
        info: {
          title: packagejson.name,
          version: packagejson.version,
          description: packagejson.description,
        },
      },
    }),
  )
  .use(routes);

export type Server = typeof server;

/** Default HTTP port for `datahouse serve` and `startServer()` when `port` is omitted. */
export const DEFAULT_SERVER_PORT = 2510;

export interface StartServerOptions {
  /** Port to listen on. Defaults to {@link DEFAULT_SERVER_PORT}. */
  port?: number;
  /** Path to the Datahouse config module. */
  configPath: string;
}

/**
 * Loads config, runs migrations, starts cron jobs, and listens.
 */
export async function startServer(options: StartServerOptions): Promise<void> {
  const { port = DEFAULT_SERVER_PORT, configPath } = options;

  await configure({ configPath });
  await dbBackend.migrate();
  await setupCronJobs();

  server.listen(port);
  console.log(
    `Server running at ${server.server?.hostname ?? "localhost"}:${server.server?.port ?? port}`,
  );
}
