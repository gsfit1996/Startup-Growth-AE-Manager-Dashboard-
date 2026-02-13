import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { accountPlanCompleteness } from "@/lib/metrics/account-plan";

const accountPlanSchema = z.object({
  businessGoals: z.string().default(""),
  successMetrics: z.string().default(""),
  stakeholderMap: z.string().default(""),
  riskLog: z.string().default(""),
  expansionHypothesis: z.string().default(""),
  execAlignmentDate: z.string().nullable().optional(),
  nextQbrDate: z.string().nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ accountId: string }> },
) {
  const { accountId } = await params;
  const payload = accountPlanSchema.parse(await request.json());

  const plan = await db.accountPlan.upsert({
    where: { accountId },
    update: {
      businessGoals: payload.businessGoals,
      successMetrics: payload.successMetrics,
      stakeholderMap: payload.stakeholderMap,
      riskLog: payload.riskLog,
      expansionHypothesis: payload.expansionHypothesis,
      execAlignmentDate: payload.execAlignmentDate ? new Date(payload.execAlignmentDate) : null,
      nextQbrDate: payload.nextQbrDate ? new Date(payload.nextQbrDate) : null,
    },
    create: {
      accountId,
      businessGoals: payload.businessGoals,
      successMetrics: payload.successMetrics,
      stakeholderMap: payload.stakeholderMap,
      riskLog: payload.riskLog,
      expansionHypothesis: payload.expansionHypothesis,
      execAlignmentDate: payload.execAlignmentDate ? new Date(payload.execAlignmentDate) : null,
      nextQbrDate: payload.nextQbrDate ? new Date(payload.nextQbrDate) : null,
    },
  });

  return NextResponse.json({
    accountId,
    completenessScore: accountPlanCompleteness(plan),
    updatedAt: plan.updatedAt.toISOString(),
  });
}
