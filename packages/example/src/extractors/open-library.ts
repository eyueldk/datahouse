import { createExtractor, type UploadedFile } from "datahouse/core";
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
  artifact?: UploadedFile;
}

interface OpenLibrarySearchResponse {
  start?: number;
  num_found?: number;
  numFound?: number;
  docs?: OpenLibraryBook[];
}

const openLibraryCursorSchema = z.object({
  /** 1-based page (see Open Library Search API). */
  page: z.coerce.number().int().min(1).default(1),
});

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
  cursor: {
    schema: openLibraryCursorSchema,
  },
  async *extract({ config, upload, cursor }) {
    const page = cursor?.page ?? 1;

    const params = new URLSearchParams({
      q: config.query,
      limit: String(config.limit),
      page: String(page),
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
    const numFound = payload.num_found ?? payload.numFound ?? 0;
    const start = payload.start ?? 0;
    const fetchedAt = new Date().toISOString();

    const items = await Promise.all(
      docs.map(async (doc, index) => {
        const workKey = doc.key ?? `open-library-${index}`;
        const artifactJson = JSON.stringify(
          {
            source: "open-library-extractor",
            workKey,
            searchQuery: config.query,
            searchLimit: config.limit,
            fetchedAt,
          },
          null,
          2,
        );
        const artifact = await upload({
          content: Buffer.from(artifactJson, "utf8"),
          name: `open-library-artifact-${workKey.replace(/[/\\?*:|"<>]/g, "_").slice(0, 120)}.json`,
          mimeType: "application/json",
        });

        return {
          key: workKey,
          data: {
            ...doc,
            artifact,
          },
          metadata: {
            upstream: "open-library",
            searchQuery: config.query,
            searchPage: page,
            fetchedAt,
          },
        };
      }),
    );

    const nextStart = start + docs.length;
    const hasMore =
      docs.length === config.limit &&
      (numFound > 0 ? nextStart < numFound : true);

    yield {
      items,
      cursor: hasMore ? { page: page + 1 } : { page: 1 },
    };
  },
});
