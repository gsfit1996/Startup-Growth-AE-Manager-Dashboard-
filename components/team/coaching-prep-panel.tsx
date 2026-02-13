import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CoachingPrepPanel({
  working,
  stuck,
  nextWeek,
}: {
  working: string;
  stuck: string;
  nextWeek: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Coaching 1:1 Prep</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        <div className="rounded-md border border-[color:var(--border)] p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--muted)]">What is Working</p>
          <p className="mt-1 text-sm text-[color:var(--foreground)]">{working}</p>
        </div>
        <div className="rounded-md border border-[color:var(--border)] p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--muted)]">What is Stuck</p>
          <p className="mt-1 text-sm text-[color:var(--foreground)]">{stuck}</p>
        </div>
        <div className="rounded-md border border-[color:var(--border)] p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--muted)]">Next Week Focus</p>
          <p className="mt-1 text-sm text-[color:var(--foreground)]">{nextWeek}</p>
        </div>
        <div className="md:col-span-3 flex flex-wrap gap-2">
          <Button size="sm" variant="outline">Assign Follow-up</Button>
          <Button size="sm" variant="outline">Add to Weekly Review</Button>
          <Button size="sm" variant="outline">Schedule Deal Deep Dive</Button>
        </div>
      </CardContent>
    </Card>
  );
}

