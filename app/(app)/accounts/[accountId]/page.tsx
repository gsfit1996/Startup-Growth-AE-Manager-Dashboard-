import Link from "next/link";
import { notFound } from "next/navigation";

import { AccountPlanEditor } from "@/components/account-plan-editor";
import { UsageTrendChart } from "@/components/charts/usage-trend-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { healthBreakdownRows, getAccountDetail } from "@/lib/dashboard-data";
import { formatCurrency } from "@/lib/format";

export default async function AccountDetailPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  const account = await getAccountDetail(accountId);

  if (!account) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Account Detail</p>
          <h1 className="text-2xl font-semibold text-slate-100">{account.name}</h1>
          <p className="text-sm text-slate-400">
            {account.segment} â€¢ {account.region} â€¢ Owner {account.owner}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/accounts">Back to Accounts</Link>
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>ARR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatCurrency(account.arr)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Renewal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{account.renewalDate}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AI Maturity</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="info">{account.aiMaturity}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-teal-300">{Math.round(account.health.weightedScore)}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Usage Trend (API Calls / Seats)</CardTitle>
          </CardHeader>
          <CardContent>
            <UsageTrendChart data={account.usageMetrics} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            {healthBreakdownRows(account.health).map((item) => (
              <div key={item.metric} className="flex justify-between">
                <span>{item.metric}</span>
                <span>
                  {item.value.toFixed(0)} ({item.weight})
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stakeholder Map</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {account.stakeholders.map((stakeholder) => (
              <div key={stakeholder.id} className="rounded-md border border-slate-800 p-2 text-sm text-slate-300">
                <p className="font-medium text-slate-100">{stakeholder.name}</p>
                <p>
                  {stakeholder.role} â€¢ {stakeholder.seniority}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last QBR Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {account.qbrs.map((qbr) => (
              <div key={qbr.id} className="rounded-md border border-slate-800 p-3 text-sm text-slate-300">
                <p className="font-medium text-slate-100">
                  {qbr.quarter} â€¢ {qbr.status}
                </p>
                <p className="mt-1">{qbr.notes}</p>
                <p className="mt-1 text-xs text-slate-400">Next: {qbr.nextSteps}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Open Risks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {account.risks.map((risk) => (
              <div key={risk.id} className="rounded-md border border-slate-800 p-3 text-sm text-slate-300">
                <p>
                  {risk.date} â€¢ {risk.severity} â€¢ {risk.status}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {account.nextActions.map((action) => (
              <div key={action.id} className="rounded-md border border-slate-800 p-3 text-sm text-slate-300">
                <p className="font-medium text-slate-100">{action.stage.replaceAll("_", " ")}</p>
                <p>{action.nextStep}</p>
                <p className="text-xs text-slate-400">
                  Close {action.closeDate} â€¢ {formatCurrency(action.amount)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <AccountPlanEditor
        accountId={account.id}
        initialPlan={
          account.plan
            ? {
                businessGoals: account.plan.businessGoals,
                successMetrics: account.plan.successMetrics,
                stakeholderMap: account.plan.stakeholderMap,
                riskLog: account.plan.riskLog,
                expansionHypothesis: account.plan.expansionHypothesis,
                execAlignmentDate: account.plan.execAlignmentDate?.toISOString().slice(0, 10) ?? null,
                nextQbrDate: account.plan.nextQbrDate?.toISOString().slice(0, 10) ?? null,
              }
            : null
        }
      />
    </div>
  );
}
