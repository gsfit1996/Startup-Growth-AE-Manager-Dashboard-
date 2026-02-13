import { differenceInCalendarDays } from "date-fns";

export const HEALTH_WEIGHTS = {
  usageTrend: 0.3,
  support: 0.2,
  engagement: 0.2,
  renewal: 0.15,
  payment: 0.15,
} as const;

export type HealthInputs = {
  usageTrendPct: number;
  openTicketsWeighted: number;
  meetingsLast45Days: number;
  qbrCompleted: boolean;
  activeStakeholders: number;
  renewalDate: Date;
  paymentStatus: "GOOD" | "WATCH" | "OVERDUE";
};

export type HealthScoreBreakdown = {
  usageTrendScore: number;
  supportScore: number;
  engagementScore: number;
  renewalScore: number;
  paymentScore: number;
  weightedScore: number;
};

export function computeHealthScore(inputs: HealthInputs, now = new Date()): HealthScoreBreakdown {
  const usageTrendScore = clamp(50 + inputs.usageTrendPct * 2, 0, 100);
  const supportScore = clamp(100 - inputs.openTicketsWeighted * 12, 0, 100);

  const meetingScore = clamp(inputs.meetingsLast45Days * 12, 0, 60);
  const stakeholderScore = clamp(inputs.activeStakeholders * 8, 0, 24);
  const qbrScore = inputs.qbrCompleted ? 16 : 0;
  const engagementScore = clamp(meetingScore + stakeholderScore + qbrScore, 0, 100);

  const daysToRenewal = differenceInCalendarDays(inputs.renewalDate, now);
  const renewalScore = clamp((daysToRenewal / 180) * 100, 0, 100);

  const paymentScore =
    inputs.paymentStatus === "GOOD" ? 100 : inputs.paymentStatus === "WATCH" ? 60 : 25;

  const weightedScore = clamp(
    usageTrendScore * HEALTH_WEIGHTS.usageTrend +
      supportScore * HEALTH_WEIGHTS.support +
      engagementScore * HEALTH_WEIGHTS.engagement +
      renewalScore * HEALTH_WEIGHTS.renewal +
      paymentScore * HEALTH_WEIGHTS.payment,
    0,
    100,
  );

  return {
    usageTrendScore,
    supportScore,
    engagementScore,
    renewalScore,
    paymentScore,
    weightedScore,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
