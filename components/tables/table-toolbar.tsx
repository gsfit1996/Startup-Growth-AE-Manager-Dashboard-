"use client";

import { Table as TableInstance } from "@tanstack/react-table";

import { ColumnVisibilityMenu } from "@/components/tables/column-visibility-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableDensity } from "@/lib/types/dashboard";

export function TableToolbar<TData>({
  table,
  density,
  setDensity,
}: {
  table: TableInstance<TData>;
  density: TableDensity;
  setDensity: (value: TableDensity) => void;
}) {
  const selectedCount = table.getSelectedRowModel().rows.length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDensity(density === "compact" ? "comfortable" : "compact")}
      >
        Density: {density === "compact" ? "Compact" : "Comfortable"}
      </Button>

      <ColumnVisibilityMenu table={table} />

      {selectedCount > 0 ? (
        <>
          <Badge variant="info">{selectedCount} selected</Badge>
          <Button variant="outline" size="sm" onClick={() => table.resetRowSelection()}>
            Clear Selection
          </Button>
        </>
      ) : null}
    </div>
  );
}

