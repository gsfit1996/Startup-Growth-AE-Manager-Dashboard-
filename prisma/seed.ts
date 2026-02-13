import fs from "node:fs/promises";
import path from "node:path";

import {
  ActivityType,
  AiMaturity,
  ApprovalStatus,
  OpportunityStage,
  OpportunityType,
  PaymentStatus,
  PrismaClient,
  QBRStatus,
  RiskLevel,
  Segment,
  Severity,
} from "@prisma/client";
import { faker } from "@faker-js/faker";
import {
  addDays,
  addMonths,
  endOfQuarter,
  startOfQuarter,
  subDays,
  subMonths,
} from "date-fns";

import { computeHealthScore } from "../lib/metrics/health";

const prisma = new PrismaClient();

type SnapshotRow = {
  companyName: string;
  sourceUrl: string;
  industryHint: string;
  aiUseCase: string;
  evidenceSnippet: string;
  segmentHint: "Seed" | "Series A" | "Series B+";
  lastSeenAt: string;
};

const aeSeed = [
  { name: "Alex Morgan", region: "EMEA" },
  { name: "Samir Patel", region: "NA" },
  { name: "Nora Flynn", region: "EMEA" },
  { name: "Diego Alvarez", region: "NA" },
  { name: "Priya Desai", region: "APAC" },
  { name: "Liam O'Connell", region: "EMEA" },
  { name: "Hana Kim", region: "APAC" },
  { name: "Jordan Reed", region: "NA" },
] as const;

const stageProbability: Record<OpportunityStage, number> = {
  PROSPECT: 0.15,
  DISCOVERY: 0.25,
  TECH_EVAL: 0.45,
  PROPOSAL: 0.58,
  NEGOTIATION: 0.75,
  LEGAL: 0.82,
  CLOSED_WON: 1,
  CLOSED_LOST: 0,
};

function quarterOf(date: Date): `Q1` | `Q2` | `Q3` | `Q4` {
  const month = date.getMonth();
  if (month <= 2) return "Q1";
  if (month <= 5) return "Q2";
  if (month <= 8) return "Q3";
  return "Q4";
}

function quarterKey(date: Date): string {
  return `${date.getFullYear()}-${quarterOf(date)}`;
}

function randomSegment(index: number): Segment {
  if (index < 40) return Segment.SEED;
  if (index < 85) return Segment.SERIES_A;
  return Segment.SERIES_B_PLUS;
}

function arrForSegment(segment: Segment): number {
  if (segment === Segment.SEED) return faker.number.int({ min: 20000, max: 90000 });
  if (segment === Segment.SERIES_A) return faker.number.int({ min: 70000, max: 220000 });
  return faker.number.int({ min: 180000, max: 550000 });
}

function aiMaturityForSegment(segment: Segment): AiMaturity {
  if (segment === Segment.SEED) {
    return faker.helpers.weightedArrayElement([
      { weight: 6, value: AiMaturity.LOW },
      { weight: 3, value: AiMaturity.MEDIUM },
      { weight: 1, value: AiMaturity.HIGH },
    ]);
  }

  if (segment === Segment.SERIES_A) {
    return faker.helpers.weightedArrayElement([
      { weight: 2, value: AiMaturity.LOW },
      { weight: 6, value: AiMaturity.MEDIUM },
      { weight: 2, value: AiMaturity.HIGH },
    ]);
  }

  return faker.helpers.weightedArrayElement([
    { weight: 1, value: AiMaturity.LOW },
    { weight: 4, value: AiMaturity.MEDIUM },
    { weight: 5, value: AiMaturity.HIGH },
  ]);
}

async function loadSnapshot(): Promise<SnapshotRow[]> {
  const snapshotPath = path.join(process.cwd(), "data", "customer_snapshot.json");
  const raw = await fs.readFile(snapshotPath, "utf8");
  return JSON.parse(raw) as SnapshotRow[];
}

async function resetDatabase() {
  await prisma.discountApproval.deleteMany();
  await prisma.forecastSnapshot.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.qBR.deleteMany();
  await prisma.usageMetric.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.stakeholder.deleteMany();
  await prisma.accountPlan.deleteMany();
  await prisma.account.deleteMany();
  await prisma.aE.deleteMany();
  await prisma.quarterTarget.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await resetDatabase();

  const snapshot = await loadSnapshot();

  const manager = await prisma.user.create({
    data: {
      name: "Demo Manager",
      email: "manager@demo.local",
      role: "Growth AE Manager",
    },
  });

  const aes = [] as Awaited<ReturnType<typeof prisma.aE.create>>[];
  for (const ae of aeSeed) {
    const created = await prisma.aE.create({
      data: {
        name: ae.name,
        region: ae.region,
        startDate: faker.date.between({ from: subMonths(new Date(), 30), to: subMonths(new Date(), 6) }),
        managerId: manager.id,
      },
    });

    aes.push(created);
  }

  const accounts: Awaited<ReturnType<typeof prisma.account.create>>[] = [];

  for (let i = 0; i < 120; i += 1) {
    const segment = randomSegment(i);
    const arr = arrForSegment(segment);
    const atRisk = faker.datatype.boolean({ probability: 0.27 });

    const owner = faker.helpers.arrayElement(aes);

    const source = snapshot[i % snapshot.length];
    const suffix = i < snapshot.length ? "" : ` ${faker.company.buzzNoun()}`;

    const renewalDate = atRisk
      ? addDays(new Date(), faker.number.int({ min: 15, max: 95 }))
      : addDays(new Date(), faker.number.int({ min: 90, max: 360 }));

    const paymentStatus = atRisk
      ? faker.helpers.weightedArrayElement([
          { weight: 4, value: PaymentStatus.WATCH },
          { weight: 3, value: PaymentStatus.OVERDUE },
          { weight: 3, value: PaymentStatus.GOOD },
        ])
      : faker.helpers.weightedArrayElement([
          { weight: 8, value: PaymentStatus.GOOD },
          { weight: 2, value: PaymentStatus.WATCH },
        ]);

    const account = await prisma.account.create({
      data: {
        name: `${source?.companyName ?? faker.company.name()}${suffix}`,
        segment,
        region: owner.region,
        arr,
        renewalDate,
        aiMaturity: aiMaturityForSegment(segment),
        ownerAEId: owner.id,
        paymentStatus,
        healthScore: atRisk ? faker.number.int({ min: 30, max: 58 }) : faker.number.int({ min: 65, max: 94 }),
      },
    });

    accounts.push(account);

    const stakeholderCount = Math.max(
      2,
      Math.min(8, Math.round(arr / 100000) + faker.number.int({ min: 1, max: 3 })),
    );

    for (let s = 0; s < stakeholderCount; s += 1) {
      await prisma.stakeholder.create({
        data: {
          accountId: account.id,
          name: faker.person.fullName(),
          role: faker.helpers.arrayElement([
            "Technical Champion",
            "Engineering Manager",
            "Product Lead",
            "Finance",
            "Procurement",
            "Economic Buyer",
          ]),
          seniority: faker.helpers.arrayElement(["IC", "Manager", "Director", "VP", "C-level"]),
        },
      });
    }

    const usageBase = Math.max(800, Math.round(arr / 8));
    for (let m = 5; m >= 0; m -= 1) {
      const date = subMonths(new Date(), m);
      const trendFactor = atRisk ? 1 - (5 - m) * 0.08 : 1 + (5 - m) * 0.06;
      const apiCalls = Math.max(200, Math.round(usageBase * trendFactor * faker.number.float({ min: 0.88, max: 1.12 })));
      const seats = Math.max(4, Math.round((arr / 12000) * trendFactor * faker.number.float({ min: 0.9, max: 1.15 })));

      await prisma.usageMetric.create({
        data: {
          accountId: account.id,
          date,
          apiCalls,
          seatsActive: seats,
        },
      });
    }

    const ticketCount = atRisk ? faker.number.int({ min: 2, max: 5 }) : faker.number.int({ min: 0, max: 3 });
    for (let t = 0; t < ticketCount; t += 1) {
      await prisma.supportTicket.create({
        data: {
          accountId: account.id,
          date: faker.date.between({ from: subMonths(new Date(), 4), to: new Date() }),
          severity: atRisk
            ? faker.helpers.weightedArrayElement([
                { weight: 1, value: Severity.LOW },
                { weight: 3, value: Severity.MEDIUM },
                { weight: 3, value: Severity.HIGH },
                { weight: 3, value: Severity.CRITICAL },
              ])
            : faker.helpers.weightedArrayElement([
                { weight: 5, value: Severity.LOW },
                { weight: 3, value: Severity.MEDIUM },
                { weight: 2, value: Severity.HIGH },
              ]),
          status: faker.helpers.arrayElement(["open", "open", "closed"]),
        },
      });
    }

    await prisma.accountPlan.create({
      data: {
        accountId: account.id,
        businessGoals: `Drive reliable AI adoption across ${source?.industryHint ?? "core workflows"}.`,
        successMetrics: atRisk ? "Stabilize usage trend and close renewal gap." : "Increase monthly API utilization by 20%.",
        stakeholderMap: "Champion, Director, Finance, Procurement",
        riskLog: atRisk ? "Renewal timing risk, unresolved support escalations." : "Budget cycle alignment required.",
        expansionHypothesis: "Expand into adjacent team once current KPI threshold sustained.",
        execAlignmentDate: addDays(new Date(), faker.number.int({ min: 7, max: 45 })),
        nextQbrDate: addDays(new Date(), faker.number.int({ min: 20, max: 90 })),
      },
    });
  }

  const currentQuarterStart = startOfQuarter(new Date());
  const currentQuarterEnd = endOfQuarter(new Date());

  const openStages = [
    OpportunityStage.PROSPECT,
    OpportunityStage.DISCOVERY,
    OpportunityStage.TECH_EVAL,
    OpportunityStage.PROPOSAL,
    OpportunityStage.NEGOTIATION,
    OpportunityStage.LEGAL,
  ];

  let guaranteedCurrentQuarterDeals = 0;

  for (let i = 0; i < 250; i += 1) {
    const account = faker.helpers.arrayElement(accounts);
    const owner = aes.find((ae) => ae.id === account.ownerAEId)!;

    const type = faker.helpers.weightedArrayElement([
      { weight: 6, value: OpportunityType.EXPANSION },
      { weight: 4, value: OpportunityType.RENEWAL },
    ]);

    const stage = faker.helpers.weightedArrayElement([
      { weight: 2, value: OpportunityStage.PROSPECT },
      { weight: 2, value: OpportunityStage.DISCOVERY },
      { weight: 2, value: OpportunityStage.TECH_EVAL },
      { weight: 2, value: OpportunityStage.PROPOSAL },
      { weight: 2, value: OpportunityStage.NEGOTIATION },
      { weight: 1, value: OpportunityStage.LEGAL },
      { weight: 2, value: OpportunityStage.CLOSED_WON },
      { weight: 1, value: OpportunityStage.CLOSED_LOST },
    ]);

    const closeDate =
      guaranteedCurrentQuarterDeals < 25
        ? faker.date.between({ from: currentQuarterStart, to: currentQuarterEnd })
        : faker.date.between({ from: subMonths(new Date(), 2), to: addMonths(new Date(), 4) });

    const isGuaranteedOpen = guaranteedCurrentQuarterDeals < 25;
    const resolvedStage = isGuaranteedOpen ? faker.helpers.arrayElement(openStages) : stage;
    if (isGuaranteedOpen) guaranteedCurrentQuarterDeals += 1;

    const amount = Math.round(
      faker.number.float({
        min: Math.max(12000, account.arr * 0.08),
        max: Math.max(35000, account.arr * 0.65),
      }),
    );

    const baseDiscount =
      resolvedStage === OpportunityStage.NEGOTIATION || resolvedStage === OpportunityStage.LEGAL
        ? faker.number.float({ min: 0.08, max: 0.3 })
        : faker.number.float({ min: 0, max: 0.16 });

    const opportunity = await prisma.opportunity.create({
      data: {
        accountId: account.id,
        ownerAEId: owner.id,
        type,
        stage: resolvedStage,
        amount,
        closeDate,
        createdAt: faker.date.between({ from: subMonths(closeDate, 3), to: subDays(closeDate, 10) }),
        probability: stageProbability[resolvedStage],
        discountRequested: Number(baseDiscount.toFixed(3)),
        nextStep: faker.helpers.arrayElement([
          "Confirm success criteria with champion",
          "Schedule economic buyer alignment",
          "Finalize legal redlines",
          "Run pilot outcomes review",
          "Lock procurement timeline",
        ]),
      },
    });

    if (opportunity.discountRequested > 0.1) {
      await prisma.discountApproval.create({
        data: {
          opportunityId: opportunity.id,
          requestedDiscount: opportunity.discountRequested,
          approvalStatus: faker.helpers.weightedArrayElement([
            { weight: 4, value: ApprovalStatus.PENDING },
            { weight: 3, value: ApprovalStatus.APPROVED },
            { weight: 1, value: ApprovalStatus.REJECTED },
          ]),
          approverRole: opportunity.discountRequested > 0.2 ? "Director" : "Manager",
          recommendedCounter:
            opportunity.discountRequested > 0.2
              ? "Trade 24-month term for discount reduction to 15%"
              : "Bundle enablement package before discount",
          riskLevel:
            opportunity.discountRequested > 0.22
              ? RiskLevel.HIGH
              : opportunity.discountRequested > 0.14
                ? RiskLevel.MEDIUM
                : RiskLevel.LOW,
          justification: faker.helpers.arrayElement([
            "Competitive pressure in procurement",
            "Budget freeze and term flexibility request",
            "Security add-on scope expansion",
            "Pilot extension tied to board deadline",
          ]),
        },
      });
    }
  }

  const startActivities = subMonths(new Date(), 6);
  const days = 180;

  for (const ae of aes) {
    const owned = accounts.filter((account) => account.ownerAEId === ae.id);

    for (let day = 0; day < days; day += 1) {
      const date = addDays(startActivities, day);
      const dailyCount = faker.number.int({ min: 1, max: 4 });

      for (let i = 0; i < dailyCount; i += 1) {
        const account = faker.helpers.arrayElement(owned);
        const type = faker.helpers.weightedArrayElement([
          { weight: 3, value: ActivityType.CALL },
          { weight: 4, value: ActivityType.EMAIL },
          { weight: 2, value: ActivityType.MEETING },
          { weight: 1, value: ActivityType.QBR },
        ]);

        await prisma.activity.create({
          data: {
            aeId: ae.id,
            accountId: account.id,
            date,
            type,
            outcome: faker.helpers.arrayElement([
              "advanced",
              "no_response",
              "blocked",
              "follow_up_scheduled",
              "decision_pending",
            ]),
          },
        });
      }
    }
  }

  const currentQuarter = quarterKey(new Date());
  const prevQuarter = quarterKey(subMonths(new Date(), 3));

  for (const account of accounts) {
    const atRisk = account.healthScore < 60;

    await prisma.qBR.create({
      data: {
        accountId: account.id,
        quarter: currentQuarter,
        status: atRisk
          ? faker.helpers.weightedArrayElement([
              { weight: 5, value: QBRStatus.OVERDUE },
              { weight: 3, value: QBRStatus.SCHEDULED },
              { weight: 2, value: QBRStatus.COMPLETED },
            ])
          : faker.helpers.weightedArrayElement([
              { weight: 6, value: QBRStatus.COMPLETED },
              { weight: 3, value: QBRStatus.SCHEDULED },
              { weight: 1, value: QBRStatus.OVERDUE },
            ]),
        notes: "Reviewed adoption metrics, blockers, and expansion hypothesis.",
        nextSteps: "Confirm owners for roadmap dependencies and executive checkpoint.",
      },
    });

    await prisma.qBR.create({
      data: {
        accountId: account.id,
        quarter: prevQuarter,
        status: faker.helpers.arrayElement([QBRStatus.COMPLETED, QBRStatus.COMPLETED, QBRStatus.SCHEDULED]),
        notes: "Prior quarter value summary and KPI trend review.",
        nextSteps: "Track agreed action items in account plan.",
      },
    });
  }

  const quarterDates = [3, 2, 1, 0].map((offset) => subMonths(new Date(), offset * 3));

  for (const date of quarterDates) {
    const key = quarterKey(date);
    const target = faker.number.int({ min: 1800000, max: 3200000 });

    await prisma.quarterTarget.upsert({
      where: { quarter: key },
      update: { teamTargetArr: target },
      create: {
        quarter: key,
        teamTargetArr: target,
        ownerId: manager.id,
      },
    });

    const commit = Math.round(target * faker.number.float({ min: 0.55, max: 0.95 }));
    const bestCase = Math.round(target * faker.number.float({ min: 0.22, max: 0.4 }));
    const upside = Math.round(target * faker.number.float({ min: 0.08, max: 0.18 }));
    const actual = Math.round(commit * faker.number.float({ min: 0.86, max: 1.1 }));

    await prisma.forecastSnapshot.create({
      data: {
        quarter: key,
        commit,
        bestCase,
        upside,
        actual,
        createdAt: endOfQuarter(date),
      },
    });
  }

  const accountsWithSignals = await prisma.account.findMany({
    include: {
      usageMetrics: { orderBy: { date: "asc" } },
      supportTicket: true,
      stakeholders: true,
      qbrs: {
        where: { quarter: currentQuarter },
      },
      activities: {
        where: {
          date: { gte: subDays(new Date(), 45) },
          type: ActivityType.MEETING,
        },
      },
    },
  });

  for (const account of accountsWithSignals) {
    const first = account.usageMetrics[0];
    const last = account.usageMetrics[account.usageMetrics.length - 1];

    const usageTrendPct =
      first && last && first.apiCalls > 0 ? ((last.apiCalls - first.apiCalls) / first.apiCalls) * 100 : 0;

    const openTicketWeight = account.supportTicket
      .filter((ticket) => ticket.status !== "closed")
      .reduce((total, ticket) => {
        if (ticket.severity === Severity.CRITICAL) return total + 4;
        if (ticket.severity === Severity.HIGH) return total + 3;
        if (ticket.severity === Severity.MEDIUM) return total + 2;
        return total + 1;
      }, 0);

    const score = computeHealthScore({
      usageTrendPct,
      openTicketsWeighted: openTicketWeight,
      meetingsLast45Days: account.activities.length,
      qbrCompleted: account.qbrs.some((qbr) => qbr.status === QBRStatus.COMPLETED),
      activeStakeholders: account.stakeholders.length,
      renewalDate: account.renewalDate,
      paymentStatus: account.paymentStatus,
    });

    await prisma.account.update({
      where: { id: account.id },
      data: {
        healthScore: Math.round(score.weightedScore),
      },
    });
  }

  const summary = {
    aes: await prisma.aE.count(),
    accounts: await prisma.account.count(),
    opportunities: await prisma.opportunity.count(),
    usageMetrics: await prisma.usageMetric.count(),
    tickets: await prisma.supportTicket.count(),
    activities: await prisma.activity.count(),
    qbrs: await prisma.qBR.count(),
    snapshots: await prisma.forecastSnapshot.count(),
  };

  console.log("Seed complete", summary);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

