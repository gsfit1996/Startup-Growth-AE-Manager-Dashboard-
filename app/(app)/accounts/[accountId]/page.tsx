import Link from "next/link";
import { notFound } from "next/navigation";

import { AccountPlanEditor } from "@/components/account-plan-editor";
import { AccountTabs } from "@/components/accounts/account-tabs";
import { StakeholderMatrix } from "@/components/accounts/stakeholder-matrix";
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">Account Detail</p>
          <h1 className="text-2xl font-semibold text-[color:var(--foreground)]">{account.name}</h1>
          <p className="text-sm text-[color:var(--muted)]">
            {account.segment} | {account.region} | Owner {account.owner}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/accounts">Back to Accounts</Link>
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-4" data-reveal="true">
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
            <p className="text-2xl font-semibold text-[color:var(--accent-teal)]">{Math.round(account.health.weightedScore)}</p>
          </CardContent>
        </Card>
      </section>

      <section data-reveal="true">
        <AccountTabs
          overview={
            <div className="space-y-4">
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
                <CardContent className="space-y-2 text-sm text-[color:var(--muted)]">
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
            </div>
          }
          stakeholders={
            <StakeholderMatrix
              stakeholders={account.stakeholders.map((stakeholder) => ({
                id: stakeholder.id,
                name: stakeholder.name,
                role: stakeholder.role,
                seniority: stakeholder.seniority,
              }))}
            />
          }
          risks={
            <div className="grid gap-4 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Open Risks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {account.risks.length === 0 ? (
                    <p className="text-sm text-[color:var(--muted)]">No current open risks.</p>
                  ) : (
                    account.risks.map((risk) => (
                      <div key={risk.id} className="rounded-md border border-[color:var(--border)] p-3 text-sm text-[color:var(--muted)]">
                        <p>
                          {risk.date} | {risk.severity} | {risk.status}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Next Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {account.nextActions.map((action) => (
                    <div key={action.id} className="rounded-md border border-[color:var(--border)] p-3 text-sm text-[color:var(--muted)]">
                      <p className="font-medium text-[color:var(--foreground)]">{action.stage.replaceAll("_", " ")}</p>
                      <p>{action.nextStep}</p>
                      <p className="text-xs text-[color:var(--muted)]">
                        Close {action.closeDate} | {formatCurrency(action.amount)}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle>Last QBR Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {account.qbrs.map((qbr) => (
                    <div key={qbr.id} className="rounded-md border border-[color:var(--border)] p-3 text-sm text-[color:var(--muted)]">
                      <p className="font-medium text-[color:var(--foreground)]">
                        {qbr.quarter} | {qbr.status}
                      </p>
                      <p className="mt-1">{qbr.notes}</p>
                      <p className="mt-1 text-xs">Next: {qbr.nextSteps}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          }
          plan={
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
          }
        />
      </section>
    </div>
  );
}
