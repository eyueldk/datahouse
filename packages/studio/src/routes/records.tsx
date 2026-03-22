import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "#/components/ui/button";
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
import { client } from "#/lib/client";

type RecordItem = {
  id: string;
  runId: string;
  bronzeRecordId: string;
  transformerId: string;
  key: string;
  collection: string;
  data: unknown;
  createdAt: Date;
};

export const Route = createFileRoute("/records")({
  loader: async () => {
    const payload = await client.records.list({});
    return { records: payload.items };
  },
  component: RecordsPage,
});

function RecordsPage() {
  const { records } = Route.useLoaderData();
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);
  const typedRecords = records as RecordItem[];

  const collections = Array.from(
    new Set(typedRecords.map((record) => record.collection)),
  ).sort((a, b) => a.localeCompare(b));
  const filteredRecords =
    selectedCollection === "all"
      ? typedRecords
      : typedRecords.filter(
          (record) => record.collection === selectedCollection,
        );

  const columns: ColumnDef<RecordItem>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "key",
      header: "Key",
    },
    {
      accessorKey: "collection",
      header: "Collection",
    },
    {
      accessorKey: "transformerId",
      header: "Transformer",
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleString(),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setSelectedRecord(row.original)}
          >
            Inspect
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Records</CardTitle>
          <CardDescription>
            Golden records across all collections in this Datahouse runtime.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-2">
            <Label htmlFor="record-collection-filter">Collection</Label>
            <Select
              value={selectedCollection}
              onValueChange={(value) => setSelectedCollection(value ?? "all")}
            >
              <SelectTrigger id="record-collection-filter" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="all">All collections</SelectItem>
                {collections.map((collection) => (
                  <SelectItem key={collection} value={collection}>
                    {collection}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DataTable columns={columns} data={filteredRecords} />
        </CardContent>
      </Card>

      <Sheet
        open={selectedRecord !== null}
        onOpenChange={(open) => !open && setSelectedRecord(null)}
      >
        <SheetContent
          side="right"
          className="w-full overflow-hidden sm:max-w-xl"
        >
          <SheetHeader>
            <SheetTitle>Record Details</SheetTitle>
            <SheetDescription>
              Inspect full metadata and payload for the selected record.
            </SheetDescription>
          </SheetHeader>
          {selectedRecord ? (
            <div className="grid flex-1 gap-4 overflow-y-auto px-4 pb-4 text-sm">
              <Detail label="ID" value={selectedRecord.id} />
              <Detail label="Run ID" value={selectedRecord.runId} />
              <Detail
                label="Bronze Record ID"
                value={selectedRecord.bronzeRecordId}
              />
              <Detail
                label="Transformer ID"
                value={selectedRecord.transformerId}
              />
              <Detail label="Key" value={selectedRecord.key} />
              <Detail label="Collection" value={selectedRecord.collection} />
              <Detail
                label="Created At"
                value={new Date(selectedRecord.createdAt).toLocaleString()}
              />

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

function Detail(props: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {props.label}
      </p>
      <p className="break-all">{props.value}</p>
    </div>
  );
}
