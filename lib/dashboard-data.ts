import {
  ActivityType,
  ApprovalStatus,
  OpportunityStage,
  PaymentStatus,
  Prisma,
  QBRStatus,
  Segment,
  Severity,
} from "@prisma/client";
import { addDays, endOfQuarter, format, startOfQuarter, subDays, subMonths } from "date-fns";

import { db } from "@/lib/db";
import { type DashboardFilters } from "@/lib/filters";
import { accountPlanCompleteness } from "@/lib/metrics/account-plan";
import { buildCoachingFlags } from "@/lib/metrics/coaching";
import { bucketForecast, forecastAccuracy, pipelineCoverage, stageBreakdownByBucket } from "@/lib/metrics/forecast";
import { computeHealthScore, type HealthScoreBreakdown } from "@/lib/metrics/health";
import { rankManagerActions } from "@/lib/metrics/manager-actions";

const segmentMap: Record<DashboardFilters["segment"], Segment | undefined> = {
  all: undefined,
  seed: Segment.SEED,
  series_a: Segment.SERIES_A,
  series_b_plus: Segment.SERIES_B_PLUS,
};

const regionMap: Record<DashboardFilters["region"], string | undefined> = {
  all: undefined,
  emea: "EMEA",
  na: "NA",
  apac: "APAC",
};

const severityWeight: Record<Severity, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

type QuarterContext = {
  quarterNumber: number;
  year: number;
  key: string;
  start: Date;
  end: Date;
};

export function quarterContext(quarter: DashboardFilters["quarter"], year = new Date().getFullYear()): QuarterContext {
  const quarterNumber = Number(quarter.replace("Q", ""));
  const quarterStart = startOfQuarter(new Date(year, (quarterNumber - 1) * 3, 1));
  const quarterEnd = endOfQuarter(quarterStart);

  return {
    quarterNumber,
    year,
    key: `${year}-${quarter}`,
    start: quarterStart,
    end: quarterEnd,
  };
}

function priorQuarter(ctx: QuarterContext): QuarterContext {
  const previousQuarter = ctx.quarterNumber === 1 ? 4 : ctx.quarterNumber - 1;
  const year = ctx.quarterNumber === 1 ? ctx.year - 1 : ctx.year;

  return quarterContext(`Q${previousQuarter}` as DashboardFilters["quarter"], year);
}

function segmentWhere(segment: DashboardFilters["segment"]): Segment | undefined {
  return segmentMap[segment];
}

function regionWhere(region: DashboardFilters["region"]): string | undefined {
  return regionMap[region];
}

function accountFilter(filters: DashboardFilters): Prisma.AccountWhereInput {
  const conditions: Prisma.AccountWhereInput[] = [];

  const segment = segmentWhere(filters.segment);
  const region = regionWhere(filters.region);

  if (segment) {
    conditions.push({ segment });
  }

  if (region) {
    conditions.push({ region });
  }

  if (filters.q) {
    conditions.push({
      OR: [{ name: { contains: filters.q } }, { ownerAE: { name: { contains: filters.q } } }],
    });
  }

  return conditions.length ? { AND: conditions } : {};
}

function opportunityFilter(filters: DashboardFilters, start: Date, end: Date): Prisma.OpportunityWhereInput {
  const segment = segmentWhere(filters.segment);
  const region = regionWhere(filters.region);
  const accountWhere: Prisma.AccountWhereInput = {};

  if (segment) {
    accountWhere.segment = segment;
  }

  if (region) {
    accountWhere.region = region;
  }

  const where: Prisma.OpportunityWhereInput = {
    closeDate: { gte: start, lte: end },
    account: accountWhere,
  };

  if (filters.q) {
    where.OR = [
      { account: { name: { contains: filters.q } } },
      { ownerAE: { name: { contains: filters.q } } },
      { nextStep: { contains: filters.q } },
    ];
  }

  return where;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function pctDelta(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return ((current - previous) / previous) * 100;
}

function toHealthBand(score: number): "healthy" | "watch" | "risk" {
  if (score >= 75) {
    return "healthy";
  }
  if (score >= 60) {
    return "watch";
  }
  return "risk";
}

function discountGuardrailLabel(discount: number): string {
  if (discount <= 0.1) {
    return "Rep Discretion";
  }
  if (discount <= 0.2) {
    return "Manager Approval";
  }
  if (discount <= 0.3) {
    return "Director Approval";
  }
  return "VP Exception";
}

export async function getDashboardData(filters: DashboardFilters) {
  const ctx = quarterContext(filters.quarter);
  const prev = priorQuarter(ctx);
  const now = new Date();

  const [
    target,
    prevTarget,
    quarterOpps,
    prevQuarterOpps,
    snapshots,
    accounts,
    meetings45,
    qbrs,
    accountPlans,
    approvals,
    aes,
    aeActivities,
    renewalTouches,
  ] = await Promise.all([
    db.quarterTarget.findUnique({ where: { quarter: ctx.key } }),
    db.quarterTarget.findUnique({ where: { quarter: prev.key } }),
    db.opportunity.findMany({
      where: opportunityFilter(filters, ctx.start, ctx.end),
      include: {
        account: true,
        ownerAE: true,
      },
    }),
    db.opportunity.findMany({
      where: opportunityFilter(filters, prev.start, prev.end),
      include: {
        account: true,
        ownerAE: true,
      },
    }),
    db.forecastSnapshot.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.account.findMany({
      where: accountFilter(filters),
      include: {
        ownerAE: true,
        stakeholders: true,
        supportTicket: true,
        usageMetrics: {
          orderBy: { date: "asc" },
        },
      },
    }),
    db.activity.groupBy({
      by: ["accountId"],
      where: {
        date: { gte: subDays(now, 45) },
        type: ActivityType.MEETING,
      },
      _count: { _all: true },
    }),
    db.qBR.findMany({
      where: { quarter: ctx.key },
    }),
    db.accountPlan.findMany({
      include: {
        account: true,
      },
    }),
    db.discountApproval.findMany({
      include: {
        opportunity: {
          include: {
            account: true,
            ownerAE: true,
          },
        },
      },
    }),
    db.aE.findMany({
      include: {
        accounts: {
          include: { stakeholders: true },
        },
      },
    }),
    db.activity.groupBy({
      by: ["aeId", "type"],
      where: {
        date: { gte: ctx.start, lte: ctx.end },
      },
      _count: { _all: true },
    }),
    db.activity.findMany({
      where: {
        date: { gte: subDays(now, 30) },
        type: {
          in: [ActivityType.CALL, ActivityType.EMAIL, ActivityType.MEETING, ActivityType.QBR],
        },
        account: {
          renewalDate: { lte: addDays(now, 90) },
        },
      },
      select: { aeId: true },
    }),
  ]);

  const openStages = new Set<OpportunityStage>([
    OpportunityStage.PROSPECT,
    OpportunityStage.DISCOVERY,
    OpportunityStage.TECH_EVAL,
    OpportunityStage.PROPOSAL,
    OpportunityStage.NEGOTIATION,
    OpportunityStage.LEGAL,
  ]);

  const openQuarterOpps = quarterOpps.filter((opp) => openStages.has(opp.stage));
  const wonQuarterOpps = quarterOpps.filter((opp) => opp.stage === OpportunityStage.CLOSED_WON);

  const openPrevOpps = prevQuarterOpps.filter((opp) => openStages.has(opp.stage));
  const wonPrevOpps = prevQuarterOpps.filter((opp) => opp.stage === OpportunityStage.CLOSED_WON);

  const expansionArr = sum(wonQuarterOpps.filter((opp) => opp.type === "EXPANSION").map((opp) => opp.amount));
  const renewalArr = sum(wonQuarterOpps.filter((opp) => opp.type === "RENEWAL").map((opp) => opp.amount));

  const prevExpansionArr = sum(wonPrevOpps.filter((opp) => opp.type === "EXPANSION").map((opp) => opp.amount));
  const prevRenewalArr = sum(wonPrevOpps.filter((opp) => opp.type === "RENEWAL").map((opp) => opp.amount));

  const renewableBase = sum(quarterOpps.filter((opp) => opp.type === "RENEWAL").map((opp) => opp.amount));
  const prevRenewableBase = sum(prevQuarterOpps.filter((opp) => opp.type === "RENEWAL").map((opp) => opp.amount));

  const nrr = renewableBase > 0 ? (renewalArr / renewableBase) * 100 : 0;
  const prevNrr = prevRenewableBase > 0 ? (prevRenewalArr / prevRenewableBase) * 100 : 0;

  const totalPipeline = sum(openQuarterOpps.map((opp) => opp.amount));
  const totalWon = sum(wonQuarterOpps.map((opp) => opp.amount));
  const remainingTarget = Math.max((target?.teamTargetArr ?? 1) - totalWon, 1);
  const coverage = pipelineCoverage(totalPipeline, remainingTarget);

  const prevPipeline = sum(openPrevOpps.map((opp) => opp.amount));
  const prevWon = sum(wonPrevOpps.map((opp) => opp.amount));
  const prevRemainingTarget = Math.max((prevTarget?.teamTargetArr ?? 1) - prevWon, 1);
  const prevCoverage = pipelineCoverage(prevPipeline, prevRemainingTarget);

  const forecast = bucketForecast(openQuarterOpps);

  const forecastTrend = snapshots
    .slice(0, 4)
    .reverse()
    .map((snapshot) => ({
      quarter: snapshot.quarter,
      commit: snapshot.commit,
      actual: snapshot.actual,
      errorPct: forecastAccuracy(snapshot.actual, snapshot.commit),
    }));

  const avgError =
    forecastTrend.length > 0
      ? sum(forecastTrend.map((item) => item.errorPct)) / forecastTrend.length
      : 0;

  const stageBreakdown = stageBreakdownByBucket(openQuarterOpps).map((stage) => ({
    stage: stage.stage.replaceAll("_", " "),
    commit: stage.commit,
    bestCase: stage.bestCase,
    pipeline: stage.pipeline,
  }));

  const topDeals = openQuarterOpps
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 15)
    .map((opp) => ({
      id: opp.id,
      deal: opp.account.name,
      stage: opp.stage.replaceAll("_", " "),
      amount: opp.amount,
      closeDate: format(opp.closeDate, "yyyy-MM-dd"),
      confidence: opp.probability,
      nextStep: opp.nextStep,
      owner: opp.ownerAE.name,
    }));

  const meetings45Map = new Map(meetings45.map((row) => [row.accountId, row._count._all]));
  const qbrCompletedAccounts = new Set(
    qbrs
      .filter((qbr) => qbr.status === QBRStatus.COMPLETED)
      .map((qbr) => qbr.accountId),
  );

  const healthRows = accounts.map((account) => {
    const metrics = account.usageMetrics;
    const firstMetric = metrics[0];
    const lastMetric = metrics[metrics.length - 1];

    const usageTrendPct =
      firstMetric && lastMetric && firstMetric.apiCalls > 0
        ? ((lastMetric.apiCalls - firstMetric.apiCalls) / firstMetric.apiCalls) * 100
        : 0;

    const openTicketWeight = account.supportTicket
      .filter((ticket) => ticket.status !== "closed")
      .reduce((acc, ticket) => acc + severityWeight[ticket.severity], 0);

    const health = computeHealthScore({
      usageTrendPct,
      openTicketsWeighted: openTicketWeight,
      meetingsLast45Days: meetings45Map.get(account.id) ?? 0,
      qbrCompleted: qbrCompletedAccounts.has(account.id),
      activeStakeholders: account.stakeholders.length,
      renewalDate: account.renewalDate,
      paymentStatus: account.paymentStatus as PaymentStatus,
    });

    return {
      accountId: account.id,
      account: account.name,
      owner: account.ownerAE.name,
      arr: account.arr,
      renewalDate: format(account.renewalDate, "yyyy-MM-dd"),
      healthScore: Math.round(health.weightedScore),
      healthBand: toHealthBand(health.weightedScore),
      breakdown: health,
      actions: ["Schedule QBR", "Escalate to Product", "Exec sponsor", "Offer training", "Renegotiate plan"],
    };
  });

  const atRisk = healthRows.filter((row) => row.healthScore < 60);

  const activityByAE = new Map<string, { meetings: number; emails: number; calls: number; qbr: number }>();
  for (const row of aeActivities) {
    if (!activityByAE.has(row.aeId)) {
      activityByAE.set(row.aeId, { meetings: 0, emails: 0, calls: 0, qbr: 0 });
    }

    const current = activityByAE.get(row.aeId)!;
    if (row.type === ActivityType.MEETING) {
      current.meetings += row._count._all;
    }
    if (row.type === ActivityType.EMAIL) {
      current.emails += row._count._all;
    }
    if (row.type === ActivityType.CALL) {
      current.calls += row._count._all;
    }
    if (row.type === ActivityType.QBR) {
      current.qbr += row._count._all;
    }
  }

  const renewalTouchesMap = new Map<string, number>();
  for (const activity of renewalTouches) {
    renewalTouchesMap.set(activity.aeId, (renewalTouchesMap.get(activity.aeId) ?? 0) + 1);
  }

  const targetPerAE = aes.length > 0 ? remainingTarget / aes.length : remainingTarget;

  const teamLeaderboard = aes.map((ae) => {
    const aeOpps = quarterOpps.filter((opp) => opp.ownerAEId === ae.id);
    const aeOpen = aeOpps.filter((opp) => openStages.has(opp.stage));
    const aeWon = aeOpps.filter((opp) => opp.stage === OpportunityStage.CLOSED_WON);
    const aeLost = aeOpps.filter((opp) => opp.stage === OpportunityStage.CLOSED_LOST);
    const expansionARR = sum(aeWon.filter((opp) => opp.type === "EXPANSION").map((opp) => opp.amount));
    const retentionARR = sum(aeWon.filter((opp) => opp.type === "RENEWAL").map((opp) => opp.amount));
    const winRate = aeWon.length + aeLost.length > 0 ? (aeWon.length / (aeWon.length + aeLost.length)) * 100 : 0;
    const cycleDays =
      aeWon.length > 0
        ? sum(aeWon.map((opp) => (opp.closeDate.getTime() - opp.createdAt.getTime()) / (1000 * 60 * 60 * 24))) /
          aeWon.length
        : 0;
    const act = activityByAE.get(ae.id) ?? { meetings: 0, emails: 0, calls: 0, qbr: 0 };
    const activityVolume = act.meetings + act.emails + act.calls + act.qbr;

    return {
      aeId: ae.id,
      aeName: ae.name,
      region: ae.region,
      expansionARR,
      retentionARR,
      winRate,
      cycleDays,
      activityVolume,
      pipelineCoverage: targetPerAE > 0 ? sum(aeOpen.map((opp) => opp.amount)) / targetPerAE : 0,
      avgDiscount:
        aeOpen.length > 0 ? sum(aeOpen.map((opp) => opp.discountRequested)) / aeOpen.length : 0,
      stakeholderCountAvg:
        ae.accounts.length > 0
          ? sum(ae.accounts.map((account) => account.stakeholders.length)) / ae.accounts.length
          : 0,
      slippingDeals: aeOpen.filter((opp) => opp.closeDate < now).length,
      renewalTouches30d: renewalTouchesMap.get(ae.id) ?? 0,
    };
  });

  const coachingFlags = buildCoachingFlags(teamLeaderboard);

  const qbrCadence = {
    completed: qbrs.filter((qbr) => qbr.status === QBRStatus.COMPLETED).length,
    scheduled: qbrs.filter((qbr) => qbr.status === QBRStatus.SCHEDULED).length,
    overdue: qbrs.filter((qbr) => qbr.status === QBRStatus.OVERDUE).length,
  };

  const avgPlanCompleteness =
    accountPlans.length > 0
      ? sum(accountPlans.map((plan) => accountPlanCompleteness(plan))) / accountPlans.length
      : 0;

  const guardrails = {
    pending: approvals.filter((approval) => approval.approvalStatus === ApprovalStatus.PENDING).length,
    aboveThreshold: approvals.filter((approval) => approval.requestedDiscount > 0.2).length,
    averageRequestedDiscount:
      approvals.length > 0 ? sum(approvals.map((approval) => approval.requestedDiscount)) / approvals.length : 0,
  };

  const actionCandidates = [
    ...atRisk.slice(0, 4).map((risk, index) => ({
      id: `risk-${risk.accountId}`,
      title: `Stabilize ${risk.account} renewal risk (${risk.healthScore}/100)` ,
      owner: risk.owner,
      impactScore: 9 - index,
      urgencyScore: 8,
    })),
    ...coachingFlags.slice(0, 4).map((flag, index) => ({
      id: `coach-${flag.aeId}-${flag.flag}`,
      title: `1:1 coaching: ${flag.aeName} on ${flag.flag.toLowerCase().replaceAll("_", " ")}`,
      owner: flag.aeName,
      impactScore: 7 - index,
      urgencyScore: flag.severity === "high" ? 8 : 6,
    })),
    ...approvals
      .filter((approval) => approval.approvalStatus === ApprovalStatus.PENDING)
      .slice(0, 3)
      .map((approval, index) => ({
        id: `approval-${approval.id}`,
        title: `Review ${approval.opportunity.account.name} discount (${(approval.requestedDiscount * 100).toFixed(1)}%)`,
        owner: approval.opportunity.ownerAE.name,
        impactScore: 6 - index,
        urgencyScore: 7,
        blocked: true,
      })),
  ];

  return {
    filters,
    quarterKey: ctx.key,
    executiveSnapshot: {
      nrr: { value: nrr, delta: pctDelta(nrr, prevNrr) },
      expansionArr: { value: expansionArr, delta: pctDelta(expansionArr, prevExpansionArr) },
      renewalArr: { value: renewalArr, delta: pctDelta(renewalArr, prevRenewalArr) },
      pipelineCoverage: { value: coverage, delta: pctDelta(coverage, prevCoverage) },
      forecastVsTarget: {
        commit: forecast.commit,
        bestCase: forecast.bestCase,
        upside: forecast.upside,
        target: target?.teamTargetArr ?? 0,
      },
      forecastAccuracy: {
        averageError: avgError,
        trend: forecastTrend,
      },
    },
    forecastAndPipeline: {
      stageBreakdown,
      trend: forecastTrend,
      topDeals,
    },
    customerHealth: {
      atRiskCount: atRisk.length,
      arrAtRisk: sum(atRisk.map((row) => row.arr)),
      rows: healthRows.sort((a, b) => a.healthScore - b.healthScore).slice(0, 25),
      weightTransparency: {
        usageTrend: 30,
        support: 20,
        engagement: 20,
        renewalProximity: 15,
        payment: 15,
      },
    },
    teamPerformance: {
      leaderboard: teamLeaderboard,
      coachingFlags,
    },
    operatingCadence: {
      qbrCadence,
      accountPlanCompleteness: avgPlanCompleteness,
      guardrails,
    },
    managerActions: rankManagerActions(actionCandidates),
  };
}

export async function getAccountsData(filters: DashboardFilters) {
  const accounts = await db.account.findMany({
    where: accountFilter(filters),
    include: {
      ownerAE: true,
      accountPlan: true,
      qbrs: true,
      stakeholders: true,
      opportunities: {
        where: {
          stage: {
            in: [
              OpportunityStage.PROSPECT,
              OpportunityStage.DISCOVERY,
              OpportunityStage.TECH_EVAL,
              OpportunityStage.PROPOSAL,
              OpportunityStage.NEGOTIATION,
              OpportunityStage.LEGAL,
            ],
          },
        },
      },
    },
    orderBy: [{ healthScore: "asc" }, { arr: "desc" }],
  });

  return accounts.map((account) => ({
    id: account.id,
    name: account.name,
    segment: account.segment,
    region: account.region,
    arr: account.arr,
    renewalDate: format(account.renewalDate, "yyyy-MM-dd"),
    aiMaturity: account.aiMaturity,
    healthScore: account.healthScore,
    owner: account.ownerAE.name,
    paymentStatus: account.paymentStatus,
    openPipeline: sum(account.opportunities.map((opp) => opp.amount)),
    qbrStatus: account.qbrs[0]?.status ?? "SCHEDULED",
    accountPlanCompleteness: accountPlanCompleteness(account.accountPlan),
  }));
}

export async function getAccountDetail(accountId: string) {
  const account = await db.account.findUnique({
    where: { id: accountId },
    include: {
      ownerAE: true,
      stakeholders: true,
      usageMetrics: { orderBy: { date: "asc" } },
      supportTicket: { orderBy: { date: "desc" } },
      qbrs: { orderBy: { quarter: "desc" }, take: 2 },
      opportunities: { orderBy: { closeDate: "asc" } },
      activities: { orderBy: { date: "desc" }, take: 12 },
      accountPlan: true,
    },
  });

  if (!account) {
    return null;
  }

  const usage = account.usageMetrics;
  const first = usage[0];
  const last = usage[usage.length - 1];
  const usageTrendPct = first && last && first.apiCalls > 0 ? ((last.apiCalls - first.apiCalls) / first.apiCalls) * 100 : 0;

  const openTicketWeight = account.supportTicket
    .filter((ticket) => ticket.status !== "closed")
    .reduce((acc, ticket) => acc + severityWeight[ticket.severity], 0);

  const meetings45 = account.activities.filter(
    (activity) => activity.type === ActivityType.MEETING && activity.date >= subDays(new Date(), 45),
  ).length;

  const qbrCompleted = account.qbrs.some((qbr) => qbr.status === QBRStatus.COMPLETED);

  const health = computeHealthScore({
    usageTrendPct,
    openTicketsWeighted: openTicketWeight,
    meetingsLast45Days: meetings45,
    qbrCompleted,
    activeStakeholders: account.stakeholders.length,
    renewalDate: account.renewalDate,
    paymentStatus: account.paymentStatus,
  });

  return {
    id: account.id,
    name: account.name,
    segment: account.segment,
    region: account.region,
    arr: account.arr,
    renewalDate: format(account.renewalDate, "yyyy-MM-dd"),
    aiMaturity: account.aiMaturity,
    owner: account.ownerAE.name,
    health,
    usageMetrics: account.usageMetrics.map((metric) => ({
      date: format(metric.date, "MMM dd"),
      apiCalls: metric.apiCalls,
      seatsActive: metric.seatsActive,
    })),
    stakeholders: account.stakeholders,
    qbrs: account.qbrs,
    risks: account.supportTicket
      .filter((ticket) => ticket.status !== "closed" || ticket.severity === Severity.HIGH || ticket.severity === Severity.CRITICAL)
      .map((ticket) => ({
        id: ticket.id,
        severity: ticket.severity,
        status: ticket.status,
        date: format(ticket.date, "yyyy-MM-dd"),
      })),
    nextActions: account.opportunities
      .filter((opp) => {
        const openStageSet: OpportunityStage[] = [
          OpportunityStage.PROSPECT,
          OpportunityStage.DISCOVERY,
          OpportunityStage.TECH_EVAL,
          OpportunityStage.PROPOSAL,
          OpportunityStage.NEGOTIATION,
          OpportunityStage.LEGAL,
        ];

        return openStageSet.includes(opp.stage);
      })
      .slice(0, 5)
      .map((opp) => ({
        id: opp.id,
        closeDate: format(opp.closeDate, "yyyy-MM-dd"),
        stage: opp.stage,
        nextStep: opp.nextStep,
        amount: opp.amount,
      })),
    plan: account.accountPlan,
  };
}

export async function getPipelineData(filters: DashboardFilters) {
  const ctx = quarterContext(filters.quarter);
  const where = opportunityFilter(filters, ctx.start, ctx.end);

  const [opps, approvals, funnelRows] = await Promise.all([
    db.opportunity.findMany({
      where,
      include: {
        account: true,
        ownerAE: true,
        discountApproval: true,
      },
    }),
    db.discountApproval.findMany({
      include: {
        opportunity: {
          include: {
            account: true,
            ownerAE: true,
          },
        },
      },
    }),
    db.$queryRaw<{ stage: string; count: number }[]>`
      SELECT stage, COUNT(*) as count
      FROM "Opportunity"
      WHERE closeDate >= ${ctx.start.toISOString()} AND closeDate <= ${ctx.end.toISOString()}
      GROUP BY stage
      ORDER BY count DESC
    `,
  ]);

  const openOpps = opps.filter(
    (opp) =>
      opp.stage !== OpportunityStage.CLOSED_LOST &&
      opp.stage !== OpportunityStage.CLOSED_WON &&
      opp.probability >= 0.1,
  );

  const adjustableStages: OpportunityStage[] = [
    OpportunityStage.PROSPECT,
    OpportunityStage.DISCOVERY,
    OpportunityStage.TECH_EVAL,
    OpportunityStage.PROPOSAL,
    OpportunityStage.NEGOTIATION,
    OpportunityStage.LEGAL,
  ];

  const defaultStageProbabilities = adjustableStages
    .reduce<Record<string, number>>((acc, stage) => {
      const stageOpps = openOpps.filter((opp) => opp.stage === stage);
      acc[stage] = stageOpps.length
        ? Math.round((sum(stageOpps.map((opp) => opp.probability)) / stageOpps.length) * 100)
        : 0;
      return acc;
    }, {});

  const buckets = bucketForecast(openOpps);

  return {
    quarterKey: ctx.key,
    funnel: funnelRows.map((row) => ({
      stage: row.stage.replaceAll("_", " "),
      count: Number(row.count),
    })),
    scenarioDefaults: defaultStageProbabilities,
    scenarioBase: {
      commit: buckets.commit,
      bestCase: buckets.bestCase,
      upside: buckets.upside,
    },
    dealDesk: openOpps
      .sort((a, b) => b.discountRequested - a.discountRequested)
      .slice(0, 40)
      .map((opp) => {
        const approval = opp.discountApproval ?? approvals.find((item) => item.opportunityId === opp.id);
        const risk: "low" | "medium" | "high" =
          opp.discountRequested > 0.2 ? "high" : opp.discountRequested > 0.1 ? "medium" : "low";

        return {
          id: opp.id,
          deal: opp.account.name,
          owner: opp.ownerAE.name,
          stage: opp.stage,
          amount: opp.amount,
          requestedDiscount: opp.discountRequested,
          guardrail: discountGuardrailLabel(opp.discountRequested),
          justification: approval?.justification ?? "Competitive pressure and term alignment.",
          risk,
          approvalStatus: approval?.approvalStatus ?? ApprovalStatus.PENDING,
          recommendedCounter:
            approval?.recommendedCounter ??
            (opp.discountRequested > 0.2
              ? "Trade 2-year term for discount reduction to 15%."
              : "Offer enablement package before price concession."),
        };
      }),
  };
}

export async function recalculatePipelineScenario(
  quarter: DashboardFilters["quarter"],
  stageProbabilityOverrides: Record<string, number>,
) {
  const ctx = quarterContext(quarter);

  const opps = await db.opportunity.findMany({
    where: {
      closeDate: { gte: ctx.start, lte: ctx.end },
      stage: {
        notIn: [OpportunityStage.CLOSED_LOST, OpportunityStage.CLOSED_WON],
      },
    },
  });

  const adjusted = opps.map((opp) => ({
    ...opp,
    probability: Math.max(0, Math.min(1, (stageProbabilityOverrides[opp.stage] ?? opp.probability * 100) / 100)),
  }));

  const buckets = bucketForecast(adjusted);
  const byStage = stageBreakdownByBucket(adjusted).map((stage) => ({
    stage: stage.stage,
    commit: stage.commit,
    bestCase: stage.bestCase,
    pipeline: stage.pipeline,
  }));

  return {
    commit: buckets.commit,
    bestCase: buckets.bestCase,
    upside: buckets.upside,
    byStage,
  };
}

export async function getTeamData(filters: DashboardFilters) {
  const ctx = quarterContext(filters.quarter);
  const sixMonthsAgo = subMonths(new Date(), 6);

  const [aes, opportunities, activities, quarterTarget] = await Promise.all([
    db.aE.findMany({
      include: {
        accounts: {
          include: {
            stakeholders: true,
          },
        },
      },
    }),
    db.opportunity.findMany({
      where: {
        closeDate: {
          gte: sixMonthsAgo,
          lte: ctx.end,
        },
      },
    }),
    db.activity.findMany({
      where: {
        date: { gte: sixMonthsAgo, lte: ctx.end },
      },
    }),
    db.quarterTarget.findUnique({ where: { quarter: ctx.key } }),
  ]);

  const quarterOpps = opportunities.filter((opp) => opp.closeDate >= ctx.start && opp.closeDate <= ctx.end);
  const targetPerAE = aes.length > 0 ? (quarterTarget?.teamTargetArr ?? 0) / aes.length : 0;

  return aes.map((ae) => {
    const aeOpps = quarterOpps.filter((opp) => opp.ownerAEId === ae.id);
    const won = aeOpps.filter((opp) => opp.stage === OpportunityStage.CLOSED_WON);
    const lost = aeOpps.filter((opp) => opp.stage === OpportunityStage.CLOSED_LOST);
    const closedStages: OpportunityStage[] = [OpportunityStage.CLOSED_WON, OpportunityStage.CLOSED_LOST];
    const open = aeOpps.filter(
      (opp) => !closedStages.includes(opp.stage),
    );

    const aeActivities = activities.filter((activity) => activity.aeId === ae.id);
    const monthlyTrend = Array.from({ length: 6 }, (_, index) => {
      const month = subMonths(new Date(), 5 - index);
      const monthKey = format(month, "yyyy-MM");
      const oppsInMonth = aeOpps.filter((opp) => format(opp.closeDate, "yyyy-MM") === monthKey);
      const actsInMonth = aeActivities.filter((activity) => format(activity.date, "yyyy-MM") === monthKey);

      return {
        month: format(month, "MMM"),
        wonArr: sum(
          oppsInMonth
            .filter((opp) => opp.stage === OpportunityStage.CLOSED_WON)
            .map((opp) => opp.amount),
        ),
        pipelineArr: sum(
          oppsInMonth
            .filter((opp) => !closedStages.includes(opp.stage))
            .map((opp) => opp.amount),
        ),
        activityCount: actsInMonth.length,
      };
    });

    const pipelineCoverageValue = targetPerAE > 0 ? sum(open.map((opp) => opp.amount)) / targetPerAE : 0;
    const winRate = won.length + lost.length > 0 ? (won.length / (won.length + lost.length)) * 100 : 0;
    const avgDiscount = open.length > 0 ? sum(open.map((opp) => opp.discountRequested)) / open.length : 0;

    const renewalTouchpoints = aeActivities.filter((activity) => {
      if (![ActivityType.CALL, ActivityType.EMAIL, ActivityType.MEETING, ActivityType.QBR].includes(activity.type)) {
        return false;
      }

      const account = ae.accounts.find((item) => item.id === activity.accountId);
      return !!account && account.renewalDate <= addDays(new Date(), 90);
    }).length;

    const talkingPoints = {
      working:
        winRate >= 35
          ? `Strong win conversion at ${winRate.toFixed(1)}% with consistent activity volume.`
          : `Pipeline generation is active; activity should convert more efficiently in late stages.`,
      stuck:
        pipelineCoverageValue < 2.5
          ? `Coverage is ${pipelineCoverageValue.toFixed(2)}x, below 2.5x target.`
          : `Discount pressure averaging ${(avgDiscount * 100).toFixed(1)}% is reducing margin quality.`,
      nextWeek:
        renewalTouchpoints < 4
          ? "Add executive touch and QBR follow-ups on top 3 near-term renewals."
          : "Run deal review on slipping opportunities with close-plan milestones.",
    };

    return {
      aeId: ae.id,
      name: ae.name,
      region: ae.region,
      pipelineCoverage: pipelineCoverageValue,
      winRate,
      avgDiscount,
      renewalTouchpoints,
      monthlyTrend,
      talkingPoints,
      expansionArr: sum(
        won
          .filter((opp) => opp.type === "EXPANSION")
          .map((opp) => opp.amount),
      ),
      retentionArr: sum(
        won
          .filter((opp) => opp.type === "RENEWAL")
          .map((opp) => opp.amount),
      ),
    };
  });
}

export async function getDemoSources() {
  const snapshot = await import("@/data/customer_snapshot.json");

  return snapshot.default.slice(0, 30);
}

export function healthBreakdownRows(breakdown: HealthScoreBreakdown) {
  return [
    { metric: "Usage trend", weight: "30%", value: breakdown.usageTrendScore },
    { metric: "Support burden", weight: "20%", value: breakdown.supportScore },
    { metric: "Stakeholder engagement", weight: "20%", value: breakdown.engagementScore },
    { metric: "Renewal proximity", weight: "15%", value: breakdown.renewalScore },
    { metric: "Payment reliability", weight: "15%", value: breakdown.paymentScore },
  ];
}

export async function getFilterOptions() {
  const [regions, segments] = await Promise.all([
    db.account.findMany({
      select: { region: true },
      distinct: ["region"],
      orderBy: { region: "asc" },
    }),
    db.account.findMany({
      select: { segment: true },
      distinct: ["segment"],
    }),
  ]);

  return {
    regions: regions.map((entry) => entry.region),
    segments: segments.map((entry) => entry.segment),
    quarters: ["Q1", "Q2", "Q3", "Q4"],
  };
}

