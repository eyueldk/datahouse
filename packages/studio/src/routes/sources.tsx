import { Theme as ShadcnTheme } from "@rjsf/shadcn";
import { withTheme } from "@rjsf/core";

const Form = withTheme(ShadcnTheme);
import validator from "@rjsf/validator-ajv8";
import * as jsf from "json-schema-faker";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useRouter } from "@tanstack/react-router";
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
import { client } from "#/lib/client";

type ExtractorItem = {
  id: string;
  cron?: string;
  schema: unknown;
};

export const Route = createFileRoute("/sources")({
  loader: async () => {
    const [sourcesPayload, extractorsPayload] = await Promise.all([
      client.sources.list({}),
      client.extractors.list({}),
    ]);
    return {
      sources: sourcesPayload.items,
      extractors: extractorsPayload.items as ExtractorItem[],
    };
  },
  component: SourcesPage,
});

function SourcesPage() {
  const router = useRouter();
  const { sources, extractors } = Route.useLoaderData();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"visual" | "json">("visual");
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
    },
    onSubmit: async ({ value }) => {
      setStatusError(null);
      const parsedConfig = parseJsonValue(value.configJson);
      await client.sources.create({
        extractorId: value.extractorId,
        config: parsedConfig,
      });
      setOpen(false);
      await router.invalidate();
    },
  });

  const [visualData, setVisualData] = useState<unknown>(
    parseJsonValue(initialConfigJson),
  );

  const syncFromExtractor = (extractorId: string) => {
    const nextConfigJson = createExampleJson(
      getExtractorById(extractorId)?.schema,
    );
    form.setFieldValue("configJson", nextConfigJson);
    setVisualData(parseJsonValue(nextConfigJson));
  };

  const triggerSource = async (id: string) => {
    setStatusError(null);
    await client.sources.trigger({ id });
    await router.invalidate();
  };

  const deleteSource = async (id: string) => {
    setStatusError(null);
    await client.sources.remove({ id });
    await router.invalidate();
  };

  const selectedSchema = toJsonSchema(
    getExtractorById(form.state.values.extractorId)?.schema,
  );

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
            variant="secondary"
            size="sm"
            onClick={() => void triggerSource(row.original.id)}
          >
            Trigger Run
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => void deleteSource(row.original.id)}
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
            Create sources and trigger extraction runs.
          </CardDescription>
        </div>
        <Dialog
          open={open}
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            if (nextOpen && form.state.values.extractorId) {
              syncFromExtractor(form.state.values.extractorId);
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
                <form.Field
                  name="extractorId"
                  children={(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Extractor</Label>
                      <Select
                        value={field.state.value}
                        onValueChange={(extractorId) => {
                          const nextExtractorId = extractorId ?? "";
                          field.handleChange(nextExtractorId);
                          syncFromExtractor(nextExtractorId);
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
                />

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={mode === "visual" ? "default" : "secondary"}
                    onClick={() => setMode("visual")}
                  >
                    Visual
                  </Button>
                  <Button
                    type="button"
                    variant={mode === "json" ? "default" : "secondary"}
                    onClick={() => setMode("json")}
                  >
                    JSON
                  </Button>
                </div>

                {mode === "visual" ? (
                  <div className="rounded-md border border-border p-3">
                    <Form
                      schema={selectedSchema}
                      validator={validator}
                      formData={visualData}
                      onChange={(event: { formData?: unknown }) => {
                        const nextData = event.formData ?? {};
                        setVisualData(nextData);
                        form.setFieldValue(
                          "configJson",
                          stringifyJson(nextData),
                        );
                      }}
                    >
                      <div />
                    </Form>
                  </div>
                ) : (
                  <form.Field
                    name="configJson"
                    children={(field) => (
                      <div className="grid gap-2">
                        <Label htmlFor={field.name}>Config JSON</Label>
                        <Textarea
                          id={field.name}
                          rows={8}
                          value={field.state.value}
                          onChange={(event) => {
                            const nextJson = event.target.value;
                            field.handleChange(nextJson);
                            try {
                              setVisualData(parseJsonValue(nextJson));
                            } catch {
                              // Keep visual form state unchanged for invalid JSON input.
                            }
                          }}
                        />
                      </div>
                    )}
                  />
                )}

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

function parseJsonValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {};
  }
  return JSON.parse(trimmed);
}

function stringifyJson(value: unknown): string {
  return JSON.stringify(value ?? {}, null, 2);
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toJsonSchema(schema: unknown): Record<string, unknown> {
  if (isJsonObject(schema)) {
    return schema;
  }
  return {
    type: "object",
    properties: {},
    additionalProperties: true,
  };
}

function createExampleJson(schema: unknown): string {
  try {
    const generated = jsf.generate(toJsonSchema(schema));
    return stringifyJson(generated);
  } catch {
    return "{}";
  }
}
