"use client";

import { useMemo, useState } from "react";

import { ProbabilitySlider } from "@/components/pipeline/probability-slider";
import { ScenarioDeltaCards } from "@/components/pipeline/scenario-delta-cards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { applyScenarioPreset } from "@/lib/pipeline-scenario";
import { ScenarioPreset } from "@/lib/types/dashboard";

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

const stageHints: Record<string, string> = {
  PROSPECT: "Early qualification confidence",
  DISCOVERY: "Problem validation strength",
  TECH_EVAL: "Technical fit and urgency",
  PROPOSAL: "Commercial alignment",
  NEGOTIATION: "Procurement and terms confidence",
  LEGAL: "Contract execution confidence",
};

export function ForecastScenarioBuilder({ quarter, stageDefaults, base }: ScenarioBuilderProps) {
  const [overrides, setOverrides] = useState(stageDefaults);
  const [result, setResult] = useState<ScenarioResult>(base);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stages = useMemo(() => Object.keys(overrides), [overrides]);

  function applyPreset(preset: ScenarioPreset) {
    setOverrides(applyScenarioPreset(stageDefaults, preset));
  }

  async function runScenario() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/pipeline/scenario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quarter, stageProbabilityOverrides: overrides }),
      });

      if (!response.ok) {
        throw new Error("Scenario calculation failed.");
      }

      const payload = await response.json();
      setResult(payload);
    } catch (scenarioError) {
      setError(scenarioError instanceof Error ? scenarioError.message : "Scenario calculation failed.");
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
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => applyPreset("conservative")}>Conservative</Button>
          <Button variant="outline" size="sm" onClick={() => applyPreset("current")}>Current</Button>
          <Button variant="outline" size="sm" onClick={() => applyPreset("aggressive")}>Aggressive</Button>
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
          {stages.map((stage) => (
            <ProbabilitySlider
              key={stage}
              label={stage.replaceAll("_", " ")}
              hint={stageHints[stage] ?? "Stage confidence"}
              value={overrides[stage]}
              onChange={(value) =>
                setOverrides((current) => ({
                  ...current,
                  [stage]: value,
                }))
              }
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={runScenario} disabled={loading}>
            {loading ? "Calculating..." : "Recalculate"}
          </Button>
          {error ? <p className="text-xs text-[color:var(--accent-risk)]">{error}</p> : null}
        </div>

        <ScenarioDeltaCards base={base} result={result} />
      </CardContent>
    </Card>
  );
}
