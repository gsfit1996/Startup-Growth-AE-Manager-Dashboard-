"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

type DealDeskRow = {
  id: string;
  deal: string;
  owner: string;
  stage: string;
  amount: number;
  requestedDiscount: number;
  guardrail: string;
  justification: string;
  risk: "low" | "medium" | "high";
  approvalStatus: string;
  recommendedCounter: string;
};

const columns: ColumnDef<DealDeskRow>[] = [
  { accessorKey: "deal", header: "Deal" },
  { accessorKey: "owner", header: "Owner" },
  {
    accessorKey: "stage",
    header: "Stage",
    cell: ({ row }) => row.original.stage.replaceAll("_", " "),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(row.original.amount),
  },
  {
    accessorKey: "requestedDiscount",
    header: "Discount Req",
    cell: ({ row }) => `${(row.original.requestedDiscount * 100).toFixed(1)}%`,
  },
  {
    accessorKey: "guardrail",
    header: "Guardrail",
  },
  {
    accessorKey: "risk",
    header: "Risk",
    cell: ({ row }) => (
      <Badge variant={row.original.risk === "high" ? "danger" : row.original.risk === "medium" ? "warning" : "success"}>
        {row.original.risk}
      </Badge>
    ),
  },
  { accessorKey: "approvalStatus", header: "Approval" },
  { accessorKey: "recommendedCounter", header: "Recommended Counter" },
];

export function DealDeskTable({ data }: { data: DealDeskRow[] }) {
  return <DataTable columns={columns} data={data} searchPlaceholder="Search deal desk..." />;
}
