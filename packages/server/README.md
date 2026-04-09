# @datahousejs/server

**Internal package.** Not published. End users run `datahouse serve` (the CLI bundles this).

Runtime library: Elysia app, config loading, migrations, and cron-backed extract/transform jobs.

## Usage

```ts
import { startServer } from "@datahousejs/server";

await startServer({
  port: 2510,
  configPath: "./datahouse.config.ts",
});
```

## Environment

| Variable        | Description                                                       |
| --------------- | ----------------------------------------------------------------- |
| `DATABASE_URL`  | Postgres connection. If unset, uses PGlite in `.datahouse/pglite` |
| `BUNQUEUE_HOST` | Connect to external bunqueue worker. If unset, runs embedded      |
| `S3_*`          | S3-compatible storage (MinIO, etc.)                               |

See `.env.example` for full list.

## Development

```bash
docker compose up -d  # Postgres + MinIO (optional)
bun run db:generate   # Generate migrations
bun run db:push       # Push schema (dev)
bun run db:studio     # Drizzle Studio
```
