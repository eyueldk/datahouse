import { toast } from "sonner";

export function toastQueuedRun(
  router: {
    navigate: (opts: { to: string; search?: unknown }) => Promise<void>;
  },
  jobId: string,
  runType: "extract" | "transform",
  title = "Run queued",
) {
  toast.success(title, {
    description: jobId,
    action: {
      label: "Open",
      onClick: () => {
        void router.navigate({
          to: "/runs",
          search: { page: 0, type: runType, id: jobId },
        });
      },
    },
  });
}

export function toastQueuedTransformBatch(
  router: {
    navigate: (opts: { to: string; search?: unknown }) => Promise<void>;
  },
  runIds: string[],
  enqueued: number,
) {
  const first = runIds[0];
  if (!first) return;
  const title =
    enqueued === 1
      ? "Transform run queued"
      : `${enqueued} transform runs queued`;
  toast.success(title, {
    description: enqueued === 1 ? first : `Open the first of ${enqueued} jobs`,
    action: {
      label: "Open",
      onClick: () => {
        void router.navigate({
          to: "/runs",
          search: { page: 0, type: "transform", id: first },
        });
      },
    },
  });
}
