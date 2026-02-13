"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

  async function savePlan() {
    setLoading(true);

    try {
      const response = await fetch(`/api/accounts/${accountId}/plan`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(plan),
      });

      const payload = await response.json();
      setSaved(payload);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="space-y-1 text-xs text-slate-400">
          Business Goals
          <Textarea
            value={plan.businessGoals}
            onChange={(event) => setPlan((current) => ({ ...current, businessGoals: event.target.value }))}
          />
        </label>
        <label className="space-y-1 text-xs text-slate-400">
          Success Metrics
          <Textarea
            value={plan.successMetrics}
            onChange={(event) => setPlan((current) => ({ ...current, successMetrics: event.target.value }))}
          />
        </label>
        <label className="space-y-1 text-xs text-slate-400">
          Stakeholder Map
          <Textarea
            value={plan.stakeholderMap}
            onChange={(event) => setPlan((current) => ({ ...current, stakeholderMap: event.target.value }))}
          />
        </label>
        <label className="space-y-1 text-xs text-slate-400">
          Risk Log
          <Textarea
            value={plan.riskLog}
            onChange={(event) => setPlan((current) => ({ ...current, riskLog: event.target.value }))}
          />
        </label>
        <label className="space-y-1 text-xs text-slate-400">
          Expansion Hypothesis
          <Textarea
            value={plan.expansionHypothesis}
            onChange={(event) => setPlan((current) => ({ ...current, expansionHypothesis: event.target.value }))}
          />
        </label>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <label className="space-y-1 text-xs text-slate-400">
            Exec Alignment Date
            <Input
              type="date"
              value={plan.execAlignmentDate ?? ""}
              onChange={(event) => setPlan((current) => ({ ...current, execAlignmentDate: event.target.value }))}
            />
          </label>
          <label className="space-y-1 text-xs text-slate-400">
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
            {loading ? "Saving..." : "Save Account Plan"}
          </Button>
          {saved ? (
            <p className="text-xs text-emerald-300">
              Saved ({saved.completenessScore}% complete) at {new Date(saved.updatedAt).toLocaleString()}
            </p>
          ) : null}
        </div>
        <p className="text-xs text-slate-500">
          Deployed demo note: updates persist per warm server instance and may reset after cold starts.
        </p>
      </CardContent>
    </Card>
  );
}
