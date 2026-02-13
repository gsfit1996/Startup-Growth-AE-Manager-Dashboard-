"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

import { AccountPreviewDrawer } from "@/components/accounts/account-preview-drawer";
import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import { TableDensity } from "@/lib/types/dashboard";

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

type SavedAccountView = {
  id: string;
  name: string;
  arrBand: string;
  healthBand: string;
  renewalMonth: string;
  segment: string;
  aiMaturity: string;
};

const VIEW_STORAGE_KEY = "sgam.accounts.savedViews";

function buildColumns(onPreview: (row: AccountRow) => void): ColumnDef<AccountRow>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onChange={(event) => table.toggleAllPageRowsSelected(event.target.checked)}
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onChange={(event) => row.toggleSelected(event.target.checked)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Account",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[color:var(--border)] text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
            onClick={() => onPreview(row.original)}
            aria-label={`Preview ${row.original.name}`}
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <Link href={`/accounts/${row.original.id}`} className="font-medium text-[color:var(--accent-teal)] hover:underline">
            {row.original.name}
          </Link>
        </div>
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
}

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

function loadSavedViews() {
  if (typeof window === "undefined") {
    return [] as SavedAccountView[];
  }

  const raw = window.localStorage.getItem(VIEW_STORAGE_KEY);
  if (!raw) return [] as SavedAccountView[];

  try {
    return JSON.parse(raw) as SavedAccountView[];
  } catch {
    return [] as SavedAccountView[];
  }
}

export function AccountsTable({ data, density }: { data: AccountRow[]; density?: TableDensity }) {
  const [arrBand, setArrBand] = useState("all");
  const [healthBand, setHealthBand] = useState("all");
  const [renewalMonth, setRenewalMonth] = useState("all");
  const [segment, setSegment] = useState("all");
  const [aiMaturity, setAiMaturity] = useState("all");
  const [savedViews, setSavedViews] = useState<SavedAccountView[]>(() => loadSavedViews());
  const [selectedRows, setSelectedRows] = useState<AccountRow[]>([]);
  const [preview, setPreview] = useState<AccountRow | null>(null);

  const columns = useMemo(() => buildColumns((row) => setPreview(row)), []);

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

  function saveCurrentView() {
    const name = window.prompt("View name");
    if (!name) return;

    const nextView: SavedAccountView = {
      id: `view-${Date.now()}`,
      name,
      arrBand,
      healthBand,
      renewalMonth,
      segment,
      aiMaturity,
    };

    const next = [...savedViews, nextView];
    setSavedViews(next);
    window.localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(next));
  }

  function applySavedView(id: string) {
    if (id === "") return;
    const view = savedViews.find((item) => item.id === id);
    if (!view) return;

    setArrBand(view.arrBand);
    setHealthBand(view.healthBand);
    setRenewalMonth(view.renewalMonth);
    setSegment(view.segment);
    setAiMaturity(view.aiMaturity);
  }

  function applyPreset(type: "risk" | "renewals" | "expansion") {
    if (type === "risk") {
      setHealthBand("0-59");
      setRenewalMonth("all");
      return;
    }
    if (type === "renewals") {
      setHealthBand("all");
      const nextMonth = String(new Date().getMonth() + 1).padStart(2, "0");
      setRenewalMonth(nextMonth);
      return;
    }

    setArrBand("150+");
    setHealthBand("60-74");
    setRenewalMonth("all");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => applyPreset("risk")}>
          At-Risk Focus
        </Button>
        <Button size="sm" variant="outline" onClick={() => applyPreset("renewals")}>
          Renewal This Month
        </Button>
        <Button size="sm" variant="outline" onClick={() => applyPreset("expansion")}>
          Expansion Targets
        </Button>
      </div>

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
        <Select
          value=""
          onChange={(event) => applySavedView(event.target.value)}
          options={[
            { value: "", label: "Saved Views" },
            ...savedViews.map((view) => ({ value: view.id, label: view.name })),
          ]}
        />
        <Button size="sm" variant="outline" onClick={saveCurrentView}>
          Save View
        </Button>
      </div>

      {selectedRows.length > 0 ? (
        <div className="neo-panel flex flex-wrap items-center justify-between gap-2 rounded-lg p-2 text-xs text-[color:var(--muted)]">
          <span>{selectedRows.length} accounts selected</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">Schedule QBR</Button>
            <Button size="sm" variant="outline">Exec Sponsor</Button>
            <Button size="sm" variant="outline">Offer Training</Button>
          </div>
        </div>
      ) : null}

      <DataTable
        tableId="accounts"
        columns={columns}
        data={filtered}
        searchPlaceholder="Search accounts..."
        initialDensity={density}
        enableRowSelection
        onSelectionChange={(rows) => setSelectedRows(rows)}
      />

      <AccountPreviewDrawer account={preview} open={!!preview} onOpenChange={(value) => !value && setPreview(null)} />
    </div>
  );
}
