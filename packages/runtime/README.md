# @datahouse/runtime

Library that runs the DataHouse server: Elysia app, config loading, migrations, and cron-backed extract/transform jobs.

## Usage

```ts
import { startServer } from "@datahouse/runtime";

await startServer({ port: 2510, configPath: "./datahouse.config.ts" });
```

- **`startServer(options)`** — Loads config, runs migrations, starts cron jobs, and listens. Options: `port` (default **`2510`** via `DEFAULT_SERVER_PORT`), `configPath` (required path to config module).
- **`server`** — The Elysia instance (e.g. to attach routes).
- **`Server`** — Type: `typeof server`.
- **`StartServerOptions`** — Type for `startServer` options.

## Environment

- **`DATABASE_URL`** (optional) — Postgres connection string. If unset, the server uses PGlite with data in `.datahouse/pglite`.
- **`REDIS_HOST`** (optional) — Default `localhost`. Used by BullMQ for job queues.
- **`REDIS_PORT`** (optional) — Default `6379`.
- **`S3_*`** (optional) — S3-compatible storage (e.g. MinIO). Defaults point to `http://localhost:9000` and bucket `datahouse`.

See `.env.example` for a full list.

## Config

Config is a module default-exporting a `DataHouseConfig` (from `@datahouse/core`). Pass `configPath` to `startServer`; the CLI (e.g. `datahouse serve [file]`) provides default lookup when no file is given.

## Database (Drizzle)

- **Migrations** live in the package at `migrations/` and are exported via `@datahouse/runtime/migrations` (e.g. for Drizzle Kit or custom migrate scripts).
- **Generate migrations:** `bun run db:generate` (from this package directory).
- **Drizzle Studio:** `bun run db:studio`
- **Push schema (dev):** `bun run db:push`

## Local Postgres (optional)

To run Postgres and MinIO for local development:

```bash
docker compose up -d
```

Then set `DATABASE_URL` (and optionally S3/Redis) in `.env` if you are not using PGlite defaults.
