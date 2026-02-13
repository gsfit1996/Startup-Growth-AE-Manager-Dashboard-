import { Opportunity, OpportunityStage } from "@prisma/client";

export type ForecastBucketResult = {
  commit: number;
  bestCase: number;
  upside: number;
};

export type ForecastStageRow = {
  stage: OpportunityStage;
  commit: number;
  bestCase: number;
  pipeline: number;
};

export function bucketForecast(opps: Pick<Opportunity, "probability" | "amount" | "stage">[]): ForecastBucketResult {
  return opps.reduce(
    (acc, opp) => {
      if (opp.probability >= 0.7) {
        acc.commit += opp.amount;
      } else if (opp.probability >= 0.4 && opp.probability <= 0.69) {
        acc.bestCase += opp.amount;
      } else if (opp.probability >= 0.1 && opp.probability <= 0.39) {
        acc.upside += opp.amount;
      }
      return acc;
    },
    { commit: 0, bestCase: 0, upside: 0 },
  );
}

export function pipelineCoverage(totalPipelineThisQuarter: number, remainingTarget: number): number {
  if (remainingTarget <= 0) {
    return 0;
  }
  return totalPipelineThisQuarter / remainingTarget;
}

export function forecastAccuracy(actual: number, forecastCommit: number): number {
  if (actual === 0) {
    return 0;
  }
  return Math.abs(actual - forecastCommit) / actual;
}

export function stageBreakdownByBucket(
  opps: Pick<Opportunity, "probability" | "amount" | "stage">[],
): ForecastStageRow[] {
  const stages = new Map<OpportunityStage, ForecastStageRow>();

  for (const opp of opps) {
    if (!stages.has(opp.stage)) {
      stages.set(opp.stage, {
        stage: opp.stage,
        commit: 0,
        bestCase: 0,
        pipeline: 0,
      });
    }

    const row = stages.get(opp.stage)!;
    row.pipeline += opp.amount;

    if (opp.probability >= 0.7) {
      row.commit += opp.amount;
    } else if (opp.probability >= 0.4 && opp.probability <= 0.69) {
      row.bestCase += opp.amount;
    }
  }

  return [...stages.values()];
}
