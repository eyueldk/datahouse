# example

Reference integration aggregating books from Open Library and Wikidata over HTTP. No API keys required.

## Run

```bash
bun run dev    # starts datahouse serve (port 2510)
bun run studio # starts studio UI (port 2511)
```

## Structure

- `src/extractors/` — Open Library and Wikidata fetchers
- `src/transformers/` — Maps sources to unified book model
- `src/models/` — Output collection schema
- `src/index.ts` — Pipeline registration

View the API at http://localhost:2510 and browse data in Studio at http://localhost:2511.
