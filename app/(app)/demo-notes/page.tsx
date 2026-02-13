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
      <Card>
        <CardHeader>
          <CardTitle>Demo Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-300">
          <p>
            This dashboard is designed as an internal manager cockpit for a Growth AE team and emphasizes forecast discipline,
            account health governance, and coaching cadence. Metrics are intentionally operational: pipeline coverage, forecast
            confidence buckets, QBR execution, and deal desk guardrails.
          </p>
          <p>
            Core GTM data is synthetic and seeded for deterministic demos. A scraping refresh script pulls public Anthropic and
            customer context, normalizes source observations into a cached snapshot, and then enriches seeded account narratives.
            This keeps the demo reproducible while still grounding examples in publicly available company references.
          </p>
          <p>
            Health scoring is transparent (usage 30%, support 20%, engagement 20%, renewal proximity 15%, payment reliability 15%).
            Manager actions are auto-prioritized by urgency and impact to show how weekly operating rigor translates into revenue
            outcomes.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Public Source Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sources.slice(0, 20).map((source) => (
            <div key={`${source.companyName}-${source.sourceUrl}`} className="rounded-md border border-slate-800 p-3 text-sm">
              <p className="font-medium text-slate-100">{source.companyName}</p>
              <a className="text-xs text-teal-300 hover:text-teal-200" href={source.sourceUrl} target="_blank" rel="noreferrer">
                {source.sourceUrl}
              </a>
              <p className="mt-1 text-xs text-slate-400">{source.aiUseCase}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

