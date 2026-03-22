import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import logixlysia from "logixlysia";
import { configure } from "./configs/core.config";
import { dbBackend } from "./configs/database.config";
import { setupExtractCronJobs } from "./services/tasks.service";
import { routes } from "./routes/index.routes";
import packagejson from "../package.json";

/**
 * DataHouse Elysia server. Use startServer() to run with config, migrations, and jobs.
 */
export const server = new Elysia()
  .use(cors())
  .use(logixlysia())
  .use(
    swagger({
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
  /** Path to the DataHouse config module. */
  configPath: string;
}

/**
 * Loads config, runs migrations, starts cron jobs, and listens.
 */
export async function startServer(options: StartServerOptions): Promise<void> {
  const { port = DEFAULT_SERVER_PORT, configPath } = options;

  await configure({ configPath });
  await dbBackend.migrate();
  await setupExtractCronJobs();

  server.listen(port);
  console.log(
    `Server running at ${server.server?.hostname ?? "localhost"}:${server.server?.port ?? port}`,
  );
}
