import { describe, expect, it } from "vitest";

import { statusFromCoverage, statusFromForecast } from "@/lib/metrics/manager-questions";

describe("manager question status helpers", () => {
  it("classifies coverage thresholds", () => {
    expect(statusFromCoverage(2.6)).toBe("on_track");
    expect(statusFromCoverage(2.2)).toBe("watch");
    expect(statusFromCoverage(1.7)).toBe("risk");
  });

  it("classifies forecast confidence vs target", () => {
    expect(statusFromForecast(920000, 1000000)).toBe("on_track");
    expect(statusFromForecast(820000, 1000000)).toBe("watch");
    expect(statusFromForecast(620000, 1000000)).toBe("risk");
  });
});

