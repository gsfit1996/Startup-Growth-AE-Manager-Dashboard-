export const REQUIRED_ACCOUNT_PLAN_FIELDS = [
  "businessGoals",
  "successMetrics",
  "stakeholderMap",
  "riskLog",
  "expansionHypothesis",
  "execAlignmentDate",
  "nextQbrDate",
] as const;

export type AccountPlanLike = {
  businessGoals?: string | null;
  successMetrics?: string | null;
  stakeholderMap?: string | null;
  riskLog?: string | null;
  expansionHypothesis?: string | null;
  execAlignmentDate?: string | Date | null;
  nextQbrDate?: string | Date | null;
};

export function accountPlanCompleteness(plan: AccountPlanLike | null | undefined): number {
  if (!plan) {
    return 0;
  }

  const completed = REQUIRED_ACCOUNT_PLAN_FIELDS.filter((field) => {
    const value = plan[field as keyof AccountPlanLike];
    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value === "string") {
      return value.trim().length > 0;
    }

    return true;
  }).length;

  return Math.round((completed / REQUIRED_ACCOUNT_PLAN_FIELDS.length) * 100);
}
