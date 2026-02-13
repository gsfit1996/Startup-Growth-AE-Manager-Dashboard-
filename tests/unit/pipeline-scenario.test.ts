import { describe, expect, it } from "vitest";

import { applyScenarioPreset } from "@/lib/pipeline-scenario";

describe("pipeline scenario presets", () => {
  const defaults = {
    PROSPECT: 20,
    DISCOVERY: 30,
    TECH_EVAL: 45,
    PROPOSAL: 58,
    NEGOTIATION: 72,
    LEGAL: 85,
  };

  it("applies conservative and aggressive shifts", () => {
    const conservative = applyScenarioPreset(defaults, "conservative");
    const aggressive = applyScenarioPreset(defaults, "aggressive");

    expect(conservative.PROSPECT).toBe(12);
    expect(aggressive.PROSPECT).toBe(28);
    expect(conservative.LEGAL).toBe(77);
    expect(aggressive.LEGAL).toBe(93);
  });

  it("clamps stage probabilities between 0 and 100", () => {
    const lowDefaults = { PROSPECT: 2, LEGAL: 99 };
    const conservative = applyScenarioPreset(lowDefaults, "conservative");
    const aggressive = applyScenarioPreset(lowDefaults, "aggressive");

    expect(conservative.PROSPECT).toBe(0);
    expect(aggressive.LEGAL).toBe(100);
  });
});

