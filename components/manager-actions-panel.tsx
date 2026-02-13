"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, CircleDashed, PauseCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ManagerAction } from "@/lib/types/dashboard";

export function ManagerActionsPanel({ actions }: { actions: ManagerAction[] }) {
  const [statusById, setStatusById] = useState<Record<string, ManagerAction["status"]>>(
    () =>
      actions.reduce(
        (acc, action) => {
          acc[action.id] = action.status;
          return acc;
        },
        {} as Record<string, ManagerAction["status"]>,
      ),
  );

  const orderedActions = useMemo(
    () =>
      [...actions].sort((left, right) => {
        const leftStatus = statusById[left.id];
        const rightStatus = statusById[right.id];
        if (leftStatus === rightStatus) return 0;
        if (leftStatus === "blocked") return -1;
        if (rightStatus === "blocked") return 1;
        if (leftStatus === "new") return -1;
        if (rightStatus === "new") return 1;
        return 0;
      }),
    [actions, statusById],
  );

  function cycleStatus(id: string) {
    setStatusById((current) => {
      const now = current[id];
      const next = now === "new" ? "in_progress" : now === "in_progress" ? "blocked" : "new";
      return { ...current, [id]: next };
    });
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Manager Actions This Week</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {orderedActions.map((action, index) => {
          const status = statusById[action.id];
          const statusIcon =
            status === "new" ? (
              <CircleDashed className="h-3.5 w-3.5" />
            ) : status === "in_progress" ? (
              <PauseCircle className="h-3.5 w-3.5" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            );

          return (
            <div key={action.id} className="rounded-lg border border-[color:var(--border)] bg-white/[0.02] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-[color:var(--foreground)]">{action.title}</p>
                <Badge variant={action.impact === "high" ? "danger" : action.impact === "medium" ? "warning" : "neutral"}>
                  P{index + 1}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-[color:var(--muted)]">
                Owner: <span className="text-[color:var(--foreground)]">{action.owner}</span> | Due {action.dueDate}
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <Badge variant={status === "blocked" ? "danger" : status === "in_progress" ? "warning" : "info"}>
                  <span className="mr-1 inline-flex">{statusIcon}</span>
                  {status.replaceAll("_", " ")}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => cycleStatus(action.id)}>
                  Update Status
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
