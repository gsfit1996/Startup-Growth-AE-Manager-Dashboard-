import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type ManagerQuestionItem = {
  id: string;
  question: string;
  status: "on_track" | "watch" | "risk";
  evidence: string;
};

const statusVariant: Record<ManagerQuestionItem["status"], "success" | "warning" | "danger"> = {
  on_track: "success",
  watch: "warning",
  risk: "danger",
};

export function ManagerQuestionStrip({ items }: { items: ManagerQuestionItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manager Questions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-5">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-[color:var(--border)] bg-white/[0.02] p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-[color:var(--muted)]">Q</p>
              <Badge variant={statusVariant[item.status]}>{item.status.replaceAll("_", " ")}</Badge>
            </div>
            <p className="mt-2 text-sm font-medium text-[color:var(--foreground)]">{item.question}</p>
            <p className="mt-1 text-xs text-[color:var(--muted)]">{item.evidence}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

