# datahouse

ETL framework for extract → transform → load pipelines with a server API and Studio UI.

**Only [`datahouse`](https://www.npmjs.com/package/datahouse) is published.** All `@datahousejs/*` packages are internal workspace modules.

## Quick Start

```bash
bun add datahouse
```

```bash
datahouse serve   # API server, default :2510
datahouse studio  # Studio UI, default :2511
```

## Packages

| Package             | README                                                |
| ------------------- | ----------------------------------------------------- |
| `datahouse` CLI     | [packages/datahouse/README.md](./packages/datahouse/) |
| `@datahousejs/core`   | [packages/core/README.md](./packages/core/)           |
| `@datahousejs/client` | [packages/client/README.md](./packages/client/)       |
| `@datahousejs/server` | [packages/server/README.md](./packages/server/)       |
| `@datahousejs/studio` | [packages/studio/README.md](./packages/studio/)       |
| `example`           | [packages/example/README.md](./packages/example/)     |

## Dev

```bash
bun install && bun run build
```
