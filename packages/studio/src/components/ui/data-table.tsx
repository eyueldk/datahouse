import { useEffect, useState } from "react";
import {
  type ColumnDef,
  type ColumnSizingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  type PaginationState,
  useReactTable,
} from "@tanstack/react-table";

import { Pagination } from "#/components/ui/pagination";
import { Spinner } from "#/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { cn } from "#/lib/utils";

type ColumnNoTruncate = { noTruncate?: boolean };

function isNoTruncateColumn(meta: unknown): boolean {
  return (meta as ColumnNoTruncate | undefined)?.noTruncate === true;
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /**
   * Client-side pagination inside the table. Set false when the route already
   * paginates data (e.g. server-driven pages).
   * @default true
   */
  clientPagination?: boolean;
  /** Initial page size when `clientPagination` is true. @default 25 */
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  loading?: boolean;
  loadingLabel?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  clientPagination = true,
  defaultPageSize = 25,
  pageSizeOptions,
  loading = false,
  loadingLabel = "Loading...",
}: DataTableProps<TData, TValue>) {
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  useEffect(() => {
    if (!clientPagination) return;
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [data.length, clientPagination]);

  const table = useReactTable({
    data,
    columns,
    columnResizeMode: "onEnd",
    defaultColumn: {
      minSize: 48,
      size: 140,
      maxSize: 900,
    },
    enableColumnResizing: true,
    state: {
      columnSizing,
      ...(clientPagination ? { pagination } : {}),
    },
    onColumnSizingChange: setColumnSizing,
    ...(clientPagination
      ? {
          onPaginationChange: setPagination,
          getPaginationRowModel: getPaginationRowModel(),
        }
      : {}),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="grid min-w-0 max-w-full gap-0">
      <div className="min-w-0 max-w-full overflow-x-auto rounded-md border border-border">
        <Table className="w-auto min-w-full table-fixed">
          <colgroup>
            {table.getAllLeafColumns().map((col) => (
              <col
                key={col.id}
                style={{ width: col.getSize() }}
                className="min-w-0"
              />
            ))}
          </colgroup>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const noTruncate = isNoTruncateColumn(
                    header.column.columnDef.meta,
                  );
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className="group relative p-0"
                      style={{ width: header.getSize(), minWidth: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <>
                          <div
                            className={cn(
                              "flex h-10 min-w-0 w-full max-w-full items-center px-2 pr-3",
                              noTruncate
                                ? "whitespace-nowrap overflow-visible"
                                : "min-w-0 max-w-full truncate",
                            )}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </div>
                          {header.column.getCanResize() ? (
                            <div
                              role="separator"
                              aria-orientation="vertical"
                              aria-label="Resize column"
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              className={cn(
                                "absolute inset-e-0 top-0 z-10 flex h-full w-3 cursor-col-resize touch-manipulation select-none items-center justify-center",
                                "after:h-4 after:w-px after:rounded-full after:bg-border after:opacity-70 after:transition-colors",
                                "hover:after:bg-primary hover:after:opacity-100",
                                "active:after:bg-primary",
                                header.column.getIsResizing() &&
                                  "after:bg-primary after:opacity-100",
                              )}
                            >
                              <span className="sr-only">Resize column</span>
                            </div>
                          ) : null}
                        </>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 overflow-visible whitespace-normal"
                >
                  <div
                    className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
                    role="status"
                    aria-live="polite"
                  >
                    <Spinner aria-hidden />
                    <span>{loadingLabel}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    const noTruncate = isNoTruncateColumn(
                      cell.column.columnDef.meta,
                    );
                    return (
                      <TableCell
                        key={cell.id}
                        className="p-0 align-middle"
                        style={{
                          width: cell.column.getSize(),
                          minWidth: cell.column.getSize(),
                        }}
                      >
                        <div
                          className={cn(
                            "min-w-0 max-w-full p-2",
                            noTruncate
                              ? "whitespace-nowrap overflow-visible"
                              : "truncate",
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center overflow-visible whitespace-normal"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {clientPagination ? (
        <Pagination
          page={table.getState().pagination.pageIndex + 1}
          pageSize={table.getState().pagination.pageSize}
          total={data.length}
          pageSizeOptions={pageSizeOptions}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          onPageSizeChange={(size) => {
            table.setPageSize(size);
            table.setPageIndex(0);
          }}
        />
      ) : null}
    </div>
  );
}
