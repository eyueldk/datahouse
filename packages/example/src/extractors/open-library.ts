import { createExtractor } from "datahouse/core";
import { z } from "zod";

interface OpenLibrarySentenceObject {
  value?: string;
}

type OpenLibraryFirstSentence =
  | string
  | OpenLibrarySentenceObject
  | OpenLibrarySentenceObject[]
  | undefined;

export interface OpenLibraryBook {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  first_sentence?: OpenLibraryFirstSentence;
}

interface OpenLibrarySearchResponse {
  docs?: OpenLibraryBook[];
}

export const openLibraryExtractor = createExtractor({
  id: "open-library-extractor",
  cron: "0 * * * *",
  config: {
    schema: z.object({
      query: z.string().trim().min(1).default("science fiction"),
      limit: z.number().int().positive().max(50).default(20),
    }),
    create: (input) => ({
      key: `open-library:${input.query.toLowerCase()}:${input.limit}`,
      config: input,
    }),
  },
  async *extract({ config }) {
    const params = new URLSearchParams({
      q: config.query,
      limit: String(config.limit),
      fields: "key,title,author_name,first_publish_year,isbn,first_sentence",
    });

    const response = await fetch(
      `https://openlibrary.org/search.json?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error(
        `Open Library request failed with status ${response.status}`,
      );
    }

    const payload = (await response.json()) as OpenLibrarySearchResponse;
    const docs = payload.docs ?? [];

    yield {
      items: docs.map((doc, index) => ({
        key: doc.key ?? `open-library-${index}`,
        data: doc,
      })),
    };
  },
});
