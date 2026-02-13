import { ScenarioPreset } from "@/lib/types/dashboard";

const presetShift: Record<ScenarioPreset, number> = {
  conservative: -8,
  current: 0,
  aggressive: 8,
};

export function applyScenarioPreset(
  stageDefaults: Record<string, number>,
  preset: ScenarioPreset,
): Record<string, number> {
  const shift = presetShift[preset];

  return Object.entries(stageDefaults).reduce<Record<string, number>>((acc, [stage, value]) => {
    acc[stage] = Math.max(0, Math.min(100, value + shift));
    return acc;
  }, {});
}

