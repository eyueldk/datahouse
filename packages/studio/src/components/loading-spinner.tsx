import { Spinner } from "#/components/ui/spinner";

export function LoadingSpinner(props: { label: string; className?: string }) {
  return (
    <div
      className={props.className ?? "text-sm text-muted-foreground"}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <Spinner aria-hidden />
        <span>{props.label}</span>
      </div>
    </div>
  );
}
