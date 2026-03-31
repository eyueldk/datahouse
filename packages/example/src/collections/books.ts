import { createCollection } from "datahouse/core";
import { z } from "zod";

export const unifiedBookSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string(),
  publishYear: z.number().nullable(),
  isbn: z.string().nullable(),
  description: z.string().nullable(),
  source: z.enum(["OpenLibrary", "Wikidata"]),
});

export const booksCollection = createCollection({
  id: "books",
  schema: unifiedBookSchema,
});
