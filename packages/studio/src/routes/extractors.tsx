import { createFileRoute } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";
import type { ExtractorInfo } from "@datahousejs/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { DataTable } from "#/components/ui/data-table";
import { useExtractorsQuery } from "#/hooks/extractors.hooks";

const columns: ColumnDef<ExtractorInfo>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "cron",
    header: "Cron",
    cell: ({ row }) => row.getValue("cron") ?? "manual",
  },
];

export const Route = createFileRoute("/extractors")({
  component: ExtractorsPage,
});

function ExtractorsPage() {
  const extractorsQuery = useExtractorsQuery({});
  const extractors = extractorsQuery.data?.items ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extractors</CardTitle>
        <CardDescription>
          Configured extractors from the runtime config.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {extractorsQuery.error ? (
          <p className="text-sm text-destructive">
            {extractorsQuery.error.message}
          </p>
        ) : null}
        <DataTable
          columns={columns}
          data={extractors}
          loading={extractorsQuery.isLoading}
          loadingLabel="Loading extractors..."
        />
      </CardContent>
    </Card>
  );
}
