import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Card data-reveal="true" className="overflow-hidden">
        <CardHeader className="border-b border-[color:var(--border)] pb-4">
          <CardTitle className="text-2xl md:text-3xl">
            Ex-founder (~&euro;500k ARR) | AI automation + GTM systems | Sales leadership
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          <ul className="list-disc space-y-2 pl-5 text-sm text-[color:var(--foreground)]">
            <li>Scaled a founder-led venture from 0 to approximately &euro;500k ARR while owning full-cycle acquisition, retention, and expansion motions.</li>
            <li>Automated acquisition and delivery workflows with AI systems, reducing manual execution load by roughly 35%.</li>
            <li>Hired and coached a small delivery and GTM team (5+ contributors) to improve onboarding consistency and execution pace.</li>
            <li>Built weekly forecast operating rhythms that increased pipeline visibility across commit, best-case, and upside scenarios.</li>
            <li>Helped a clinic growth initiative improve throughput and conversion velocity with process and tooling improvements over two operating quarters.</li>
          </ul>

          <div className="rounded-lg border border-[color:var(--border)] bg-white/[0.02] p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--muted)]">Skills</p>
            <p className="mt-1 text-sm text-[color:var(--foreground)]">
              sales leadership, GTM ops, forecasting, account planning, AI tooling
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <a href="/resume-placeholder.pdf" download>
                Download PDF
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">View Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
