import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type OperatingCadenceProps = {
  qbrCadence: {
    completed: number;
    scheduled: number;
    overdue: number;
  };
  accountPlanCompleteness: number;
  guardrails: {
    pending: number;
    aboveThreshold: number;
    averageRequestedDiscount: number;
  };
};

export function OperatingCadencePanel({ qbrCadence, accountPlanCompleteness, guardrails }: OperatingCadenceProps) {
  const totalQbr = Math.max(1, qbrCadence.completed + qbrCadence.scheduled + qbrCadence.overdue);
  const qbrCompletionRate = (qbrCadence.completed / totalQbr) * 100;
  const overdueRate = (qbrCadence.overdue / totalQbr) * 100;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Operating Cadence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-[color:var(--muted)]">
            <span>QBR Completion</span>
            <span>{qbrCompletionRate.toFixed(0)}%</span>
          </div>
          <Progress value={qbrCompletionRate} tone="teal" />
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            Completed {qbrCadence.completed} | Scheduled {qbrCadence.scheduled} | Overdue {qbrCadence.overdue}
          </p>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-[color:var(--muted)]">
            <span>Account Plan Completeness</span>
            <span>{accountPlanCompleteness.toFixed(0)}%</span>
          </div>
          <Progress value={accountPlanCompleteness} tone={accountPlanCompleteness >= 75 ? "teal" : "amber"} />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-[color:var(--muted)]">
            <span>Negotiation Risk Load</span>
            <span>{overdueRate.toFixed(0)}% cadence risk</span>
          </div>
          <Progress
            value={Math.min(100, guardrails.aboveThreshold * 8 + guardrails.pending * 4)}
            tone={guardrails.aboveThreshold > 3 ? "risk" : "amber"}
          />
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            Pending approvals {guardrails.pending} | Above threshold {guardrails.aboveThreshold} | Avg discount{" "}
            {(guardrails.averageRequestedDiscount * 100).toFixed(1)}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

