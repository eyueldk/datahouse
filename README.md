# datahouse

Monorepo for the **datahouse** framework. **Only the [`datahouse`](https://www.npmjs.com/package/datahouse) package is published** — everything under `@datahouse/*` is internal layout and ships inside that single install.

## Workspace packages (not published separately)

| Package | Role in the repo |
|---------|------------------|
| `datahouse` | Published CLI + public exports (`datahouse`, `datahouse/core`, …) |
| `@datahouse/core` | Core types and pipeline primitives |
| `@datahouse/runtime` | Server, DB, queues, HTTP |
| `@datahouse/client` | Typed API client (re-exported where needed) |
| `@datahouse/studio` | Studio UI (bundled with `datahouse studio`) |

## Dev

```bash
bun install
bun run build
```

Example app: `packages/example/` — `bun run dev` / `bun run studio`.
