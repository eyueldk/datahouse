import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const defaultPageSizeOptions = [25, 50, 100];

export function Pagination({
  page,
  pageSize,
  total,
  pageSizeOptions = defaultPageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          Showing {start}-{end} of {total} results
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeftIcon className="size-4" />
          </button>
          <div className="flex h-8 min-w-[3rem] items-center justify-center rounded-md border border-border bg-background px-2 text-sm">
            {page} / {totalPages || 1}
          </div>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
