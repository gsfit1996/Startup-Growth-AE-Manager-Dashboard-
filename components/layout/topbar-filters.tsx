"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

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
    }),
    [searchParams],
  );

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/85 px-4 py-3 backdrop-blur">
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
        <Input
          className="max-w-xs"
          placeholder="Search account, AE, deal"
          value={values.q}
          onChange={(event) => updateParam("q", event.target.value)}
        />
      </div>
    </div>
  );
}
