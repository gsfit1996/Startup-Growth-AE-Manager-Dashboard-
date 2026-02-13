import { AeTrendChart } from "@/components/charts/ae-trend-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseFilters } from "@/lib/filters";
import { getTeamData } from "@/lib/dashboard-data";
import { formatCurrency, formatRatio } from "@/lib/format";

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  const profiles = await getTeamData(filters);

  return (
    <div className="space-y-4">
      {profiles.map((profile) => (
        <Card key={profile.aeId}>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>
                {profile.name} <span className="text-sm text-slate-400">({profile.region})</span>
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant={profile.pipelineCoverage >= 2.5 ? "success" : "warning"}>
                  Coverage {formatRatio(profile.pipelineCoverage)}
                </Badge>
                <Badge variant={profile.winRate >= 35 ? "success" : "warning"}>Win {profile.winRate.toFixed(1)}%</Badge>
                <Badge variant={profile.avgDiscount <= 0.18 ? "success" : "danger"}>
                  Discount {(profile.avgDiscount * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-md border border-slate-800 p-3 text-sm">
                <p className="text-slate-400">Expansion ARR</p>
                <p className="text-lg font-semibold">{formatCurrency(profile.expansionArr)}</p>
              </div>
              <div className="rounded-md border border-slate-800 p-3 text-sm">
                <p className="text-slate-400">Retention ARR</p>
                <p className="text-lg font-semibold">{formatCurrency(profile.retentionArr)}</p>
              </div>
              <div className="rounded-md border border-slate-800 p-3 text-sm">
                <p className="text-slate-400">Renewal Touchpoints</p>
                <p className="text-lg font-semibold">{profile.renewalTouchpoints}</p>
              </div>
              <div className="rounded-md border border-slate-800 p-3 text-sm">
                <p className="text-slate-400">Avg Discount</p>
                <p className="text-lg font-semibold">{(profile.avgDiscount * 100).toFixed(1)}%</p>
              </div>
            </div>

            <AeTrendChart data={profile.monthlyTrend} />

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-md border border-slate-800 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">What&apos;s Working</p>
                <p className="mt-1 text-sm text-slate-200">{profile.talkingPoints.working}</p>
              </div>
              <div className="rounded-md border border-slate-800 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">What&apos;s Stuck</p>
                <p className="mt-1 text-sm text-slate-200">{profile.talkingPoints.stuck}</p>
              </div>
              <div className="rounded-md border border-slate-800 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Next Week Focus</p>
                <p className="mt-1 text-sm text-slate-200">{profile.talkingPoints.nextWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
