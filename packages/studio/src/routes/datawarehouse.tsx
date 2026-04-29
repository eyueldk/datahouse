import { Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { DataTable } from "#/components/ui/data-table";
import { Label } from "#/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "#/components/ui/sheet";
import type { DatawarehouseRecord } from "@datahousejs/client";
import { Button } from "#/components/ui/button";
import {
  TableCellTruncate,
  TableLinkTruncate,
} from "#/components/table-cell-truncate";
import {
  useDatawarehouseCollectionsQuery,
  useDatawarehouseRecordsQuery,
  useDeleteDatawarehouseRecordMutation,
} from "#/hooks/datawarehouse.hooks";

type DatawarehouseBrowseRecord = DatawarehouseRecord<unknown, string>;

export const Route = createFileRoute("/datawarehouse")({
  validateSearch: z.object({
    inspect: z.string().optional(),
  }),
  component: DatawarehousePage,
});

function DatawarehousePage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const inspectFromUrl = Route.useSearch({ select: (s) => s.inspect });
  const collectionsQuery = useDatawarehouseCollectionsQuery(undefined);
  const collections = collectionsQuery.data?.items ?? [];
  const [selectedCollection, setSelectedCollection] = useState("");
  const recordsQuery = useDatawarehouseRecordsQuery(
    { collection: selectedCollection, limit: 200, offset: 0 },
    { enabled: selectedCollection.length > 0 },
  );
  const records = (recordsQuery.data?.items ?? []) as DatawarehouseBrowseRecord[];
  const [selectedRecord, setSelectedRecord] =
    useState<DatawarehouseBrowseRecord | null>(null);
  const deleteDatawarehouseRecordMutation =
    useDeleteDatawarehouseRecordMutation();

  useEffect(() => {
    if (selectedCollection || collections.length === 0) return;
    setSelectedCollection(collections[0]);
  }, [collections, selectedCollection]);

  useEffect(() => {
    if (!inspectFromUrl) return;
    const hit = records.find((r) => r.id === inspectFromUrl);
    if (hit) setSelectedRecord(hit);
  }, [inspectFromUrl, records]);

  const columns: ColumnDef<DatawarehouseBrowseRecord>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <TableCellTruncate text={row.original.id} variant="id" />
      ),
    },
    {
      accessorKey: "key",
      header: "Key",
      cell: ({ row }) => (
        <TableCellTruncate text={row.original.key} variant="key" />
      ),
    },
    {
      accessorKey: "collection",
      header: "Collection",
      cell: ({ row }) => (
        <TableCellTruncate text={row.original.collection} variant="key" />
      ),
    },
    {
      accessorKey: "transformerId",
      header: "Transformer",
      cell: ({ row }) => (
        <TableLinkTruncate
          to="/extractors"
          label={row.original.transformerId}
          variant="key"
        />
      ),
    },
    {
      accessorKey: "datalakeId",
      header: "Datalake",
      cell: ({ row }) => (
        <TableLinkTruncate
          to="/datalake"
          search={{ inspect: row.original.datalakeId }}
          label={row.original.datalakeId}
          variant="id"
        />
      ),
    },
    {
      accessorKey: "runId",
      header: "Run",
      cell: ({ row }) => (
        <TableLinkTruncate
          to="/runs"
          search={{ page: 0, id: row.original.runId }}
          label={row.original.runId}
          variant="id"
        />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) =>
        new Date(row.getValue("createdAt")).toLocaleString(),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex shrink-0 justify-end gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="shrink-0"
            aria-label="Inspect record"
            title="Inspect record"
            onClick={() => {
              setSelectedRecord(row.original);
              void navigate({
                to: "/datawarehouse",
                search: { inspect: row.original.id },
              });
            }}
          >
            <Search className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete record"
            title="Delete record"
            onClick={() => {
              void (async () => {
                try {
                  await deleteDatawarehouseRecordMutation.mutateAsync({
                    id: row.original.id,
                  });
                  toast.success("Data warehouse record deleted");
                  setSelectedRecord((prev) =>
                    prev?.id === row.original.id ? null : prev,
                  );
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : String(e));
                }
              })();
            }}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Data warehouse</CardTitle>
          <CardDescription>
            Curated collection records produced by transformers.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          <div className="mb-4 grid gap-2">
            <Label htmlFor="collection">Collection</Label>
            <Select
              value={selectedCollection}
              onValueChange={(value) => setSelectedCollection(value ?? "")}
            >
              <SelectTrigger id="collection" className="w-full">
                <SelectValue placeholder="Select a collection" />
              </SelectTrigger>
              <SelectContent align="start">
                {collections.map((collection) => (
                  <SelectItem key={collection} value={collection}>
                    {collection}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {collectionsQuery.error ? (
            <p className="mb-4 text-sm text-destructive">
              {collectionsQuery.error.message}
            </p>
          ) : recordsQuery.error ? (
            <p className="mb-4 text-sm text-destructive">
              {recordsQuery.error.message}
            </p>
          ) : null}
          {selectedCollection || collectionsQuery.isLoading ? (
            <DataTable
              columns={columns}
              data={records}
              loading={collectionsQuery.isLoading || recordsQuery.isLoading}
              loadingLabel={
                collectionsQuery.isLoading
                  ? "Loading data warehouse collections..."
                  : "Loading data warehouse records..."
              }
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              No data warehouse collections found.
            </p>
          )}
        </CardContent>
      </Card>

      <Sheet
        open={selectedRecord !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRecord(null);
            void navigate({
              to: "/datawarehouse",
              search: { inspect: undefined },
            });
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full overflow-hidden sm:max-w-xl"
        >
          <SheetHeader>
            <SheetTitle>Record details</SheetTitle>
            <SheetDescription>
              Metadata and payload for the selected data warehouse record.
            </SheetDescription>
          </SheetHeader>
          {selectedRecord ? (
            <div className="grid min-w-0 flex-1 gap-4 overflow-y-auto px-4 pb-4 text-sm">
              <DetailMono label="ID">
                <Link
                  to="/files"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {selectedRecord.id}
                </Link>
              </DetailMono>
              <DetailMono label="Run ID">
                <Link
                  to="/runs"
                  search={{
                    page: 0,
                    id: selectedRecord.runId,
                  }}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {selectedRecord.runId}
                </Link>
              </DetailMono>
              <DetailMono label="Datalake ID">
                <Link
                  to="/datalake"
                  search={{ inspect: selectedRecord.datalakeId }}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {selectedRecord.datalakeId}
                </Link>
              </DetailMono>
              <DetailMono label="Transformer ID">
                <Link
                  to="/extractors"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {selectedRecord.transformerId}
                </Link>
              </DetailMono>
              <Detail label="Key" value={selectedRecord.key} />
              <Detail label="Collection" value={selectedRecord.collection} />
              <Detail
                label="Created At"
                value={new Date(selectedRecord.createdAt).toLocaleString()}
              />

              {Object.keys(selectedRecord.metadata).length > 0 ? (
                <div className="grid gap-2">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Record metadata
                  </p>
                  <pre className="max-h-[32vh] overflow-auto rounded-md border bg-muted/30 p-3 text-xs">
                    {JSON.stringify(selectedRecord.metadata, null, 2)}
                  </pre>
                </div>
              ) : null}

              <div className="grid gap-2">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Data
                </p>
                <pre className="max-h-[48vh] overflow-auto rounded-md border bg-muted/30 p-3 text-xs">
                  {JSON.stringify(selectedRecord.data, null, 2)}
                </pre>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}

function DetailMono(props: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-w-0 gap-1">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {props.label}
      </p>
      <div className="min-w-0">{props.children}</div>
    </div>
  );
}

function Detail(props: { label: string; value: string }) {
  return (
    <div className="grid min-w-0 gap-1">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {props.label}
      </p>
      <p className="break-all">{props.value}</p>
    </div>
  );
}
