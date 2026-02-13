"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/tables/data-table";
import { formatCurrency, formatRatio } from "@/lib/format";

type LeaderboardRow = {
  aeId: string;
  aeName: string;
  region: string;
  expansionARR: number;
  retentionARR: number;
  winRate: number;
  cycleDays: number;
  activityVolume: number;
  pipelineCoverage: number;
};

const columns: ColumnDef<LeaderboardRow>[] = [
  { accessorKey: "aeName", header: "AE" },
  { accessorKey: "region", header: "Region" },
  {
    accessorKey: "expansionARR",
    header: "Expansion ARR",
    cell: ({ row }) => formatCurrency(row.original.expansionARR),
  },
  {
    accessorKey: "retentionARR",
    header: "Retention ARR",
    cell: ({ row }) => formatCurrency(row.original.retentionARR),
  },
  {
    accessorKey: "winRate",
    header: "Win Rate",
    cell: ({ row }) => `${row.original.winRate.toFixed(1)}%`,
  },
  {
    accessorKey: "cycleDays",
    header: "Cycle Time",
    cell: ({ row }) => `${row.original.cycleDays.toFixed(0)}d`,
  },
  {
    accessorKey: "activityVolume",
    header: "Activity",
  },
  {
    accessorKey: "pipelineCoverage",
    header: "Coverage",
    cell: ({ row }) => formatRatio(row.original.pipelineCoverage),
  },
];

export function TeamLeaderboardTable({ data }: { data: LeaderboardRow[] }) {
  return <DataTable columns={columns} data={data} searchPlaceholder="Search AEs..." />;
}
