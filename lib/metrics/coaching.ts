import { CoachingFlag } from "../types/dashboard";

type AECoachingInput = {
  aeId: string;
  aeName: string;
  pipelineCoverage: number;
  slippingDeals: number;
  avgDiscount: number;
  stakeholderCountAvg: number;
  renewalTouches30d: number;
};

export function buildCoachingFlags(inputs: AECoachingInput[]): CoachingFlag[] {
  const flags: CoachingFlag[] = [];

  for (const input of inputs) {
    if (input.pipelineCoverage < 2.5) {
      flags.push({
        aeId: input.aeId,
        aeName: input.aeName,
        flag: "LOW_PIPELINE_COVERAGE",
        severity: input.pipelineCoverage < 1.8 ? "high" : "medium",
        detail: `Coverage ${input.pipelineCoverage.toFixed(2)}x is below 2.5x goal`,
      });
    }

    if (input.slippingDeals >= 3) {
      flags.push({
        aeId: input.aeId,
        aeName: input.aeName,
        flag: "SLIPPING_DATES",
        severity: input.slippingDeals >= 5 ? "high" : "medium",
        detail: `${input.slippingDeals} deals slipped close date in last 30 days`,
      });
    }

    if (input.avgDiscount > 0.18) {
      flags.push({
        aeId: input.aeId,
        aeName: input.aeName,
        flag: "HIGH_DISCOUNT",
        severity: input.avgDiscount > 0.24 ? "high" : "medium",
        detail: `Avg requested discount ${(input.avgDiscount * 100).toFixed(1)}% above guardrail`,
      });
    }

    if (input.stakeholderCountAvg < 2.5) {
      flags.push({
        aeId: input.aeId,
        aeName: input.aeName,
        flag: "LOW_MULTI_THREADING",
        severity: input.stakeholderCountAvg < 2 ? "high" : "medium",
        detail: `Average ${input.stakeholderCountAvg.toFixed(1)} stakeholder threads`,
      });
    }

    if (input.renewalTouches30d < 2) {
      flags.push({
        aeId: input.aeId,
        aeName: input.aeName,
        flag: "LOW_RENEWAL_TOUCH",
        severity: "medium",
        detail: `${input.renewalTouches30d} renewal touches in last 30 days`,
      });
    }
  }

  return flags;
}
