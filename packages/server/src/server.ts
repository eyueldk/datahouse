import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import logixlysia from "logixlysia";
import packagejson from "../package.json";
import { routes } from "./routes/index.routes";

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
