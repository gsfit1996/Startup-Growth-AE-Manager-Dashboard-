import { ManagerQuestionStatus } from "@/lib/types/dashboard";

export function statusFromCoverage(coverage: number): ManagerQuestionStatus {
  if (coverage >= 2.5) return "on_track";
  if (coverage >= 2) return "watch";
  return "risk";
}

export function statusFromForecast(commit: number, target: number): ManagerQuestionStatus {
  if (target <= 0) return "watch";
  const ratio = commit / target;
  if (ratio >= 0.92) return "on_track";
  if (ratio >= 0.75) return "watch";
  return "risk";
}

