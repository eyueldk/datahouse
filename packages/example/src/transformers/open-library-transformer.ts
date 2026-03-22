import { createTransformer } from "datahouse";
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

export const openLibraryTransformer = createTransformer({
  id: "open-library-transformer",
  extractor: openLibraryExtractor,
  collections: [booksCollection],
  async transform({ data, emit }) {
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

    await emit("books", [
      {
        key: unifiedBook.id,
        data: unifiedBook,
      },
    ]);
  },
});
