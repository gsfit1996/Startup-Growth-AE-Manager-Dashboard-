import { describe, expect, it } from "vitest";

import { computeHealthScore } from "@/lib/metrics/health";

describe("computeHealthScore", () => {
  it("calculates weighted score and clamps within bounds", () => {
    const result = computeHealthScore({
      usageTrendPct: 22,
      openTicketsWeighted: 1,
      meetingsLast45Days: 5,
      qbrCompleted: true,
      activeStakeholders: 4,
      renewalDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      paymentStatus: "GOOD",
    });

    expect(result.weightedScore).toBeGreaterThan(0);
    expect(result.weightedScore).toBeLessThanOrEqual(100);
  });

  it("reduces score for negative signals", () => {
    const weak = computeHealthScore({
      usageTrendPct: -30,
      openTicketsWeighted: 8,
      meetingsLast45Days: 0,
      qbrCompleted: false,
      activeStakeholders: 1,
      renewalDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      paymentStatus: "OVERDUE",
    });

    const strong = computeHealthScore({
      usageTrendPct: 18,
      openTicketsWeighted: 0,
      meetingsLast45Days: 8,
      qbrCompleted: true,
      activeStakeholders: 5,
      renewalDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      paymentStatus: "GOOD",
    });

    expect(weak.weightedScore).toBeLessThan(strong.weightedScore);
  });
});
