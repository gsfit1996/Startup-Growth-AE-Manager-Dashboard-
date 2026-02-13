import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/common/kpi-card";
import { ForecastStageChart } from "@/components/charts/forecast-stage-chart";
import { ForecastTrendChart } from "@/components/charts/forecast-trend-chart";
import { TopDealsTable } from "@/components/tables/top-deals-table";
import { HealthRiskTable } from "@/components/tables/health-risk-table";
import { TeamLeaderboardTable } from "@/components/tables/team-leaderboard-table";
import { CoachingFlagsTable } from "@/components/tables/coaching-flags-table";
import { ManagerActionsPanel } from "@/components/manager-actions-panel";
import { parseFilters } from "@/lib/filters";
import { getDashboardData } from "@/lib/dashboard-data";
import { formatCurrency, formatRatio, formatPercentage } from "@/lib/format";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  const data = await getDashboardData(filters);

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <KpiCard label="Team Net Revenue Retention" value={`${data.executiveSnapshot.nrr.value.toFixed(1)}%`} delta={data.executiveSnapshot.nrr.delta} />
        <KpiCard
          label="Expansion ARR (Quarter)"
          value={formatCurrency(data.executiveSnapshot.expansionArr.value)}
          delta={data.executiveSnapshot.expansionArr.delta}
        />
        <KpiCard
          label="Renewal ARR (Quarter)"
          value={formatCurrency(data.executiveSnapshot.renewalArr.value)}
          delta={data.executiveSnapshot.renewalArr.delta}
        />
        <KpiCard
          label="Pipeline Coverage"
          value={formatRatio(data.executiveSnapshot.pipelineCoverage.value)}
          delta={data.executiveSnapshot.pipelineCoverage.delta}
        />
        <KpiCard
          label="Forecast vs Target"
          value={`Commit ${formatCurrency(data.executiveSnapshot.forecastVsTarget.commit)} / Target ${formatCurrency(data.executiveSnapshot.forecastVsTarget.target)}`}
          helper={`Best Case ${formatCurrency(data.executiveSnapshot.forecastVsTarget.bestCase)} â€¢ Upside ${formatCurrency(data.executiveSnapshot.forecastVsTarget.upside)}`}
        />
        <KpiCard
          label="Forecast Accuracy (Last 4 Quarters)"
          value={formatPercentage(data.executiveSnapshot.forecastAccuracy.averageError)}
          helper="Error % = abs(actual - commit) / actual"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Forecast & Pipeline by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ForecastStageChart data={data.forecastAndPipeline.stageBreakdown} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Forecast vs Actual (Last 4 Quarters)</CardTitle>
          </CardHeader>
          <CardContent>
            <ForecastTrendChart data={data.forecastAndPipeline.trend} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Top 15 Deals Closing This Quarter</CardTitle>
          </CardHeader>
          <CardContent>
            <TopDealsTable data={data.forecastAndPipeline.topDeals} />
          </CardContent>
        </Card>
        <ManagerActionsPanel actions={data.managerActions} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>
              Customer Health & Risk â€¢ At Risk {data.customerHealth.atRiskCount} accounts / {formatCurrency(data.customerHealth.arrAtRisk)} ARR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HealthRiskTable data={data.customerHealth.rows} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health Score Weights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p>Usage trend: {data.customerHealth.weightTransparency.usageTrend}%</p>
            <p>Support burden: {data.customerHealth.weightTransparency.support}%</p>
            <p>Stakeholder engagement: {data.customerHealth.weightTransparency.engagement}%</p>
            <p>Renewal proximity: {data.customerHealth.weightTransparency.renewalProximity}%</p>
            <p>Payment reliability: {data.customerHealth.weightTransparency.payment}%</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Team Performance Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamLeaderboardTable data={data.teamPerformance.leaderboard} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Coaching Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <CoachingFlagsTable data={data.teamPerformance.coachingFlags} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>QBR Cadence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-slate-300">
            <p>Completed: {data.operatingCadence.qbrCadence.completed}</p>
            <p>Scheduled: {data.operatingCadence.qbrCadence.scheduled}</p>
            <p>Overdue: {data.operatingCadence.qbrCadence.overdue}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Account Plan Completeness</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-teal-300">{data.operatingCadence.accountPlanCompleteness.toFixed(0)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Negotiation Guardrails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-slate-300">
            <p>Pending approvals: {data.operatingCadence.guardrails.pending}</p>
            <p>Above threshold: {data.operatingCadence.guardrails.aboveThreshold}</p>
            <p>Avg requested discount: {(data.operatingCadence.guardrails.averageRequestedDiscount * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
