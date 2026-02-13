export type ExecutiveSnapshot = {
  nrr: { value: number; delta: number };
  expansionArr: { value: number; delta: number };
  renewalArr: { value: number; delta: number };
  pipelineCoverage: { value: number; delta: number };
  forecastVsTarget: {
    commit: number;
    bestCase: number;
    upside: number;
    target: number;
  };
  forecastAccuracy: { averageError: number; trend: { quarter: string; errorPct: number }[] };
};

export type ForecastBuckets = {
  commit: number;
  bestCase: number;
  upside: number;
  byStage: {
    stage: string;
    commit: number;
    bestCase: number;
    pipeline: number;
  }[];
};

export type HealthBreakdown = {
  usageTrendScore: number;
  supportScore: number;
  engagementScore: number;
  renewalScore: number;
  paymentScore: number;
  weightedScore: number;
};

export type CoachingFlagType =
  | "LOW_PIPELINE_COVERAGE"
  | "SLIPPING_DATES"
  | "HIGH_DISCOUNT"
  | "LOW_MULTI_THREADING"
  | "LOW_RENEWAL_TOUCH";

export type CoachingFlag = {
  aeId: string;
  aeName: string;
  flag: CoachingFlagType;
  severity: "low" | "medium" | "high";
  detail: string;
};

export type ManagerAction = {
  id: string;
  title: string;
  owner: string;
  dueDate: string;
  impact: "low" | "medium" | "high";
  status: "new" | "in_progress" | "blocked";
};
