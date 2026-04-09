import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
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
import type { DatawarehouseRecord } from "@datahousejs/client";
import {
  listDatawarehouseCollections,
  listDatawarehouseRecords,
} from "#/lib/server-functions";

type DatawarehouseBrowseRecord = DatawarehouseRecord<unknown, string>;

export const Route = createFileRoute("/datawarehouse")({
  loader: async () => {
    const { items: collections } = await listDatawarehouseCollections();
    const records: DatawarehouseBrowseRecord[] = [];
    for (const collection of collections) {
      const { items } = await listDatawarehouseRecords({
        data: {
          collection,
          limit: 200,
        },
      });
      records.push(...items);
    }
    return { records };
  },
  component: DatawarehousePage,
});

function DatawarehousePage() {
  const { records } = Route.useLoaderData();
  const [selectedRecord, setSelectedRecord] =
    useState<DatawarehouseBrowseRecord | null>(null);

  const browseForm = useForm({
    defaultValues: {
      collection: "all",
    },
  });

  const collections = Array.from(
    new Set(records.map((record) => record.collection)),
  ).sort((a, b) => a.localeCompare(b));

  const columns: ColumnDef<DatawarehouseBrowseRecord>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "key", header: "Key" },
    { accessorKey: "collection", header: "Collection" },
    { accessorKey: "transformerId", header: "Transformer" },
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
          <CardTitle>Data warehouse</CardTitle>
          <CardDescription>
            Curated collection records produced by transformers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-2">
            <browseForm.Field name="collection">
              {(field) => (
                <>
                  <Label htmlFor={field.name}>Collection</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value ?? "all")
                    }
                  >
                    <SelectTrigger id={field.name} className="w-full">
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
                </>
              )}
            </browseForm.Field>
          </div>
          <browseForm.Subscribe selector={(state) => state.values.collection}>
            {(collection) => (
              <DataTable
                columns={columns}
                data={
                  collection === "all"
                    ? records
                    : records.filter(
                        (record) => record.collection === collection,
                      )
                }
              />
            )}
          </browseForm.Subscribe>
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
            <SheetTitle>Record details</SheetTitle>
            <SheetDescription>
              Metadata and payload for the selected data warehouse record.
            </SheetDescription>
          </SheetHeader>
          {selectedRecord ? (
            <div className="grid flex-1 gap-4 overflow-y-auto px-4 pb-4 text-sm">
              <Detail label="ID" value={selectedRecord.id} />
              <Detail label="Run ID" value={selectedRecord.runId} />
              <Detail label="Datalake ID" value={selectedRecord.datalakeId} />
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
