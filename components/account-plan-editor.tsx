"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

type AccountPlan = {
  businessGoals: string;
  successMetrics: string;
  stakeholderMap: string;
  riskLog: string;
  expansionHypothesis: string;
  execAlignmentDate: string | null;
  nextQbrDate: string | null;
};

function completenessScore(plan: AccountPlan) {
  const fields = [
    plan.businessGoals,
    plan.successMetrics,
    plan.stakeholderMap,
    plan.riskLog,
    plan.expansionHypothesis,
    plan.execAlignmentDate ?? "",
    plan.nextQbrDate ?? "",
  ];

  const complete = fields.filter((field) => field.trim().length > 0).length;
  return Math.round((complete / fields.length) * 100);
}

export function AccountPlanEditor({ accountId, initialPlan }: { accountId: string; initialPlan: AccountPlan | null }) {
  const [plan, setPlan] = useState<AccountPlan>(
    initialPlan ?? {
      businessGoals: "",
      successMetrics: "",
      stakeholderMap: "",
      riskLog: "",
      expansionHypothesis: "",
      execAlignmentDate: null,
      nextQbrDate: null,
    },
  );
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<{ updatedAt: string; completenessScore: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const firstRender = useRef(true);

  const localCompleteness = useMemo(() => completenessScore(plan), [plan]);

  async function savePlan() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/accounts/${accountId}/plan`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(plan),
      });

      if (!response.ok) {
        throw new Error("Unable to save account plan.");
      }

      const payload = await response.json();
      setSaved(payload);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Save failed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      void savePlan();
    }, 700);

    return () => clearTimeout(timeout);
  }, [plan]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <CardTitle>Account Plan</CardTitle>
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-[color:var(--muted)]">
              <span>Completeness</span>
              <span>{(saved?.completenessScore ?? localCompleteness).toFixed(0)}%</span>
            </div>
            <Progress value={saved?.completenessScore ?? localCompleteness} tone={localCompleteness >= 70 ? "teal" : "amber"} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="space-y-1 text-xs text-[color:var(--muted)]">
          Business Goals
          <Textarea
            value={plan.businessGoals}
            onChange={(event) => setPlan((current) => ({ ...current, businessGoals: event.target.value }))}
          />
        </label>
        <label className="space-y-1 text-xs text-[color:var(--muted)]">
          Success Metrics
          <Textarea
            value={plan.successMetrics}
            onChange={(event) => setPlan((current) => ({ ...current, successMetrics: event.target.value }))}
          />
        </label>
        <label className="space-y-1 text-xs text-[color:var(--muted)]">
          Stakeholder Map
          <Textarea
            value={plan.stakeholderMap}
            onChange={(event) => setPlan((current) => ({ ...current, stakeholderMap: event.target.value }))}
          />
        </label>
        <label className="space-y-1 text-xs text-[color:var(--muted)]">
          Risk Log
          <Textarea
            value={plan.riskLog}
            onChange={(event) => setPlan((current) => ({ ...current, riskLog: event.target.value }))}
          />
        </label>
        <label className="space-y-1 text-xs text-[color:var(--muted)]">
          Expansion Hypothesis
          <Textarea
            value={plan.expansionHypothesis}
            onChange={(event) => setPlan((current) => ({ ...current, expansionHypothesis: event.target.value }))}
          />
        </label>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <label className="space-y-1 text-xs text-[color:var(--muted)]">
            Exec Alignment Date
            <Input
              type="date"
              value={plan.execAlignmentDate ?? ""}
              onChange={(event) => setPlan((current) => ({ ...current, execAlignmentDate: event.target.value }))}
            />
          </label>
          <label className="space-y-1 text-xs text-[color:var(--muted)]">
            Next QBR Date
            <Input
              type="date"
              value={plan.nextQbrDate ?? ""}
              onChange={(event) => setPlan((current) => ({ ...current, nextQbrDate: event.target.value }))}
            />
          </label>
        </div>
        <div className="flex items-center justify-between gap-3">
          <Button onClick={savePlan} disabled={loading}>
            {loading ? "Saving..." : "Save Now"}
          </Button>
          <div className="text-right text-xs text-[color:var(--muted)]">
            {saved ? <p>Autosaved at {new Date(saved.updatedAt).toLocaleString()}</p> : <p>Autosave after edits.</p>}
            {error ? <p className="text-[color:var(--accent-risk)]">{error}</p> : null}
          </div>
        </div>
        <p className="text-xs text-[color:var(--muted)]">
          Deployed demo note: updates persist per warm server instance and may reset after cold starts.
        </p>
      </CardContent>
    </Card>
  );
}
