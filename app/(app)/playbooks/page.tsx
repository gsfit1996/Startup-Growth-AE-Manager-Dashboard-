import { PlaybookTemplates } from "@/components/playbooks/playbook-templates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlaybooksPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Operating Playbooks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-300">
            Repeatable frameworks for at-risk renewals, expansion motion, multithreading, negotiation guardrails, and QBR execution.
          </p>
        </CardContent>
      </Card>

      <PlaybookTemplates />
    </div>
  );
}
