"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";

type AccountRow = {
  id: string;
  name: string;
  segment: string;
  region: string;
  arr: number;
  renewalDate: string;
  aiMaturity: string;
  healthScore: number;
  owner: string;
  paymentStatus: string;
  openPipeline: number;
  qbrStatus: string;
  accountPlanCompleteness: number;
};

const columns: ColumnDef<AccountRow>[] = [
  {
    accessorKey: "name",
    header: "Account",
    cell: ({ row }) => (
      <Link href={`/accounts/${row.original.id}`} className="font-medium text-teal-300 hover:text-teal-200">
        {row.original.name}
      </Link>
    ),
  },
  { accessorKey: "segment", header: "Segment" },
  { accessorKey: "region", header: "Region" },
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
      <Badge
        variant={row.original.healthScore >= 75 ? "success" : row.original.healthScore >= 60 ? "warning" : "danger"}
      >
        {row.original.healthScore}
      </Badge>
    ),
  },
  { accessorKey: "aiMaturity", header: "AI Maturity" },
  { accessorKey: "owner", header: "Owner" },
  {
    accessorKey: "openPipeline",
    header: "Open Pipeline",
    cell: ({ row }) => formatCurrency(row.original.openPipeline),
  },
  {
    accessorKey: "accountPlanCompleteness",
    header: "Plan %",
    cell: ({ row }) => `${row.original.accountPlanCompleteness}%`,
  },
];

function inArrBand(arr: number, band: string) {
  if (band === "all") return true;
  if (band === "0-50") return arr < 50000;
  if (band === "50-150") return arr >= 50000 && arr < 150000;
  if (band === "150+") return arr >= 150000;
  return true;
}

function inHealthBand(score: number, band: string) {
  if (band === "all") return true;
  if (band === "0-59") return score < 60;
  if (band === "60-74") return score >= 60 && score < 75;
  if (band === "75-100") return score >= 75;
  return true;
}

export function AccountsTable({ data }: { data: AccountRow[] }) {
  const [arrBand, setArrBand] = useState("all");
  const [healthBand, setHealthBand] = useState("all");
  const [renewalMonth, setRenewalMonth] = useState("all");
  const [segment, setSegment] = useState("all");
  const [aiMaturity, setAiMaturity] = useState("all");

  const filtered = useMemo(() => {
    return data.filter((row) => {
      const month = row.renewalDate.slice(5, 7);

      return (
        inArrBand(row.arr, arrBand) &&
        inHealthBand(row.healthScore, healthBand) &&
        (renewalMonth === "all" || renewalMonth === month) &&
        (segment === "all" || row.segment === segment) &&
        (aiMaturity === "all" || row.aiMaturity === aiMaturity)
      );
    });
  }, [data, arrBand, healthBand, renewalMonth, segment, aiMaturity]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Select
          value={arrBand}
          onChange={(event) => setArrBand(event.target.value)}
          options={[
            { value: "all", label: "ARR Band: All" },
            { value: "0-50", label: "< $50k" },
            { value: "50-150", label: "$50k-$150k" },
            { value: "150+", label: ">$150k" },
          ]}
        />
        <Select
          value={healthBand}
          onChange={(event) => setHealthBand(event.target.value)}
          options={[
            { value: "all", label: "Health: All" },
            { value: "0-59", label: "0-59" },
            { value: "60-74", label: "60-74" },
            { value: "75-100", label: "75-100" },
          ]}
        />
        <Select
          value={renewalMonth}
          onChange={(event) => setRenewalMonth(event.target.value)}
          options={[
            { value: "all", label: "Renewal: All" },
            { value: "01", label: "Jan" },
            { value: "02", label: "Feb" },
            { value: "03", label: "Mar" },
            { value: "04", label: "Apr" },
            { value: "05", label: "May" },
            { value: "06", label: "Jun" },
            { value: "07", label: "Jul" },
            { value: "08", label: "Aug" },
            { value: "09", label: "Sep" },
            { value: "10", label: "Oct" },
            { value: "11", label: "Nov" },
            { value: "12", label: "Dec" },
          ]}
        />
        <Select
          value={segment}
          onChange={(event) => setSegment(event.target.value)}
          options={[
            { value: "all", label: "Segment: All" },
            { value: "SEED", label: "Seed" },
            { value: "SERIES_A", label: "Series A" },
            { value: "SERIES_B_PLUS", label: "Series B+" },
          ]}
        />
        <Select
          value={aiMaturity}
          onChange={(event) => setAiMaturity(event.target.value)}
          options={[
            { value: "all", label: "AI Maturity: All" },
            { value: "LOW", label: "Low" },
            { value: "MEDIUM", label: "Medium" },
            { value: "HIGH", label: "High" },
          ]}
        />
      </div>
      <DataTable columns={columns} data={filtered} searchPlaceholder="Search accounts..." />
    </div>
  );
}
