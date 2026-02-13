"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/tables/data-table";
import { TableDensity } from "@/lib/types/dashboard";

type CoachingFlagRow = {
  aeId: string;
  aeName: string;
  flag: string;
  severity: "low" | "medium" | "high";
  detail: string;
};

const severityVariant: Record<CoachingFlagRow["severity"], "neutral" | "warning" | "danger"> = {
  low: "neutral",
  medium: "warning",
  high: "danger",
};

const columns: ColumnDef<CoachingFlagRow>[] = [
  { accessorKey: "aeName", header: "AE" },
  {
    accessorKey: "flag",
    header: "Flag",
    cell: ({ row }) => row.original.flag.replaceAll("_", " "),
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }) => <Badge variant={severityVariant[row.original.severity]}>{row.original.severity}</Badge>,
  },
  { accessorKey: "detail", header: "Detail" },
];

export function CoachingFlagsTable({ data, density }: { data: CoachingFlagRow[]; density?: TableDensity }) {
  return (
    <DataTable
      tableId="coaching-flags"
      columns={columns}
      data={data}
      searchPlaceholder="Search coaching flags..."
      initialDensity={density}
    />
  );
}
