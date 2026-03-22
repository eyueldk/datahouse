import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
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
import { client } from "#/lib/client";

type RunRecord = {
  id: string;
  type: "extract" | "transform";
  status: "running" | "completed" | "failed";
  error: string | null;
  startedAt: Date;
  completedAt: Date | null;
};

type RunTypeOption = "extract" | "transform";

const RUN_TYPE_LABELS: Record<RunTypeOption, string> = {
  extract: "Extract",
  transform: "Transform",
};

export const Route = createFileRoute("/runs")({
  loader: async () => {
    const payload = await client.runs.list({});
    return { runs: payload.items };
  },
  component: RunsPage,
});

function RunsPage() {
  const { runs } = Route.useLoaderData();
  const [selectedRun, setSelectedRun] = useState<RunRecord | null>(null);
  const [runTypes, setRunTypes] = useState<RunTypeOption[]>([
    "extract",
    "transform",
  ]);

  const filteredRuns = useMemo(() => {
    const list = runs as RunRecord[];
    return list.filter((r) => runTypes.includes(r.type));
  }, [runs, runTypes]);

  const columns: ColumnDef<RunRecord>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("type")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("status")}</div>
      ),
    },
    {
      accessorKey: "startedAt",
      header: "Started",
      cell: ({ row }) => new Date(row.getValue("startedAt")).toLocaleString(),
    },
    {
      accessorKey: "completedAt",
      header: "Completed",
      cell: ({ row }) =>
        row.getValue("completedAt")
          ? new Date(row.getValue("completedAt")).toLocaleString()
          : "-",
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setSelectedRun(row.original)}
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
          <CardTitle>Runs</CardTitle>
          <CardDescription>
            Inspect extraction and transformation run history.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Select
              multiple
              value={runTypes}
              onValueChange={(next: RunTypeOption[] | null) =>
                setRunTypes(next ?? [])
              }
            >
              <SelectTrigger
                size="sm"
                className="w-full min-w-[200px] sm:w-[240px]"
                aria-label="Filter runs by type"
              >
                <SelectValue placeholder="Select run types">
                  {(value) => {
                    const selected = value as RunTypeOption[] | null | undefined;
                    if (!selected?.length) {
                      return "No types selected";
                    }
                    return selected.map((v) => RUN_TYPE_LABELS[v]).join(", ");
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="extract">Extract</SelectItem>
                <SelectItem value="transform">Transform</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DataTable columns={columns} data={filteredRuns} />
        </CardContent>
      </Card>

      <Sheet
        open={selectedRun !== null}
        onOpenChange={(open) => !open && setSelectedRun(null)}
      >
        <SheetContent
          side="right"
          className="w-full overflow-hidden sm:max-w-xl"
        >
          <SheetHeader>
            <SheetTitle>Run Details</SheetTitle>
            <SheetDescription>
              Detailed information for the selected run.
            </SheetDescription>
          </SheetHeader>
          {selectedRun ? (
            <div className="grid flex-1 gap-4 overflow-y-auto px-4 pb-4 text-sm">
              <Detail label="ID" value={selectedRun.id} />
              <Detail label="Type" value={selectedRun.type} />
              <Detail label="Status" value={selectedRun.status} />
              <Detail
                label="Started At"
                value={new Date(selectedRun.startedAt).toLocaleString()}
              />
              <Detail
                label="Completed At"
                value={
                  selectedRun.completedAt
                    ? new Date(selectedRun.completedAt).toLocaleString()
                    : "-"
                }
              />
              <Detail label="Error" value={selectedRun.error ?? "-"} />
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
