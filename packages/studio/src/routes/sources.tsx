import * as jsf from "json-schema-faker";
import { Play, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toastQueuedRun } from "#/lib/job-toast";
import { type ColumnDef } from "@tanstack/react-table";
import { JsonSchemaForm } from "#/components/json-schema-form";
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
  DialogTrigger,
} from "#/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "#/components/ui/sheet";
import { Label } from "#/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { Textarea } from "#/components/ui/textarea";
import { parseJsonValue, stringifyJson, toJsonSchema } from "#/lib/json-config";
import {
  useCreateSourceMutation,
  useDeleteSourceMutation,
  useExtractSourceMutation,
  useExtractorsQuery,
  useSourcesQuery,
} from "#/hooks/sources.hooks";

export const Route = createFileRoute("/sources")({
  component: SourcesPage,
});

function SourcesPage() {
  const sourcesQuery = useSourcesQuery({});
  const extractorsQuery = useExtractorsQuery({});
  const sources = sourcesQuery.data?.items ?? [];
  const extractors = extractorsQuery.data?.items ?? [];
  const [open, setOpen] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [inspectSource, setInspectSource] = useState<(typeof sources)[0] | null>(
    null,
  );
  const createSourceMutation = useCreateSourceMutation();
  const deleteSourceMutation = useDeleteSourceMutation();
  const extractSourceMutation = useExtractSourceMutation();

  const getExtractorById = (extractorId: string) =>
    extractors.find((extractor) => extractor.id === extractorId);

  const initialExtractorId = extractors[0]?.id ?? "";
  const initialConfigJson = createExampleJson(
    getExtractorById(initialExtractorId)?.schema,
  );

  const form = useForm({
    defaultValues: {
      extractorId: initialExtractorId,
      configJson: initialConfigJson,
      editorMode: "visual" as "visual" | "json",
    },
    onSubmit: async ({ value }) => {
      setStatusError(null);
      const parsedConfig = parseJsonValue(value.configJson);
      await createSourceMutation.mutateAsync({
        extractorId: value.extractorId,
        config: parsedConfig,
      });
      setOpen(false);
    },
  });

  const resetFormForDialog = () => {
    const id = extractors[0]?.id ?? "";
    form.reset({
      extractorId: id,
      configJson: createExampleJson(getExtractorById(id)?.schema),
      editorMode: "visual",
    });
  };

  const navigate = useNavigate();

  const extractFromSource = async (id: string) => {
    setStatusError(null);
    const result = await extractSourceMutation.mutateAsync({ id });
    toastQueuedRun(navigate, result.jobId, "extract", "Extract run queued");
  };

  const handleDeleteSource = async (id: string) => {
    setStatusError(null);
    try {
      await deleteSourceMutation.mutateAsync({ id });
      toast.success("Source deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "extractorId",
      header: "Extractor",
    },
    {
      accessorKey: "key",
      header: "Key",
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
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="shrink-0"
            aria-label="Run extraction"
            title="Run extraction"
            onClick={() => void extractFromSource(row.original.id)}
          >
            <Play className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="shrink-0"
            aria-label="Inspect source"
            title="Inspect source"
            onClick={() => setInspectSource(row.original)}
          >
            <Search className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete source"
            title="Delete source"
            onClick={() => void handleDeleteSource(row.original.id)}
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
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Sources</CardTitle>
          <CardDescription>
            Create sources and enqueue extractions into the datalake.
          </CardDescription>
        </div>
        <Dialog
          open={open}
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            if (nextOpen) {
              resetFormForDialog();
            }
          }}
        >
          <DialogTrigger render={<Button>Add Source</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create source</DialogTitle>
              <DialogDescription>
                Pick an extractor, then set config with the visual or JSON
                editor. The key is set automatically from the extractor create
                step.
              </DialogDescription>
            </DialogHeader>
            {extractors.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No extractors are available.
              </p>
            ) : (
              <form
                className="grid gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  void form.handleSubmit().catch((error: unknown) => {
                    setStatusError(String(error));
                  });
                }}
              >
                <form.Field name="extractorId">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Extractor</Label>
                      <Select
                        value={field.state.value}
                        onValueChange={(extractorId) => {
                          const nextExtractorId = extractorId ?? "";
                          field.handleChange(nextExtractorId);
                          form.setFieldValue(
                            "configJson",
                            createExampleJson(
                              getExtractorById(nextExtractorId)?.schema,
                            ),
                          );
                        }}
                      >
                        <SelectTrigger id={field.name} className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="start">
                          {extractors.map((extractor) => (
                            <SelectItem key={extractor.id} value={extractor.id}>
                              {extractor.id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.Field>

                <form.Field name="editorMode">
                  {(field) => (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={
                          field.state.value === "visual"
                            ? "default"
                            : "secondary"
                        }
                        onClick={() => field.handleChange("visual")}
                      >
                        Visual
                      </Button>
                      <Button
                        type="button"
                        variant={
                          field.state.value === "json" ? "default" : "secondary"
                        }
                        onClick={() => field.handleChange("json")}
                      >
                        JSON
                      </Button>
                    </div>
                  )}
                </form.Field>

                <form.Subscribe
                  selector={(state) =>
                    [state.values.editorMode, state.values.extractorId] as const
                  }
                >
                  {([editorMode, subscribedExtractorId]) => {
                    const selectedSchema = toJsonSchema(
                      getExtractorById(subscribedExtractorId)?.schema,
                    );
                    return (
                      <form.Field name="configJson">
                        {(field) =>
                          editorMode === "visual" ? (
                            <JsonSchemaForm
                              schema={selectedSchema}
                              valueJson={field.state.value}
                              onChangeJson={(json) => field.handleChange(json)}
                            />
                          ) : (
                            <div className="grid gap-2">
                              <Label htmlFor={field.name}>Config JSON</Label>
                              <Textarea
                                id={field.name}
                                rows={8}
                                value={field.state.value}
                                onChange={(event) =>
                                  field.handleChange(event.target.value)
                                }
                              />
                            </div>
                          )
                        }
                      </form.Field>
                    );
                  }}
                </form.Subscribe>

                <DialogFooter>
                  <Button type="submit" disabled={extractors.length === 0}>
                    Create Source
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="grid gap-4">
        {statusError ? (
          <p className="text-sm text-destructive">{statusError}</p>
        ) : null}
        {sourcesQuery.error || extractorsQuery.error ? (
          <p className="text-sm text-destructive">
            {sourcesQuery.error?.message ?? extractorsQuery.error?.message}
          </p>
        ) : null}
        <DataTable
          columns={columns}
          data={sources}
          loading={sourcesQuery.isLoading || extractorsQuery.isLoading}
          loadingLabel="Loading sources..."
        />
      </CardContent>
    </Card>

      <Sheet
        open={inspectSource !== null}
        onOpenChange={(next) => !next && setInspectSource(null)}
      >
        <SheetContent
          side="right"
          className="w-full overflow-hidden sm:max-w-xl"
        >
          <SheetHeader>
            <SheetTitle>Source details</SheetTitle>
            <SheetDescription>
              Configuration and metadata for this source.
            </SheetDescription>
          </SheetHeader>
          {inspectSource ? (
            <div className="grid flex-1 gap-4 overflow-y-auto px-4 pb-4 text-sm">
              <SourceDetail label="ID" value={inspectSource.id} />
              <SourceDetail label="Extractor ID" value={inspectSource.extractorId} />
              <SourceDetail label="Key" value={inspectSource.key} />
              <SourceDetail
                label="Created At"
                value={new Date(inspectSource.createdAt).toLocaleString()}
              />
              <div className="grid gap-2">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Config
                </p>
                <pre className="max-h-[40vh] overflow-auto rounded-md border bg-muted/30 p-3 text-xs">
                  {JSON.stringify(inspectSource.config, null, 2)}
                </pre>
              </div>
              <div className="grid gap-2">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Cursor
                </p>
                <pre className="max-h-[24vh] overflow-auto rounded-md border bg-muted/30 p-3 text-xs">
                  {JSON.stringify(inspectSource.cursor, null, 2)}
                </pre>
              </div>
              {inspectSource.schema !== undefined ? (
                <div className="grid gap-2">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Schema
                  </p>
                  <pre className="max-h-[32vh] overflow-auto rounded-md border bg-muted/30 p-3 text-xs">
                    {JSON.stringify(inspectSource.schema, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}

function SourceDetail(props: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {props.label}
      </p>
      <p className="break-all">{props.value}</p>
    </div>
  );
}

function createExampleJson(schema: unknown): string {
  try {
    if (schema === undefined) {
      return stringifyJson({});
    }
    const generated = jsf.generate(toJsonSchema(schema));
    return stringifyJson(generated);
  } catch {
    return "{}";
  }
}
