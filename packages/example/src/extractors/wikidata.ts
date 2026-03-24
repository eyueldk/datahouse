import { createExtractor } from "datahouse/core";
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
}

interface WikidataSparqlResponse {
  results?: {
    bindings?: WikidataBookBinding[];
  };
}

interface WikidataExtractorConfig {
  limit: number;
}

const wikidataSdk = wbk({
  instance: "https://www.wikidata.org",
  sparqlEndpoint: "https://query.wikidata.org/sparql",
});

export const wikidataExtractor = createExtractor<
  WikidataBookBinding,
  WikidataExtractorConfig,
  WikidataExtractorConfig
>({
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
  async extract({ config, emit }) {
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
      LIMIT ${config.limit}
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

    await emit({
      items: bindings.map((binding, index) => ({
        key: binding.book?.value ?? `wikidata-book-${index}`,
        data: binding,
      })),
    });
  },
});

