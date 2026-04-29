import type { UploadedFile } from "datahouse/core";

export type BookSource = "OpenLibrary" | "Wikidata";

export interface UnifiedBook {
  id: string;
  title: string;
  author: string;
  publishYear: number | null;
  isbn: string | null;
  description: string | null;
  source: BookSource;
  artifact?: UploadedFile;
}
