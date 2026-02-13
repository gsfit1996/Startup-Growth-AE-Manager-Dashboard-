import { describe, expect, it } from "vitest";

import { bucketForecast, forecastAccuracy, pipelineCoverage } from "@/lib/metrics/forecast";

describe("forecast metrics", () => {
  it("buckets opportunities into commit, best case, and upside", () => {
    const buckets = bucketForecast([
      { amount: 100, probability: 0.75, stage: "PROPOSAL" as const },
      { amount: 200, probability: 0.55, stage: "NEGOTIATION" as const },
      { amount: 300, probability: 0.25, stage: "DISCOVERY" as const },
    ]);

    expect(buckets.commit).toBe(100);
    expect(buckets.bestCase).toBe(200);
    expect(buckets.upside).toBe(300);
  });

  it("computes pipeline coverage safely", () => {
    expect(pipelineCoverage(1_000_000, 500_000)).toBe(2);
    expect(pipelineCoverage(100_000, 0)).toBe(0);
  });

  it("computes forecast accuracy error", () => {
    expect(forecastAccuracy(100, 90)).toBeCloseTo(0.1, 5);
  });
});
