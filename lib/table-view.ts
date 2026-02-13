import { SortingState, VisibilityState } from "@tanstack/react-table";

import { TableDensity } from "@/lib/types/dashboard";

export type TableViewState = {
  density: TableDensity;
  globalFilter: string;
  pageSize: number;
  sorting: SortingState;
  columnVisibility: VisibilityState;
};

export function parseTableView(raw: string | null): TableViewState | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as TableViewState;
    if (parsed.density !== "compact" && parsed.density !== "comfortable") return null;
    if (typeof parsed.globalFilter !== "string") return null;
    if (typeof parsed.pageSize !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function serializeTableView(view: TableViewState): string {
  return JSON.stringify(view);
}

export function resolveDensity(requested: string | null | undefined, fallback: TableDensity = "comfortable"): TableDensity {
  return requested === "compact" || requested === "comfortable" ? requested : fallback;
}

