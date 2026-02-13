import { ExternalLink } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDemoSources } from "@/lib/dashboard-data";

type DemoSource = {
  companyName: string;
  sourceUrl: string;
  aiUseCase: string;
};

export default async function DemoNotesPage() {
  const sources = (await getDemoSources()) as DemoSource[];

  return (
    <div className="space-y-4">
      <Card data-reveal="true">
        <CardHeader>
          <CardTitle>Demo Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-[color:var(--muted)]">
          <p>
            This dashboard is built as an internal manager cockpit for a Growth AE team, optimized to answer forecast confidence,
            pipeline sufficiency, customer risk concentration, and coaching priorities quickly. KPI choices intentionally map to manager
            operating rhythms: weekly forecast calls, risk triage, deal desk reviews, and QBR accountability.
          </p>
          <p>
            Core GTM objects are synthetic and seeded for deterministic portfolio demonstrations. Public source enrichment is captured in a
            cached snapshot so examples remain transparent, reproducible, and deployable without runtime scraping dependencies.
          </p>
          <p>
            Health scoring is fully transparent and weighted: usage 30%, support 20%, engagement 20%, renewal proximity 15%, payment
            reliability 15%. Manager actions are ranked by urgency and impact to show how operating discipline ties back to revenue outcomes.
          </p>
        </CardContent>
      </Card>

      <Card data-reveal="true">
        <CardHeader>
          <CardTitle>Public Source Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          {sources.slice(0, 20).map((source) => (
            <div key={`${source.companyName}-${source.sourceUrl}`} className="rounded-md border border-[color:var(--border)] p-3 text-sm">
              <p className="font-medium text-[color:var(--foreground)]">{source.companyName}</p>
              <a
                className="mt-1 inline-flex items-center gap-1 text-xs text-[color:var(--accent-teal)] hover:underline"
                href={source.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Source link
                <ExternalLink className="h-3 w-3" />
              </a>
              <p className="mt-1 text-xs text-[color:var(--muted)]">{source.aiUseCase}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
