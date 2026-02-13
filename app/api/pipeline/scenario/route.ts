import { NextResponse } from "next/server";
import { z } from "zod";

import { recalculatePipelineScenario } from "@/lib/dashboard-data";

const scenarioSchema = z.object({
  quarter: z.enum(["Q1", "Q2", "Q3", "Q4"]),
  stageProbabilityOverrides: z.record(z.string(), z.number().min(0).max(100)),
});

export async function POST(request: Request) {
  const payload = scenarioSchema.parse(await request.json());

  const result = await recalculatePipelineScenario(payload.quarter, payload.stageProbabilityOverrides);
  return NextResponse.json(result);
}
