import * as jsf from "json-schema-faker";
import { Play } from "lucide-react";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useRouter } from "@tanstack/react-router";
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
  listSources,
  listExtractors,
  createSource,
  deleteSource,
  extractSource,
} from "#/lib/server-functions";

export const Route = createFileRoute("/sources")({
  loader: async () => {
    const [sourcesPayload, extractorsPayload] = await Promise.all([
      listSources(),
      listExtractors(),
    ]);
    return {
      sources: sourcesPayload.items,
      extractors: extractorsPayload.items,
    };
  },
  component: SourcesPage,
});

function SourcesPage() {
  const router = useRouter();
  const { sources, extractors } = Route.useLoaderData();
  const [open, setOpen] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

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
      await createSource({
        data: {
          extractorId: value.extractorId,
          config: parsedConfig,
        },
      });
      setOpen(false);
      await router.invalidate();
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

  const extractFromSource = async (id: string) => {
    setStatusError(null);
    const result = await extractSource({ data: { id } });
    toastQueuedRun(router, result.jobId, "extract", "Extract run queued");
    await router.invalidate();
  };

  const handleDeleteSource = async (id: string) => {
    setStatusError(null);
    await deleteSource({ data: { id } });
    await router.invalidate();
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
      cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleString(),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="shrink-0"
            aria-label="Run extraction for this source"
            title="Run extraction"
            onClick={() => void extractFromSource(row.original.id)}
          >
            <Play className="size-4" aria-hidden />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => void handleDeleteSource(row.original.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
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
                Configure source config either with a visual form or raw JSON.
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
                  {([editorMode, extractorId]) => {
                    const selectedSchema = toJsonSchema(
                      getExtractorById(extractorId)?.schema,
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
        <DataTable columns={columns} data={sources} />
      </CardContent>
    </Card>
  );
}

function createExampleJson(schema: unknown): string {
  try {
    const generated = jsf.generate(toJsonSchema(schema));
    return stringifyJson(generated);
  } catch {
    return "{}";
  }
}
