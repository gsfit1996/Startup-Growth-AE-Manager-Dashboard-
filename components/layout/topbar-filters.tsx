"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef } from "react";
import { FilterX, RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function TopbarFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const values = useMemo(
    () => ({
      quarter: searchParams.get("quarter") ?? "Q1",
      segment: searchParams.get("segment") ?? "all",
      region: searchParams.get("region") ?? "all",
      q: searchParams.get("q") ?? "",
      density: searchParams.get("density") ?? "comfortable",
    }),
    [searchParams],
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    router.push(pathname);
  }

  function restoreDefaults() {
    const params = new URLSearchParams();
    params.set("quarter", "Q1");
    params.set("segment", "all");
    params.set("region", "all");
    params.set("density", "comfortable");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:var(--base-1)]/88 px-4 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            className="w-28"
            value={values.quarter}
            onChange={(event) => updateParam("quarter", event.target.value)}
            options={[
              { value: "Q1", label: "Q1" },
              { value: "Q2", label: "Q2" },
              { value: "Q3", label: "Q3" },
              { value: "Q4", label: "Q4" },
            ]}
          />
          <Select
            className="w-40"
            value={values.segment}
            onChange={(event) => updateParam("segment", event.target.value)}
            options={[
              { value: "all", label: "All Segments" },
              { value: "seed", label: "Seed" },
              { value: "series_a", label: "Series A" },
              { value: "series_b_plus", label: "Series B+" },
            ]}
          />
          <Select
            className="w-36"
            value={values.region}
            onChange={(event) => updateParam("region", event.target.value)}
            options={[
              { value: "all", label: "All Regions" },
              { value: "emea", label: "EMEA" },
              { value: "na", label: "NA" },
              { value: "apac", label: "APAC" },
            ]}
          />
          <Select
            className="w-40"
            value={values.density}
            onChange={(event) => updateParam("density", event.target.value)}
            options={[
              { value: "comfortable", label: "Density: Comfortable" },
              { value: "compact", label: "Density: Compact" },
            ]}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-[color:var(--muted)]" />
            <Input
              key={values.q}
              className="w-64 pl-8"
              placeholder="Search account, AE, deal"
              defaultValue={values.q}
              onChange={(event) => {
                if (debounceRef.current) {
                  clearTimeout(debounceRef.current);
                }

                const nextValue = event.target.value;
                debounceRef.current = setTimeout(() => {
                  updateParam("q", nextValue);
                }, 260);
              }}
              aria-label="Global search"
            />
          </div>
          <Button variant="outline" size="sm" onClick={restoreDefaults}>
            <RotateCcw className="h-3.5 w-3.5" />
            Defaults
          </Button>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <FilterX className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
