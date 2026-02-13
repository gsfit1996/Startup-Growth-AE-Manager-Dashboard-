import { NextResponse } from "next/server";
import { z } from "zod";

import { recalculatePipelineScenario } from "@/lib/dashboard-data";

const scenarioSchema = z.object({
  quarter: z.enum(["Q1", "Q2", "Q3", "Q4"]),
  stageProbabilityOverrides: z.record(z.string(), z.number().min(0).max(100)),
});

export async function POST(request: Request) {
  let rawPayload: unknown;
  try {
    rawPayload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const payload = scenarioSchema.parse(rawPayload);

  const result = await recalculatePipelineScenario(payload.quarter, payload.stageProbabilityOverrides);
  return NextResponse.json(result);
}
