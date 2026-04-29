import { type ColumnDef } from "@tanstack/react-table";
import prettyBytes from "pretty-bytes";
import { Download, Search } from "lucide-react";
import type { FileRecord } from "@datahousejs/client";
import { Button } from "#/components/ui/button";
import { TableCellTruncate } from "#/components/table-cell-truncate";
import { DataTable } from "#/components/ui/data-table";
import { downloadFile } from "#/lib/server-functions";

export function uploadedFilesColumns(params: {
  onInspect?: (file: FileRecord) => void;
}): ColumnDef<FileRecord>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <TableCellTruncate text={row.original.id} variant="id" />
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <TableCellTruncate text={row.original.name} variant="text" />
      ),
    },
    {
      accessorKey: "mimeType",
      header: "MIME",
      cell: ({ row }) => (
        <TableCellTruncate
          text={row.original.mimeType ?? "—"}
          variant="text"
        />
      ),
    },
    {
      accessorKey: "size",
      header: "Size",
      cell: ({ row }) => {
        const bytes = row.original.size;
        if (bytes == null) {
          return (
            <span className="tabular-nums text-muted-foreground">—</span>
          );
        }
        return (
          <span
            className="tabular-nums"
            title={`${bytes} bytes`}
          >
            {prettyBytes(bytes)}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleString(),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          {params.onInspect ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Inspect file"
              title="Inspect file"
              onClick={() => params.onInspect?.(row.original)}
            >
              <Search className="size-4" aria-hidden />
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Download file"
            title="Download file"
            onClick={() => void downloadBrowserFile(row.original)}
          >
            <Download className="size-4" aria-hidden />
          </Button>
        </div>
      ),
    },
  ];
}

export function UploadedFilesTable(props: {
  files: FileRecord[];
  onInspect?: (file: FileRecord) => void;
  loading?: boolean;
  loadingLabel?: string;
}) {
  const columns = uploadedFilesColumns({
    onInspect: props.onInspect,
  });
  return (
    <DataTable
      columns={columns}
      data={props.files}
      defaultPageSize={25}
      loading={props.loading}
      loadingLabel={props.loadingLabel}
    />
  );
}

async function downloadBrowserFile(file: FileRecord) {
  const response = await downloadFile({ data: { id: file.id } });
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
