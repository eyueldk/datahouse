import { Link } from "@tanstack/react-router";
import { cn } from "#/lib/utils";

export type TableTruncateVariant = "id" | "key" | "text";

/** Fills the cell; truncation happens at the column edge (used with `table-fixed` + even columns). */
export function tableTruncateClass(_variant: TableTruncateVariant = "text") {
  return "block min-w-0 w-full max-w-full truncate";
}

export function TableCellTruncate(props: {
  text: string;
  variant?: TableTruncateVariant;
}) {
  const variant = props.variant ?? "text";
  return (
    <span
      className={cn("block", tableTruncateClass(variant))}
      title={props.text}
    >
      {props.text}
    </span>
  );
}

type TableLinkTruncateBase = {
  label: string;
  variant?: Extract<TableTruncateVariant, "id" | "key">;
  className?: string;
};

export type TableLinkTruncateProps =
  | (TableLinkTruncateBase & {
      to: "/datalake";
      search: { inspect: string };
    })
  | (TableLinkTruncateBase & {
      to: "/datawarehouse";
      search: { inspect: string };
    })
  | (TableLinkTruncateBase & {
      to: "/runs";
      search: {
        page: number;
        type?: "extract" | "transform";
        id?: string;
      };
    })
  | (TableLinkTruncateBase & {
      to: "/extractors";
    });

const linkClass =
  "text-primary inline-block min-w-0 underline-offset-4 hover:underline";

export function TableLinkTruncate(props: TableLinkTruncateProps) {
  const { label, variant = "id", className } = props;
  const inner = (
    <span className={cn("block", tableTruncateClass(variant))}>{label}</span>
  );

  switch (props.to) {
    case "/datalake":
      return (
        <Link
          to="/datalake"
          search={props.search}
          title={label}
          className={cn(linkClass, className)}
        >
          {inner}
        </Link>
      );
    case "/datawarehouse":
      return (
        <Link
          to="/datawarehouse"
          search={props.search}
          title={label}
          className={cn(linkClass, className)}
        >
          {inner}
        </Link>
      );
    case "/runs":
      return (
        <Link
          to="/runs"
          search={props.search}
          title={label}
          className={cn(linkClass, className)}
        >
          {inner}
        </Link>
      );
    case "/extractors":
      return (
        <Link to="/extractors" title={label} className={cn(linkClass, className)}>
          {inner}
        </Link>
      );
  }
}
