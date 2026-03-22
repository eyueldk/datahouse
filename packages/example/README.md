# datahouse book integration example

This package demonstrates a simple Datahouse integration that aggregates books from two open sources:

- Open Library search API (REST)
- Wikidata Query Service (SPARQL, via `wikibase-sdk`)

The pipeline normalizes both sources into one unified `UnifiedBook` model and loads into the `books` target.

## Install

```bash
bun install
```

## Run with Datahouse CLI

From the repository root:

```bash
bunx datahouse serve ./packages/example/src/index.ts
```

## Structure

- `src/extractors/open-library.ts`: pulls books from `openlibrary.org/search.json`
- `src/extractors/wikidata.ts`: pulls books from Wikidata SPARQL endpoint
- `src/transformers/*`: maps each source to a shared model
- `src/models/book.ts`: unified output shape
- `src/loaders/book-loader.ts`: loads to `target: "books"`
- `src/index.ts`: registers the two pipelines

## Notes

- No API keys are required.
- Open Library uses `fetch` directly (no official SDK).
- Wikidata integration uses `wikibase-sdk`.
