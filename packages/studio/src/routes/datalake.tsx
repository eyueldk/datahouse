import { useEffect, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { Play } from "lucide-react";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
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
import type { DatalakeRecord } from "@datahouse/client/types";
import { client } from "#/lib/client";
import { toastQueuedTransformBatch } from "#/lib/job-toast";

async function fetchAllRecords(): Promise<DatalakeRecord[]> {
  const records: DatalakeRecord[] = [];
  for await (const page of client.datalake.pages({ limit: 200 })) {
    records.push(...page.items);
  }
  return records;
}

export const Route = createFileRoute("/datalake")({
  loader: async () => {
    const records = await fetchAllRecords();
    return { records };
  },
  component: DatalakePage,
});

function DatalakePage() {
  const router = useRouter();
  const { records } = Route.useLoaderData();
  const [selectedRecord, setSelectedRecord] = useState<DatalakeRecord | null>(
    null,
  );
  const [transformRecord, setTransformRecord] = useState<DatalakeRecord | null>(
    null,
  );
  const [transformerList, setTransformerList] = useState<{ id: string }[]>([]);
  const [selectedTransformerIds, setSelectedTransformerIds] = useState<
    Set<string>
  >(new Set());
  const [transformLoading, setTransformLoading] = useState(false);

  const browseForm = useForm({
    defaultValues: {
      extractorId: "all",
    },
  });

  const extractors = Array.from(
    new Set(records.map((record) => record.extractorId)),
  ).sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    if (!transformRecord) {
      setTransformerList([]);
      setSelectedTransformerIds(new Set());
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const { items } = await client.transformers.list({
          extractorId: transformRecord.extractorId,
        });
        if (cancelled) return;
        setTransformerList(items);
        setSelectedTransformerIds(new Set(items.map((x) => x.id)));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : String(e));
        setTransformerList([]);
        setSelectedTransformerIds(new Set());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [transformRecord]);

  function toggleTransformer(id: string) {
    setSelectedTransformerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submitTransform() {
    if (!transformRecord) return;
    if (selectedTransformerIds.size === 0) {
      toast.error("Select at least one transformer.");
      return;
    }
    setTransformLoading(true);
    try {
      const allSelected =
        transformerList.length > 0 &&
        selectedTransformerIds.size === transformerList.length;
      const r = await client.datalake.transform({
        id: transformRecord.id,
        transformerIds: allSelected ? undefined : [...selectedTransformerIds],
      });
      setTransformRecord(null);
      toastQueuedTransformBatch(router, r.runIds, r.enqueued);
      await router.invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setTransformLoading(false);
    }
  }

  const columns: ColumnDef<DatalakeRecord>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "key", header: "Key" },
    { accessorKey: "extractorId", header: "Extractor" },
    { accessorKey: "runId", header: "Run" },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleString(),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="shrink-0"
            aria-label="Run transforms for this datalake record"
            title="Run transforms"
            onClick={() => setTransformRecord(row.original)}
          >
            <Play className="size-4" aria-hidden />
          </Button>
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
          <CardTitle>Datalake</CardTitle>
          <CardDescription>
            Raw records produced by extractors before transformation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-2">
            <browseForm.Field name="extractorId">
              {(field) => (
                <>
                  <Label htmlFor={field.name}>Extractor</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value ?? "all")}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectItem value="all">All extractors</SelectItem>
                      {extractors.map((id) => (
                        <SelectItem key={id} value={id}>
                          {id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </browseForm.Field>
          </div>
          <browseForm.Subscribe selector={(state) => state.values.extractorId}>
            {(extractorId) => (
              <DataTable
                columns={columns}
                data={
                  extractorId === "all"
                    ? records
                    : records.filter(
                        (record) => record.extractorId === extractorId,
                      )
                }
              />
            )}
          </browseForm.Subscribe>
        </CardContent>
      </Card>

      <Dialog
        open={transformRecord !== null}
        onOpenChange={(open) => !open && setTransformRecord(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Run transforms</DialogTitle>
            <DialogDescription>
              Choose which transformers to run for this datalake row. Each run
              replaces existing datawarehouse output for that transformer.
              Leave all selected to run every transformer for this extractor.
            </DialogDescription>
          </DialogHeader>
          {transformRecord ? (
            <div className="grid max-h-[50vh] gap-2 overflow-y-auto py-2">
              {transformerList.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No transformers are registered for extractor{" "}
                  <span className="font-mono">{transformRecord.extractorId}</span>
                  .
                </p>
              ) : (
                transformerList.map((t) => (
                  <label
                    key={t.id}
                    className="flex cursor-pointer items-center gap-3 rounded-md border border-transparent px-2 py-2 hover:bg-muted/50"
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded border-input"
                      checked={selectedTransformerIds.has(t.id)}
                      onChange={() => toggleTransformer(t.id)}
                    />
                    <span className="font-mono text-sm">{t.id}</span>
                  </label>
                ))
              )}
            </div>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setTransformRecord(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                transformLoading ||
                transformerList.length === 0 ||
                selectedTransformerIds.size === 0
              }
              onClick={() => void submitTransform()}
            >
              {transformLoading ? "Queueing…" : "Queue transforms"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              Metadata and payload for the selected datalake record.
            </SheetDescription>
          </SheetHeader>
          {selectedRecord ? (
            <div className="grid flex-1 gap-4 overflow-y-auto px-4 pb-4 text-sm">
              <Detail label="ID" value={selectedRecord.id} />
              <Detail label="Run ID" value={selectedRecord.runId} />
              <Detail label="Source ID" value={selectedRecord.sourceId} />
              <Detail label="Extractor ID" value={selectedRecord.extractorId} />
              <Detail label="Key" value={selectedRecord.key} />
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
