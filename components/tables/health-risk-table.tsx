"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/data-table";
import { formatCurrency } from "@/lib/format";
import { TableDensity } from "@/lib/types/dashboard";

type HealthRow = {
  accountId: string;
  account: string;
  owner: string;
  arr: number;
  renewalDate: string;
  healthScore: number;
  healthBand: "healthy" | "watch" | "risk";
  actions: string[];
};

const bandVariant: Record<HealthRow["healthBand"], "success" | "warning" | "danger"> = {
  healthy: "success",
  watch: "warning",
  risk: "danger",
};

const columns: ColumnDef<HealthRow>[] = [
  { accessorKey: "account", header: "Account" },
  { accessorKey: "owner", header: "Owner" },
  {
    accessorKey: "arr",
    header: "ARR",
    cell: ({ row }) => formatCurrency(row.original.arr),
  },
  { accessorKey: "renewalDate", header: "Renewal" },
  {
    accessorKey: "healthScore",
    header: "Health",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span>{row.original.healthScore}</span>
        <Badge variant={bandVariant[row.original.healthBand]}>{row.original.healthBand}</Badge>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Action Plan",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.actions.slice(0, 3).map((action) => (
          <Button key={action} size="sm" variant="outline" className="text-[11px]">
            {action}
          </Button>
        ))}
      </div>
    ),
  },
];

export function HealthRiskTable({ data, density }: { data: HealthRow[]; density?: TableDensity }) {
  return (
    <DataTable
      tableId="health-risk"
      columns={columns}
      data={data}
      searchPlaceholder="Search at-risk accounts..."
      initialDensity={density}
    />
  );
}
