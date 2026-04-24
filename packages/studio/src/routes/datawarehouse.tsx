import { Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { type ColumnDef } from "@tanstack/react-table";
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
  deleteDatawarehouseRecord,
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
  const router = useRouter();
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
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="shrink-0"
            aria-label="Inspect record"
            title="Inspect record"
            onClick={() => setSelectedRecord(row.original)}
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
                  await deleteDatawarehouseRecord({
                    data: { id: row.original.id },
                  });
                  toast.success("Data warehouse record deleted");
                  setSelectedRecord((prev) =>
                    prev?.id === row.original.id ? null : prev,
                  );
                  await router.invalidate();
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
