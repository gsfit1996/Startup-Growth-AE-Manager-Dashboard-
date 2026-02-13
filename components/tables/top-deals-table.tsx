"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/tables/data-table";
import { formatCurrency } from "@/lib/format";
import { TableDensity } from "@/lib/types/dashboard";

type DealRow = {
  id: string;
  deal: string;
  stage: string;
  amount: number;
  closeDate: string;
  confidence: number;
  nextStep: string;
  owner: string;
};

const columns: ColumnDef<DealRow>[] = [
  {
    accessorKey: "deal",
    header: "Deal",
  },
  {
    accessorKey: "stage",
    header: "Stage",
    cell: ({ row }) => <Badge variant="info">{row.original.stage}</Badge>,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(row.original.amount),
  },
  {
    accessorKey: "closeDate",
    header: "Close Date",
  },
  {
    accessorKey: "confidence",
    header: "Confidence",
    cell: ({ row }) => `${(row.original.confidence * 100).toFixed(0)}%`,
  },
  {
    accessorKey: "nextStep",
    header: "Next Step",
  },
  {
    accessorKey: "owner",
    header: "Owner",
  },
];

export function TopDealsTable({ data, density }: { data: DealRow[]; density?: TableDensity }) {
  return (
    <DataTable
      tableId="top-deals"
      columns={columns}
      data={data}
      searchPlaceholder="Search top deals..."
      initialDensity={density}
    />
  );
}
