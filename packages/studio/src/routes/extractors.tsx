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
import { listExtractors } from "#/lib/server-functions";

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
  loader: async () => {
    const payload = await listExtractors();
    return { extractors: payload.items };
  },
  component: ExtractorsPage,
});

function ExtractorsPage() {
  const { extractors } = Route.useLoaderData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extractors</CardTitle>
        <CardDescription>
          Configured extractors from the runtime config.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={extractors} />
      </CardContent>
    </Card>
  );
}
