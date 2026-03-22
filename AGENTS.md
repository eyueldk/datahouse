## Learned User Preferences

- Use `bun add` and `bun remove` for dependency changes instead of hand-editing dependency blocks.
- Prefer object-style function parameters named `params` (for clarity and future extensibility).
- Always use spinal-case for filenames and mapping keys.
- Keep modules function-oriented; export standalone functions instead of service objects with methods.
- Use prefixed `nanoid` IDs for database keys instead of UUIDs.
- Validate environment variables at module load time so failures happen fast.
- When the user provides a plan with existing todos, implement it directly, do not edit the plan file, and update the existing todo statuses in order.
- Use `uv` for Python package management and command execution (`uv add`, `uv run`).
- Do not generate application migrations (manual or autogenerate) unless explicitly requested in that task; the user manages migrations.
- Do not catch and rethrow errors unless adding handling/processing; otherwise let errors propagate naturally.
- Prefer inferred return types in `@datahouse/client` functions instead of duplicating response type definitions; do not clamp pagination in the client—pass values through and let the server enforce limits.
- For `@datahouse/runtime` Elysia routes, name reusable schema symbols with PascalCase and a `Request` or `Response` suffix; declare `response` schemas and return with `status(code, payload)` when wiring endpoints.

## Learned Workspace Facts

- This repository is a Bun monorepo using Prettier conventions (double quotes and semicolons).
- Runtime package name is `@datahouse/runtime`.
- The `datahouse` CLI lives in `packages/datahouse` (`bin`: `dist/cli.mjs`); commands are split into `src/commands/{command}.ts`.
- CLI default config discovery checks `index.js`, `index.ts`, `src/index.js`, then `src/index.ts`.
- The published package is `datahouse`; it builds with `tsdown` (`packages/datahouse/tsdown.config.ts`), emits library entries and `dist/cli.mjs`, copies `@datahouse/runtime/migrations` into `dist/migrations`, and copies the built studio app from `../studio/dist` into `dist/studio`. Do **not** list `@datahouse/studio` as a `workspace:*` devDependency—`bun publish` cannot resolve workspace versions for private packages; instead map `@datahouse/studio/server` via `tsconfig` paths to `../studio/src` (build studio before `datahouse` when packaging).
- Runtime server is Elysia-based: loads config and runs DB migrations on startup; task scheduling uses bunqueue (embedded or TCP to a bunqueue server); default HTTP port is `2510` (`datahouse serve` / `startServer`). Studio UI is bundled under `dist/studio`; `datahouse studio` defaults to port `2511`.
- Runtime route plugins live under `packages/runtime/src/routes/`; HTTP API is mounted under `/api` (extractors, sources, records, runs, etc.).
- Runtime database: Drizzle with PostgreSQL when `DATABASE_URL` is set; otherwise embedded PGlite with data under `DATA_DIR/pglite`; migrations ship in `packages/runtime/migrations/` and are driven by `packages/runtime/drizzle.config.ts`.
- Drizzle tables live in `packages/runtime/src/schemas/` (per-table files); relations are centralized in `schemas/index.ts`; services import the specific table modules they need rather than `import *` from the schema barrel.
- Data pipeline model is `sources -> runs -> bronze_records -> gold_records`; `bronze_records` reference `run_id` and `source_id`; `gold_records` reference `run_id`, `bronze_record_id`, and `transformer_id`.
- `@datahouse/client` implements Treaty calls via `src/apis/` factories named `create*Api`, composed by `createClient` into `extractors`, `runs`, `sources`, and `records`.
- `datahouse-py` is a sibling workspace for the Python stack (FastAPI, Airflow, async SQLAlchemy, Postgres, Alembic); it uses `GoldenRecord` naming and prefixed nanoid IDs (`src_`, `run_`, `brz_`, `gld_`).
