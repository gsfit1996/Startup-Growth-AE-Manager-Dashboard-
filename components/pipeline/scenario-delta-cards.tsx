import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

type ScenarioDeltaCardsProps = {
  base: {
    commit: number;
    bestCase: number;
    upside: number;
  };
  result: {
    commit: number;
    bestCase: number;
    upside: number;
  };
};

function delta(current: number, baseline: number) {
  if (baseline === 0) return 0;
  return ((current - baseline) / baseline) * 100;
}

export function ScenarioDeltaCards({ base, result }: ScenarioDeltaCardsProps) {
  const rows = [
    { label: "Commit", baseline: base.commit, current: result.commit },
    { label: "Best Case", baseline: base.bestCase, current: result.bestCase },
    { label: "Upside", baseline: base.upside, current: result.upside },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {rows.map((row) => {
        const change = delta(row.current, row.baseline);
        const positive = change >= 0;
        return (
          <Card key={row.label}>
            <CardHeader>
              <CardTitle>{row.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{formatCurrency(row.current)}</p>
              <p className={`text-xs ${positive ? "text-emerald-300" : "text-[color:var(--accent-risk)]"}`}>
                {positive ? "+" : ""}
                {change.toFixed(1)}% vs baseline
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

