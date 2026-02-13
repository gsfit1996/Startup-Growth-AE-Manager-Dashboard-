import { AeTrendChart } from "@/components/charts/ae-trend-chart";
import { CoachingPrepPanel } from "@/components/team/coaching-prep-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatRatio } from "@/lib/format";

type TeamProfile = {
  aeId: string;
  name: string;
  region: string;
  pipelineCoverage: number;
  winRate: number;
  avgDiscount: number;
  renewalTouchpoints: number;
  monthlyTrend: { month: string; wonArr: number; pipelineArr: number; activityCount: number }[];
  talkingPoints: {
    working: string;
    stuck: string;
    nextWeek: string;
  };
  expansionArr: number;
  retentionArr: number;
};

export function AePerformanceCard({ profile }: { profile: TeamProfile }) {
  return (
    <Card key={profile.aeId}>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>
            {profile.name} <span className="text-sm text-[color:var(--muted)]">({profile.region})</span>
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
          <div className="rounded-md border border-[color:var(--border)] p-3 text-sm">
            <p className="text-[color:var(--muted)]">Expansion ARR</p>
            <p className="text-lg font-semibold">{formatCurrency(profile.expansionArr)}</p>
          </div>
          <div className="rounded-md border border-[color:var(--border)] p-3 text-sm">
            <p className="text-[color:var(--muted)]">Retention ARR</p>
            <p className="text-lg font-semibold">{formatCurrency(profile.retentionArr)}</p>
          </div>
          <div className="rounded-md border border-[color:var(--border)] p-3 text-sm">
            <p className="text-[color:var(--muted)]">Renewal Touchpoints</p>
            <p className="text-lg font-semibold">{profile.renewalTouchpoints}</p>
          </div>
          <div className="rounded-md border border-[color:var(--border)] p-3 text-sm">
            <p className="text-[color:var(--muted)]">Avg Discount</p>
            <p className="text-lg font-semibold">{(profile.avgDiscount * 100).toFixed(1)}%</p>
          </div>
        </div>

        <AeTrendChart data={profile.monthlyTrend} />

        <CoachingPrepPanel
          working={profile.talkingPoints.working}
          stuck={profile.talkingPoints.stuck}
          nextWeek={profile.talkingPoints.nextWeek}
        />
      </CardContent>
    </Card>
  );
}

