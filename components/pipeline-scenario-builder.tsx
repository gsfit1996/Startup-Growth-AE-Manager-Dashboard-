"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";

type ScenarioBuilderProps = {
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  stageDefaults: Record<string, number>;
  base: {
    commit: number;
    bestCase: number;
    upside: number;
  };
};

type ScenarioResult = {
  commit: number;
  bestCase: number;
  upside: number;
};

export function ForecastScenarioBuilder({ quarter, stageDefaults, base }: ScenarioBuilderProps) {
  const [overrides, setOverrides] = useState(stageDefaults);
  const [result, setResult] = useState<ScenarioResult>(base);
  const [loading, setLoading] = useState(false);

  const stages = useMemo(() => Object.keys(overrides), [overrides]);

  async function runScenario() {
    setLoading(true);
    try {
      const response = await fetch("/api/pipeline/scenario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quarter, stageProbabilityOverrides: overrides }),
      });

      const payload = await response.json();
      setResult(payload);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forecast Scenario Builder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
          {stages.map((stage) => (
            <label key={stage} className="space-y-1 text-xs text-slate-400">
              {stage.replaceAll("_", " ")} Probability
              <Input
                type="number"
                min={0}
                max={100}
                value={overrides[stage]}
                onChange={(event) =>
                  setOverrides((current) => ({
                    ...current,
                    [stage]: Number(event.target.value),
                  }))
                }
              />
            </label>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={runScenario} disabled={loading}>
            {loading ? "Calculating..." : "Recalculate"}
          </Button>
          <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
            <p>Commit: {formatCurrency(result.commit)}</p>
            <p>Best Case: {formatCurrency(result.bestCase)}</p>
            <p>Upside: {formatCurrency(result.upside)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
