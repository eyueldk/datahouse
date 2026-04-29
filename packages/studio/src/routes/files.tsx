import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { FileRecord } from "@datahousejs/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { useFilesQuery } from "#/hooks/files.hooks";
import { UploadedFilesTable } from "#/components/uploaded-files-table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "#/components/ui/sheet";
import { TableLinkTruncate } from "#/components/table-cell-truncate";

interface UploadedFileReference {
  id: string;
  kind: "datalake" | "datawarehouse";
  recordId: string;
}

export const Route = createFileRoute("/files")({
  component: FilesPage,
});

function FilesPage() {
  const filesQuery = useFilesQuery({ limit: 200, offset: 0 });
  const files = filesQuery.data?.items ?? [];
  const meta = filesQuery.data?.meta ?? { offset: 0, limit: 200, total: 0 };
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const references = selectedFile?.references ?? [];

  return (
    <>
      <div className="grid min-w-0 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Files</CardTitle>
            <CardDescription>
              Files currently referenced by datalake or data warehouse records (
              {meta.total} total).
            </CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            {filesQuery.error ? (
              <p className="text-sm text-destructive">
                {filesQuery.error.message}
              </p>
            ) : (
              <UploadedFilesTable
                files={files}
                onInspect={setSelectedFile}
                loading={filesQuery.isLoading}
                loadingLabel="Loading files..."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Sheet
        open={selectedFile !== null}
        onOpenChange={(open) => !open && setSelectedFile(null)}
      >
        <SheetContent
          side="right"
          className="w-full overflow-hidden sm:max-w-xl"
        >
          <SheetHeader>
            <SheetTitle>File details</SheetTitle>
            <SheetDescription>
              Metadata and datalake/data warehouse records referencing this file.
            </SheetDescription>
          </SheetHeader>
          {selectedFile ? (
            <div className="grid min-w-0 flex-1 gap-4 overflow-y-auto px-4 pb-4 text-sm">
              <Detail label="ID" value={selectedFile.id} />
              <Detail label="Name" value={selectedFile.name} />
              <Detail label="MIME" value={selectedFile.mimeType ?? "—"} />
              <Detail
                label="Size"
                value={
                  selectedFile.size == null
                    ? "—"
                    : `${selectedFile.size} bytes`
                }
              />
              <Detail label="Checksum" value={selectedFile.checksum} />
              <Detail
                label="Created At"
                value={new Date(selectedFile.createdAt).toLocaleString()}
              />

              <div className="grid min-w-0 gap-2">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  References
                </p>
                {references.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No references found.
                  </p>
                ) : (
                  <div className="grid min-w-0 gap-2">
                    {references.map((ref) => (
                      <FileReferenceItem key={ref.id} reference={ref} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}

function FileReferenceItem(props: { reference: UploadedFileReference }) {
  const { reference } = props;
  if (reference.kind === "datalake") {
    return (
      <div className="grid min-w-0 gap-1 rounded-md border bg-muted/20 p-2">
        <p className="text-xs text-muted-foreground">Datalake</p>
        <TableLinkTruncate
          to="/datalake"
          search={{ inspect: reference.recordId }}
          label={reference.recordId}
        />
      </div>
    );
  }
  return (
    <div className="grid min-w-0 gap-1 rounded-md border bg-muted/20 p-2">
      <p className="text-xs text-muted-foreground">Data warehouse</p>
      <TableLinkTruncate
        to="/datawarehouse"
        search={{ inspect: reference.recordId }}
        label={reference.recordId}
      />
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
