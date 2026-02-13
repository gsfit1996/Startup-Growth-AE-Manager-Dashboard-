import { PlaybookTemplates } from "@/components/playbooks/playbook-templates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlaybooksPage() {
  return (
    <div className="space-y-4">
      <Card data-reveal="true">
        <CardHeader>
          <CardTitle>Operating Playbooks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[color:var(--muted)]">
            Repeatable frameworks for at-risk renewals, expansion motion, multithreading, negotiation guardrails, and QBR execution.
          </p>
        </CardContent>
      </Card>

      <section data-reveal="true">
        <PlaybookTemplates />
      </section>
    </div>
  );
}
