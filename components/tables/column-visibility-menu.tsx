"use client";

import { Table as TableInstance } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";

export function ColumnVisibilityMenu<TData>({ table }: { table: TableInstance<TData> }) {
  const hideableColumns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide() && column.id !== "select");

  if (!hideableColumns.length) {
    return null;
  }

  return (
    <details className="neo-pill relative px-2 py-1 text-xs text-[color:var(--muted)]">
      <summary className="cursor-pointer list-none hover:text-[color:var(--foreground)]">Columns</summary>
      <div className="neo-panel absolute right-0 z-10 mt-2 w-56 space-y-1 rounded-lg p-2">
        {hideableColumns.map((column) => (
          <label key={column.id} className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-white/[0.04]">
            <Checkbox
              checked={column.getIsVisible()}
              onChange={(event) => column.toggleVisibility(event.target.checked)}
            />
            <span className="text-xs text-[color:var(--foreground)]">{column.id.replaceAll("_", " ")}</span>
          </label>
        ))}
      </div>
    </details>
  );
}

