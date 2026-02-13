import { FunnelConversionChart } from "@/components/charts/funnel-conversion-chart";
import { ForecastScenarioBuilder } from "@/components/pipeline-scenario-builder";
import { DealDeskTable } from "@/components/tables/deal-desk-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseFilters } from "@/lib/filters";
import { getPipelineData } from "@/lib/dashboard-data";

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  const data = await getPipelineData(filters);

  return (
    <div className="space-y-4">
      <section data-reveal="true">
        <Card>
          <CardHeader>
            <CardTitle>Funnel Conversion by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelConversionChart data={data.funnel} />
          </CardContent>
        </Card>
      </section>

      <section data-reveal="true">
        <ForecastScenarioBuilder quarter={filters.quarter} stageDefaults={data.scenarioDefaults} base={data.scenarioBase} />
      </section>

      <section data-reveal="true">
        <Card>
          <CardHeader>
            <CardTitle>Deal Desk and Guardrails</CardTitle>
          </CardHeader>
          <CardContent>
            <DealDeskTable data={data.dealDesk} density={filters.density} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
