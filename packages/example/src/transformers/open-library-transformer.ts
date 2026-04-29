import { createTransformer, UploadedFile } from "datahouse/core";
import { booksCollection } from "../collections/books";
import { openLibraryExtractor } from "../extractors/open-library";
import type { OpenLibraryBook } from "../extractors/open-library";
import type { UnifiedBook } from "../models/book";

function toDescription(
  firstSentence: OpenLibraryBook["first_sentence"],
): string | null {
  if (!firstSentence) {
    return null;
  }

  if (typeof firstSentence === "string") {
    return firstSentence;
  }

  if (Array.isArray(firstSentence)) {
    const first = firstSentence[0];
    return first?.value ?? null;
  }

  return firstSentence.value ?? null;
}

function getOpenLibraryId(key: string | undefined): string {
  if (!key) {
    return "unknown";
  }

  const segments = key.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? key;
}

function safeFileSegment(id: string): string {
  return id.replace(/[/\\?*:|"<>]/g, "_").slice(0, 120);
}

export const openLibraryTransformer = createTransformer({
  id: "open-library-transformer",
  extractor: openLibraryExtractor,
  collections: [booksCollection],
  async *transform({ data, metadata, upload, download }) {
    const bookId = getOpenLibraryId(data.key);
    const unifiedBook: UnifiedBook = {
      id: `openlibrary:${bookId}`,
      title: data.title ?? "Unknown title",
      author: data.author_name?.[0] ?? "Unknown author",
      publishYear: data.first_publish_year ?? null,
      isbn: data.isbn?.[0] ?? null,
      description: toDescription(data.first_sentence),
      source: "OpenLibrary",
    };

    let artifactQuery: string | null = null;
    const inputArtifact = data.artifact;
    if (inputArtifact instanceof UploadedFile) {
      const artifactBytes = await download({ file: inputArtifact });
      const parsed = JSON.parse(artifactBytes.toString("utf8")) as {
        searchQuery?: string;
      };
      artifactQuery = parsed.searchQuery ?? null;
    }

    const artifact = await upload({
      content: Buffer.from(
        JSON.stringify(
          {
            transformer: "open-library-transformer",
            unifiedBookId: unifiedBook.id,
            artifactQuery,
            transformedAt: new Date().toISOString(),
          },
          null,
          2,
        ),
        "utf8",
      ),
      name: `open-library-transform-${safeFileSegment(unifiedBook.id)}.json`,
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
            transformerId: "open-library-transformer",
            datalakeUpstream: metadata.upstream,
            datalakeFetchedAt: metadata.fetchedAt,
            openLibraryWorkKey: data.key ?? null,
            artifactQuery,
          },
        },
      ],
    };
  },
});

