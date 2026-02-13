import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/common/kpi-card";
import { ForecastStageChart } from "@/components/charts/forecast-stage-chart";
import { ForecastTrendChart } from "@/components/charts/forecast-trend-chart";
import { TopDealsTable } from "@/components/tables/top-deals-table";
import { HealthRiskTable } from "@/components/tables/health-risk-table";
import { TeamLeaderboardTable } from "@/components/tables/team-leaderboard-table";
import { CoachingFlagsTable } from "@/components/tables/coaching-flags-table";
import { ManagerActionsPanel } from "@/components/manager-actions-panel";
import { ManagerQuestionStrip } from "@/components/dashboard/manager-question-strip";
import { type ManagerQuestionItem } from "@/components/dashboard/manager-question-strip";
import { OperatingCadencePanel } from "@/components/dashboard/operating-cadence-panel";
import { parseFilters } from "@/lib/filters";
import { getDashboardData } from "@/lib/dashboard-data";
import { formatCurrency, formatRatio, formatPercentage } from "@/lib/format";
import { statusFromCoverage, statusFromForecast } from "@/lib/metrics/manager-questions";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  const data = await getDashboardData(filters);

  const questionItems: ManagerQuestionItem[] = [
    {
      id: "q1",
      question: "Are we on track to hit team revenue targets?",
      status: statusFromCoverage(data.executiveSnapshot.pipelineCoverage.value),
      evidence: `Coverage ${formatRatio(data.executiveSnapshot.pipelineCoverage.value)} against remaining target.`,
    },
    {
      id: "q2",
      question: "What will close this quarter and how confident are we?",
      status: statusFromForecast(data.executiveSnapshot.forecastVsTarget.commit, data.executiveSnapshot.forecastVsTarget.target),
      evidence: `Commit ${formatCurrency(data.executiveSnapshot.forecastVsTarget.commit)} | Best ${formatCurrency(data.executiveSnapshot.forecastVsTarget.bestCase)}.`,
    },
    {
      id: "q3",
      question: "Which accounts are at risk and what is the plan this week?",
      status: data.customerHealth.atRiskCount < 12 ? "on_track" : data.customerHealth.atRiskCount < 20 ? "watch" : "risk",
      evidence: `${data.customerHealth.atRiskCount} accounts at risk, ${formatCurrency(data.customerHealth.arrAtRisk)} ARR exposed.`,
    },
    {
      id: "q4",
      question: "Which AEs need coaching and where in the funnel?",
      status: data.teamPerformance.coachingFlags.length <= 8 ? "on_track" : data.teamPerformance.coachingFlags.length <= 14 ? "watch" : "risk",
      evidence: `${data.teamPerformance.coachingFlags.length} active coaching flags across pipeline, discount, and renewal motions.`,
    },
    {
      id: "q5",
      question: "Which repeatable frameworks are we running?",
      status: data.operatingCadence.qbrCadence.overdue <= 6 && data.operatingCadence.accountPlanCompleteness >= 70 ? "on_track" : "watch",
      evidence: `QBR overdue ${data.operatingCadence.qbrCadence.overdue} | Plan completeness ${data.operatingCadence.accountPlanCompleteness.toFixed(0)}%.`,
    },
  ];

  return (
    <div className="space-y-6">
      <section data-reveal="true">
        <ManagerQuestionStrip items={questionItems} />
      </section>

      <section data-reveal="true" className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label="Team Net Revenue Retention"
          value={`${data.executiveSnapshot.nrr.value.toFixed(1)}%`}
          delta={data.executiveSnapshot.nrr.delta}
          trend={[data.executiveSnapshot.nrr.value - data.executiveSnapshot.nrr.delta, data.executiveSnapshot.nrr.value]}
        />
        <KpiCard
          label="Expansion ARR (Quarter)"
          value={formatCurrency(data.executiveSnapshot.expansionArr.value)}
          delta={data.executiveSnapshot.expansionArr.delta}
          trend={data.executiveSnapshot.forecastAccuracy.trend.map((item) => item.actual)}
        />
        <KpiCard
          label="Renewal ARR (Quarter)"
          value={formatCurrency(data.executiveSnapshot.renewalArr.value)}
          delta={data.executiveSnapshot.renewalArr.delta}
          trend={data.executiveSnapshot.forecastAccuracy.trend.map((item) => item.commit)}
        />
        <KpiCard
          label="Pipeline Coverage"
          value={formatRatio(data.executiveSnapshot.pipelineCoverage.value)}
          delta={data.executiveSnapshot.pipelineCoverage.delta}
          helper="Pipeline / remaining target"
        />
        <KpiCard
          label="Forecast vs Target"
          value={`Commit ${formatCurrency(data.executiveSnapshot.forecastVsTarget.commit)} / Target ${formatCurrency(data.executiveSnapshot.forecastVsTarget.target)}`}
          helper={`Best ${formatCurrency(data.executiveSnapshot.forecastVsTarget.bestCase)} | Upside ${formatCurrency(data.executiveSnapshot.forecastVsTarget.upside)}`}
        />
        <KpiCard
          label="Forecast Accuracy (Last 4 Quarters)"
          value={formatPercentage(data.executiveSnapshot.forecastAccuracy.averageError)}
          helper="Error = abs(actual - commit) / actual"
          trend={data.executiveSnapshot.forecastAccuracy.trend.map((item) => item.errorPct * 100)}
        />
      </section>

      <section data-reveal="true" className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Forecast and Pipeline by Stage</CardTitle>
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

      <section data-reveal="true" className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Top 15 Deals Closing This Quarter</CardTitle>
          </CardHeader>
          <CardContent>
            <TopDealsTable data={data.forecastAndPipeline.topDeals} density={filters.density} />
          </CardContent>
        </Card>
        <ManagerActionsPanel actions={data.managerActions} />
      </section>

      <section data-reveal="true" className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>
              Customer Health and Risk | At Risk {data.customerHealth.atRiskCount} accounts / {formatCurrency(data.customerHealth.arrAtRisk)} ARR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HealthRiskTable data={data.customerHealth.rows} density={filters.density} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health Score Weights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[color:var(--muted)]">
            <p>Usage trend: {data.customerHealth.weightTransparency.usageTrend}%</p>
            <p>Support burden: {data.customerHealth.weightTransparency.support}%</p>
            <p>Stakeholder engagement: {data.customerHealth.weightTransparency.engagement}%</p>
            <p>Renewal proximity: {data.customerHealth.weightTransparency.renewalProximity}%</p>
            <p>Payment reliability: {data.customerHealth.weightTransparency.payment}%</p>
          </CardContent>
        </Card>
      </section>

      <section data-reveal="true" className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Team Performance Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamLeaderboardTable data={data.teamPerformance.leaderboard} density={filters.density} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Coaching Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <CoachingFlagsTable data={data.teamPerformance.coachingFlags} density={filters.density} />
          </CardContent>
        </Card>
      </section>

      <section data-reveal="true" className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <OperatingCadencePanel
          qbrCadence={data.operatingCadence.qbrCadence}
          accountPlanCompleteness={data.operatingCadence.accountPlanCompleteness}
          guardrails={data.operatingCadence.guardrails}
        />

        <Card>
          <CardHeader>
            <CardTitle>Negotiation Guardrails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-[color:var(--muted)]">
            <p>Pending approvals: {data.operatingCadence.guardrails.pending}</p>
            <p>Above threshold: {data.operatingCadence.guardrails.aboveThreshold}</p>
            <p>Avg requested discount: {(data.operatingCadence.guardrails.averageRequestedDiscount * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
