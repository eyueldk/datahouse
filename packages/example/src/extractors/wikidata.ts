import { createExtractor, type UploadedFile } from "datahouse/core";
import wbk from "wikibase-sdk";
import { z } from "zod";

interface WikidataValue {
  type: string;
  value: string;
}

export interface WikidataBookBinding {
  book?: WikidataValue;
  bookLabel?: WikidataValue;
  authorLabel?: WikidataValue;
  publicationDate?: WikidataValue;
  isbn?: WikidataValue;
  description?: WikidataValue;
  artifact?: UploadedFile;
}

interface WikidataSparqlResponse {
  results?: {
    bindings?: WikidataBookBinding[];
  };
}

const wikidataCursorSchema = z.object({
  offset: z.coerce.number().int().min(0).default(0),
});

const wikidataSdk = wbk({
  instance: "https://www.wikidata.org",
  sparqlEndpoint: "https://query.wikidata.org/sparql",
});

export const wikidataExtractor = createExtractor({
  id: "wikidata-extractor",
  cron: "30 * * * *",
  config: {
    schema: z.object({
      limit: z.number().int().positive().max(100).default(20),
    }),
    create: (input) => ({
      key: `wikidata:${input.limit}`,
      config: input,
    }),
  },
  cursor: {
    schema: wikidataCursorSchema,
  },
  async *extract({ config, upload, cursor }) {
    const offset = cursor?.offset ?? 0;

    const query = `
      PREFIX wd: <http://www.wikidata.org/entity/>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX bd: <http://www.bigdata.com/rdf#>
      PREFIX wikibase: <http://wikiba.se/ontology#>
      PREFIX schema: <http://schema.org/>

      SELECT ?book ?bookLabel ?authorLabel ?publicationDate ?isbn ?description WHERE {
        ?book wdt:P31 wd:Q571.
        OPTIONAL { ?book wdt:P50 ?author. }
        OPTIONAL { ?book wdt:P577 ?publicationDate. }
        OPTIONAL { ?book wdt:P212 ?isbn. }
        OPTIONAL {
          ?book schema:description ?description.
          FILTER(LANG(?description) = "en")
        }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      }
      ORDER BY ?book
      LIMIT ${config.limit}
      OFFSET ${offset}
    `;

    const sparqlUrl = wikidataSdk.sparqlQuery(query);
    const response = await fetch(sparqlUrl, {
      headers: {
        Accept: "application/sparql-results+json",
        "User-Agent": "datahouse-example-book-integration/0.1",
      },
    });

    if (!response.ok) {
      throw new Error(`Wikidata request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as WikidataSparqlResponse;
    const bindings = payload.results?.bindings ?? [];
    const fetchedAt = new Date().toISOString();

    const items = await Promise.all(
      bindings.map(async (binding, index) => {
        const entityKey = binding.book?.value ?? `wikidata-book-${index}`;
        const artifactJson = JSON.stringify(
          {
            source: "wikidata-extractor",
            entityUri: entityKey,
            sparqlLimit: config.limit,
            fetchedAt,
          },
          null,
          2,
        );
        const artifact = await upload({
          content: Buffer.from(artifactJson, "utf8"),
          name: `wikidata-artifact-${entityKey.replace(/[/\\?*:|"<>]/g, "_").slice(0, 120)}.json`,
          mimeType: "application/json",
        });

        return {
          key: entityKey,
          data: {
            ...binding,
            artifact,
          },
          metadata: {
            upstream: "wikidata",
            sparqlLimit: config.limit,
            sparqlOffset: offset,
            fetchedAt,
          },
        };
      }),
    );

    const hasMore =
      bindings.length > 0 && bindings.length === config.limit;

    yield {
      items,
      cursor: hasMore ? { offset: offset + config.limit } : { offset: 0 },
    };
  },
});
