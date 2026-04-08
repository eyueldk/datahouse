import { createPipeline, createDatahouse } from "datahouse/core";
import { openLibraryExtractor } from "./extractors/open-library";
import { wikidataExtractor } from "./extractors/wikidata";
import { openLibraryTransformer } from "./transformers/open-library-transformer";
import { wikidataTransformer } from "./transformers/wikidata-transformer";

export default createDatahouse({
  pipelines: [
    createPipeline(openLibraryExtractor, openLibraryTransformer),
    createPipeline(wikidataExtractor, wikidataTransformer),
  ],
});
