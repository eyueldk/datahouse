import { createTransformer } from "datahouse/core";
import { booksCollection } from "../collections/books";
import { wikidataExtractor } from "../extractors/wikidata";
import type { WikidataBookBinding } from "../extractors/wikidata";
import type { UnifiedBook } from "../models/book";

function extractEntityId(entityUri: string | undefined): string {
  if (!entityUri) {
    return "unknown";
  }

  const segments = entityUri.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? entityUri;
}

function toPublishYear(isoDate: string | undefined): number | null {
  if (!isoDate) {
    return null;
  }

  const match = isoDate.match(/^(\d{4})/);
  if (!match) {
    return null;
  }

  const [yearToken] = match.slice(1);
  if (!yearToken) {
    return null;
  }

  const year = Number.parseInt(yearToken, 10);
  return Number.isFinite(year) ? year : null;
}

export const wikidataTransformer = createTransformer({
  id: "wikidata-transformer",
  extractor: wikidataExtractor,
  collections: [booksCollection],
  async *transform({ data, metadata }) {
    const entityId = extractEntityId(data.book?.value);
    const unifiedBook: UnifiedBook = {
      id: `wikidata:${entityId}`,
      title: data.bookLabel?.value ?? "Unknown title",
      author: data.authorLabel?.value ?? "Unknown author",
      publishYear: toPublishYear(data.publicationDate?.value),
      isbn: data.isbn?.value ?? null,
      description: data.description?.value ?? null,
      source: "Wikidata",
    };

    yield {
      collection: "books",
      items: [
        {
          key: unifiedBook.id,
          data: unifiedBook,
          metadata: {
            transformerId: "wikidata-transformer",
            datalakeUpstream: metadata.upstream,
            datalakeFetchedAt: metadata.fetchedAt,
            wikidataBookUri: data.book?.value ?? null,
          },
        },
      ],
    };
  },
});

