"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TableToolbar } from "@/components/tables/table-toolbar";
import { TableDensity } from "@/lib/types/dashboard";
import { parseTableView, serializeTableView, TableViewState } from "@/lib/table-view";

type StoredTableView = TableViewState;

type DataTableProps<TData, TValue> = {
  tableId: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  initialDensity?: TableDensity;
  enableRowSelection?: boolean;
  onSelectionChange?: (rows: TData[]) => void;
  getRowClassName?: (row: TData) => string;
};

function storageKey(tableId: string) {
  return `sgam.table.${tableId}.view`;
}

function readStoredView(tableId: string): StoredTableView | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(storageKey(tableId));
  return parseTableView(raw);
}

export function DataTable<TData, TValue>({
  tableId,
  columns,
  data,
  searchPlaceholder = "Search...",
  globalFilter,
  onGlobalFilterChange,
  initialDensity = "comfortable",
  enableRowSelection = false,
  onSelectionChange,
  getRowClassName,
}: DataTableProps<TData, TValue>) {
  const stored = React.useMemo(() => readStoredView(tableId), [tableId]);
  const [sorting, setSorting] = React.useState<SortingState>(stored?.sorting ?? []);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(stored?.columnVisibility ?? {});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [internalGlobalFilter, setInternalGlobalFilter] = React.useState(stored?.globalFilter ?? "");
  const [density, setDensity] = React.useState<TableDensity>(stored?.density ?? initialDensity);

  const effectiveFilter = globalFilter ?? internalGlobalFilter;

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: (value) => {
      const nextValue = String(value);
      if (onGlobalFilterChange) {
        onGlobalFilterChange(nextValue);
      } else {
        setInternalGlobalFilter(nextValue);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter: effectiveFilter,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection,
  });

  React.useEffect(() => {
    if (!onSelectionChange) return;
    const selected = table.getSelectedRowModel().rows.map((row) => row.original);
    onSelectionChange(selected);
  }, [rowSelection, onSelectionChange, table]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const payload: StoredTableView = {
      density,
      globalFilter: effectiveFilter,
      pageSize: table.getState().pagination.pageSize,
      sorting,
      columnVisibility,
    };
    window.localStorage.setItem(storageKey(tableId), serializeTableView(payload));
  }, [tableId, density, effectiveFilter, sorting, columnVisibility, table]);

  React.useEffect(() => {
    if (stored?.pageSize) {
      table.setPageSize(stored.pageSize);
    }
  }, [stored?.pageSize, table]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          value={effectiveFilter}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          placeholder={searchPlaceholder}
          className="max-w-sm"
        />
        <TableToolbar table={table} density={density} setDensity={setDensity} />
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-[color:var(--muted)]">
        {effectiveFilter ? (
          <button
            type="button"
            onClick={() => table.setGlobalFilter("")}
            className="neo-pill px-2 py-1 hover:text-[color:var(--foreground)]"
          >
            Search: {effectiveFilter} (clear)
          </button>
        ) : null}
        {columnFilters.length > 0 ? <span className="neo-pill px-2 py-1">Active filters: {columnFilters.length}</span> : null}
        <span className="neo-pill px-2 py-1">Rows: {table.getFilteredRowModel().rows.length}</span>
      </div>

      <div className="overflow-auto rounded-lg border border-[color:var(--border)]">
        <Table className="table-sticky-head table-sticky-first">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortState = header.column.getIsSorted();
                  const sortIcon =
                    sortState === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : sortState === "desc" ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUpDown className="h-3.5 w-3.5 opacity-55" />;

                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1.5 hover:text-[color:var(--foreground)]"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortIcon}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className={getRowClassName ? getRowClassName(row.original) : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={density === "compact" ? "py-1.5" : "py-2.5"}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="h-24 text-center text-[color:var(--muted)]" colSpan={columns.length}>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-[color:var(--muted)]">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={table.getState().pagination.pageSize}
            onChange={(event) => table.setPageSize(Number(event.target.value))}
            className="neo-focus h-8 rounded-md border border-[color:var(--border)] bg-[color:var(--surface-0)] px-2 text-xs text-[color:var(--foreground)]"
          >
            {[10, 20, 30, 50].map((size) => (
              <option key={size} value={size}>
                {size}/page
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
