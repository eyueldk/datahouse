# example

Example Datahouse integration aggregating books from Open Library and Wikidata.

## Run

```bash
bun run dev    # starts datahouse serve
bun run studio # starts studio
```

## Structure

- `src/extractors/` — Open Library and Wikidata extractors
- `src/transformers/` — Maps sources to unified book model
- `src/models/` — Output schema
- `src/index.ts` — Pipeline registration

No API keys required.
