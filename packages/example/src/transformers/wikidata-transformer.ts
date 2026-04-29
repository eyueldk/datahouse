import { createTransformer, UploadedFile } from "datahouse/core";
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

function safeFileSegment(id: string): string {
  return id.replace(/[/\\?*:|"<>]/g, "_").slice(0, 120);
}

export const wikidataTransformer = createTransformer({
  id: "wikidata-transformer",
  extractor: wikidataExtractor,
  collections: [booksCollection],
  async *transform({ data, metadata, upload, download }) {
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

    let artifactLimit: number | null = null;
    const inputArtifact = data.artifact;
    if (inputArtifact instanceof UploadedFile) {
      const artifactBytes = await download({ file: inputArtifact });
      const parsed = JSON.parse(artifactBytes.toString("utf8")) as {
        sparqlLimit?: number;
      };
      artifactLimit =
        typeof parsed.sparqlLimit === "number" ? parsed.sparqlLimit : null;
    }

    const artifact = await upload({
      content: Buffer.from(
        JSON.stringify(
          {
            transformer: "wikidata-transformer",
            unifiedBookId: unifiedBook.id,
            artifactSparqlLimit: artifactLimit,
            transformedAt: new Date().toISOString(),
          },
          null,
          2,
        ),
        "utf8",
      ),
      name: `wikidata-transform-${safeFileSegment(unifiedBook.id)}.json`,
      mimeType: "application/json",
    });

    yield {
      collection: "books",
      items: [
        {
          key: unifiedBook.id,
          data: {
            ...unifiedBook,
            artifact,
          },
          metadata: {
            transformerId: "wikidata-transformer",
            datalakeUpstream: metadata.upstream,
            datalakeFetchedAt: metadata.fetchedAt,
            wikidataBookUri: data.book?.value ?? null,
            artifactSparqlLimit: artifactLimit,
          },
        },
      ],
    };
  },
});

