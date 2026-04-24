import type { AnyDatahouse } from "@datahousejs/core";
import { DatalakeRecordsClient } from "./apis/datalake";
import {
  DatawarehouseCollectionsClient,
  DatawarehouseRecordsClient,
  DatawarehouseTombstonesClient,
} from "./apis/datawarehouse";
import { ExtractorsClient } from "./apis/extractors";
import { RunsClient } from "./apis/runs";
import { SourcesClient } from "./apis/sources";
import { TransformersClient } from "./apis/transformers";
import { VersionClient } from "./apis/version";
import { createEdenFetchClient } from "./utils/eden.ts";
import type { CollectionFromDatahouse } from "./types";

export class DatahouseClient<TDatahouse extends AnyDatahouse> {
  public readonly datalakeRecords;
  public readonly extractors;
  public readonly runs;
  public readonly sources;
  public readonly transformers;
  public readonly version;
  public readonly datawarehouseCollections;
  public readonly datawarehouseTombstones;
  public readonly datawarehouseRecords;

  constructor(params: { baseUrl: string }) {
    const client = createEdenFetchClient(params);
    this.datalakeRecords = new DatalakeRecordsClient(client);
    this.extractors = new ExtractorsClient(client);
    this.runs = new RunsClient(client);
    this.sources = new SourcesClient(client);
    this.transformers = new TransformersClient(client);
    this.version = new VersionClient(client);
    this.datawarehouseCollections = new DatawarehouseCollectionsClient(client);
    this.datawarehouseTombstones = new DatawarehouseTombstonesClient<
      CollectionFromDatahouse<TDatahouse>
    >(client);
    this.datawarehouseRecords = new DatawarehouseRecordsClient<
      CollectionFromDatahouse<TDatahouse>
    >(client);
  }
}
