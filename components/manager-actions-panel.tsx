import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ManagerAction } from "@/lib/types/dashboard";

export function ManagerActionsPanel({ actions }: { actions: ManagerAction[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Manager Actions This Week</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <div key={action.id} className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-100">{action.title}</p>
              <Badge
                variant={
                  action.impact === "high"
                    ? "danger"
                    : action.impact === "medium"
                      ? "warning"
                      : "neutral"
                }
              >
                {action.impact}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Owner: {action.owner} â€¢ Due {action.dueDate}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
