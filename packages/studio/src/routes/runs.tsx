import { useEffect, useRef, useState } from "react";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "#/components/ui/sheet";
import type { RunRecord } from "@datahousejs/client";
import { listRuns, getRun } from "#/lib/server-functions";
import { z } from "zod";

const PAGE_SIZE = 25;

const runTypeSchema = z.enum(["all", "extract", "transform"]);

export const Route = createFileRoute("/runs")({
  validateSearch: z.object({
    page: z.coerce.number().int().min(0).catch(0),
    id: z.string().optional(),
    type: runTypeSchema.catch("all"),
  }),
  loaderDeps: ({ search: { page, type } }) => ({ page, type }),
  loader: async ({ deps: { page, type } }) => {
    const limit = PAGE_SIZE;
    const offset = page * limit;
    const payload = await listRuns({
      data: {
        type: type === "all" ? undefined : type,
        limit,
        offset,
      },
    });
    return {
      runs: payload.items,
      meta: payload.meta,
      page,
      limit,
      filterType: type,
    };
  },
  component: RunsPage,
});

function RunsPage() {
  const router = useRouter();
  const navigate = useNavigate({ from: Route.fullPath });
  const searchId = Route.useSearch({ select: (s) => s.id });
  const searchType = Route.useSearch({ select: (s) => s.type });
  const { runs, meta, page, limit, filterType } = Route.useLoaderData();
  const [selected, setSelected] = useState<RunRecord | null>(null);
  const pollFailNotified = useRef(false);

  const selectedId = selected?.id ?? null;
  const selectedRunning = selected?.status === "running";

  useEffect(() => {
    if (!selectedId || !selectedRunning) {
      pollFailNotified.current = false;
      return;
    }

    let cancelled = false;
    const id = selectedId;

    async function refresh() {
      try {
        const row = await getRun({ data: { id } });
        if (cancelled) return;
        pollFailNotified.current = false;
        setSelected(row);
        if (row.status !== "running") {
          void router.invalidate();
        }
      } catch (e) {
        if (cancelled) return;
        if (!pollFailNotified.current) {
          pollFailNotified.current = true;
          toast.error(e instanceof Error ? e.message : String(e));
        }
      }
    }

    void refresh();
    const interval = window.setInterval(() => {
      void refresh();
    }, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [selectedId, selectedRunning, router]);

  useEffect(() => {
    if (!searchId) return;
    let cancelled = false;
    void (async () => {
      try {
        const row = await getRun({ data: { id: searchId } });
        if (cancelled) return;
        setSelected(row);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) {
          navigate({
            search: (p: { page: number; type: typeof searchType }) => ({
              page: p.page,
              type: p.type,
            }),
            replace: true,
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchId, navigate, searchType]);

  const total = Number(meta.total);
  const offset = page * limit;
  const hasNext = offset + runs.length < total;

  function openRun(row: RunRecord) {
    setSelected(row);
  }

  function setFilterType(next: z.infer<typeof runTypeSchema>) {
    void navigate({
      search: { page: 0, type: next },
      replace: true,
    });
  }

  const columns: ColumnDef<RunRecord>[] = [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="capitalize">{row.getValue("type")}</span>
      ),
    },
    { accessorKey: "id", header: "ID" },
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
            onClick={() => openRun(row.original)}
          >
            Browse
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
            Extract and transform jobs in one place. Filter by run type or open
            a row for re-run and batch-transform actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "All"],
                ["extract", "Extract"],
                ["transform", "Transform"],
              ] as const
            ).map(([value, label]) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={filterType === value ? "default" : "outline"}
                onClick={() => setFilterType(value)}
              >
                {label}
              </Button>
            ))}
          </div>
          <DataTable columns={columns} data={runs} />
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {total === 0
                ? "No runs"
                : `Showing ${offset + 1}–${offset + runs.length} of ${total}`}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() =>
                  navigate({
                    search: { page: page - 1, type: filterType },
                    replace: true,
                  })
                }
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!hasNext}
                onClick={() =>
                  navigate({
                    search: { page: page + 1, type: filterType },
                    replace: true,
                  })
                }
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Sheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
          }
        }}
      >
        <SheetContent
          side="right"
          className="flex w-full flex-col overflow-hidden sm:max-w-xl"
        >
          <SheetHeader>
            <SheetTitle>Run</SheetTitle>
            <SheetDescription>Run metadata and status.</SheetDescription>
          </SheetHeader>
          {selected ? (
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4 text-sm">
              {selected.status === "running" ? (
                <div
                  className="space-y-3 rounded-lg border border-primary/25 bg-primary/5 p-4"
                  role="status"
                  aria-live="polite"
                  aria-label="Run in progress"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Loader2
                      className="size-4 shrink-0 animate-spin text-primary"
                      aria-hidden
                    />
                    <span>Run in progress</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Checking status every 2s until this run completes or fails.
                  </p>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-full animate-pulse rounded-full bg-primary/70" />
                  </div>
                </div>
              ) : null}
              <Detail label="Type" value={selected.type} />
              <Detail label="ID" value={selected.id} />
              <Detail label="Status" value={selected.status} />
              <Detail
                label="Started At"
                value={new Date(selected.startedAt).toLocaleString()}
              />
              <Detail
                label="Completed At"
                value={
                  selected.completedAt
                    ? new Date(selected.completedAt).toLocaleString()
                    : "-"
                }
              />
              <Detail label="Error" value={selected.error ?? "-"} />
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
