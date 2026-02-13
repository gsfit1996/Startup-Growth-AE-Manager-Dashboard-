import { describe, expect, it } from "vitest";

import { accountPlanCompleteness } from "@/lib/metrics/account-plan";

describe("accountPlanCompleteness", () => {
  it("returns expected percentage", () => {
    expect(
      accountPlanCompleteness({
        businessGoals: "goal",
        successMetrics: "metric",
        stakeholderMap: "stakeholder",
        riskLog: "risk",
        expansionHypothesis: "expand",
        execAlignmentDate: "2026-04-02",
        nextQbrDate: null,
      }),
    ).toBe(86);
  });

  it("returns 0 for null plan", () => {
    expect(accountPlanCompleteness(null)).toBe(0);
  });
});
