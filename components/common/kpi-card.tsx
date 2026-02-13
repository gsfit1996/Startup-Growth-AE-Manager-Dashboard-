import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function KpiCard({
  label,
  value,
  delta,
  helper,
}: {
  label: string;
  value: string;
  delta?: number;
  helper?: string;
}) {
  const positive = (delta ?? 0) >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-slate-100">{value}</p>
        {typeof delta === "number" ? (
          <div className={`mt-1 flex items-center gap-1 text-xs ${positive ? "text-emerald-300" : "text-red-300"}`}>
            {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(delta).toFixed(1)}% vs last quarter
          </div>
        ) : null}
        {helper ? <CardDescription className="mt-1">{helper}</CardDescription> : null}
      </CardContent>
    </Card>
  );
}
