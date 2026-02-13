import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function KpiCard({
  label,
  value,
  delta,
  helper,
  trend,
}: {
  label: string;
  value: string;
  delta?: number;
  helper?: string;
  trend?: number[];
}) {
  const positive = (delta ?? 0) >= 0;
  const trendValues = trend && trend.length >= 2 ? trend : null;

  function sparklinePath(values: number[]) {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    return values
      .map((item, index) => {
        const x = (index / (values.length - 1)) * 100;
        const y = 32 - ((item - min) / range) * 28;
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-[color:var(--foreground)]">{value}</p>
        {typeof delta === "number" ? (
          <div className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${positive ? "bg-emerald-500/10 text-emerald-300" : "bg-[color:var(--accent-risk)]/10 text-[color:var(--accent-risk)]"}`}>
            {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(delta).toFixed(1)}% vs last quarter
          </div>
        ) : null}
        {helper ? <CardDescription className="mt-1">{helper}</CardDescription> : null}
        {trendValues ? (
          <div className="mt-3">
            <svg viewBox="0 0 100 36" className="h-9 w-full">
              <path d={sparklinePath(trendValues)} fill="none" stroke="var(--accent-teal)" strokeWidth="2.1" />
            </svg>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
