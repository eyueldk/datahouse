import { createFileRoute } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { DataTable } from "#/components/ui/data-table";
import { client } from "#/lib/client";

type ExtractorItem = {
  id: string;
  cron?: string;
};

const columns: ColumnDef<ExtractorItem>[] = [
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
    const payload = await client.extractors.list({});
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
        <DataTable columns={columns} data={extractors as ExtractorItem[]} />
      </CardContent>
    </Card>
  );
}
