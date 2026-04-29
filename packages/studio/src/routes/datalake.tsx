import { useEffect, useState } from "react";
import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { Play, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { z } from "zod";
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
import type { DatalakeRecord } from "@datahousejs/client";
import {
  useDatalakeQuery,
  useDeleteDatalakeRecordMutation,
  useTransformDatalakeMutation,
  useTransformersQuery,
} from "#/hooks/datalake.hooks";
import { toastQueuedTransformBatch } from "#/lib/job-toast";
import {
  TableCellTruncate,
  TableLinkTruncate,
} from "#/components/table-cell-truncate";

export const Route = createFileRoute("/datalake")({
  validateSearch: z.object({
    inspect: z.string().optional(),
  }),
  component: DatalakePage,
});

function DatalakePage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const inspectFromUrl = Route.useSearch({ select: (s) => s.inspect });
  const recordsQuery = useDatalakeQuery({});
  const records = recordsQuery.data?.items ?? [];
  const [selectedRecord, setSelectedRecord] = useState<DatalakeRecord | null>(
    null,
  );
  const [transformRecord, setTransformRecord] = useState<DatalakeRecord | null>(
    null,
  );
  const [selectedTransformerIds, setSelectedTransformerIds] = useState<
    Set<string>
  >(new Set());
  const [transformLoading, setTransformLoading] = useState(false);
  const transformersQuery = useTransformersQuery(
    { extractorId: transformRecord?.extractorId },
    { enabled: transformRecord !== null },
  );
  const transformerList = transformersQuery.data?.items ?? [];
  const transformDatalakeMutation = useTransformDatalakeMutation();
  const deleteDatalakeRecordMutation = useDeleteDatalakeRecordMutation();

  const browseForm = useForm({
    defaultValues: {
      extractorId: "all",
    },
  });

  const extractors = Array.from(
    new Set(records.map((record) => record.extractorId)),
  ).sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    if (!inspectFromUrl) return;
    const hit = records.find((r) => r.id === inspectFromUrl);
    if (hit) setSelectedRecord(hit);
  }, [inspectFromUrl, records]);

  useEffect(() => {
    if (!transformRecord) {
      setSelectedTransformerIds(new Set());
      return;
    }
    if (transformersQuery.error) {
      toast.error(transformersQuery.error.message);
      setSelectedTransformerIds(new Set());
      return;
    }
    setSelectedTransformerIds(new Set(transformerList.map((x) => x.id)));
  }, [transformRecord, transformerList, transformersQuery.error]);

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
      const r = await transformDatalakeMutation.mutateAsync({
        id: transformRecord.id,
        transformerIds: allSelected ? undefined : [...selectedTransformerIds],
      });
      setTransformRecord(null);
      toastQueuedTransformBatch(navigate, r.runIds, r.enqueued);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setTransformLoading(false);
    }
  }

  const columns: ColumnDef<DatalakeRecord>[] = [
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
      accessorKey: "extractorId",
      header: "Extractor",
      cell: ({ row }) => (
        <TableCellTruncate text={row.original.extractorId} variant="key" />
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
            aria-label="Run transforms"
            title="Run transforms"
            onClick={() => setTransformRecord(row.original)}
          >
            <Play className="size-4" aria-hidden />
          </Button>
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
                to: "/datalake",
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
                  await deleteDatalakeRecordMutation.mutateAsync({
                    id: row.original.id,
                  });
                  toast.success("Datalake record deleted");
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
          <CardTitle>Datalake</CardTitle>
          <CardDescription>
            Raw records produced by extractors before transformation.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          <div className="mb-4 grid gap-2">
            <browseForm.Field name="extractorId">
              {(field) => (
                <>
                  <Label htmlFor={field.name}>Extractor</Label>
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
          {recordsQuery.error ? (
            <p className="mb-4 text-sm text-destructive">
              {recordsQuery.error.message}
            </p>
          ) : null}
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
                loading={recordsQuery.isLoading}
                loadingLabel="Loading datalake records..."
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
              replaces existing datawarehouse output for that transformer. Leave
              all selected to run every transformer for this extractor.
            </DialogDescription>
          </DialogHeader>
          {transformRecord ? (
            <div className="grid max-h-[50vh] gap-2 overflow-y-auto py-2">
              {transformerList.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No transformers are registered for extractor{" "}
                  <span className="font-mono">
                    {transformRecord.extractorId}
                  </span>
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
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRecord(null);
            void navigate({
              to: "/datalake",
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
              Metadata and payload for the selected datalake record.
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
              <DetailMono label="Source ID">
                <span className="mr-2 truncate" title={selectedRecord.sourceId}>
                  {selectedRecord.sourceId}
                </span>
                <Link
                  to="/sources"
                  className="text-primary shrink-0 text-xs underline-offset-4 hover:underline"
                >
                  Sources
                </Link>
              </DetailMono>
              <DetailMono label="Extractor ID">
                <Link
                  to="/extractors"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {selectedRecord.extractorId}
                </Link>
              </DetailMono>
              <Detail label="Key" value={selectedRecord.key} />
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
      <div className="flex min-w-0 items-baseline gap-2">{props.children}</div>
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
