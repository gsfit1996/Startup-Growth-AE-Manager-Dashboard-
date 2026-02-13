import { addDays, format } from "date-fns";

import { ManagerAction } from "../types/dashboard";

type ActionCandidate = {
  id: string;
  title: string;
  owner: string;
  impactScore: number;
  urgencyScore: number;
  blocked?: boolean;
};

export function rankManagerActions(candidates: ActionCandidate[]): ManagerAction[] {
  return candidates
    .sort((a, b) => b.impactScore + b.urgencyScore - (a.impactScore + a.urgencyScore))
    .slice(0, 6)
    .map((candidate, idx) => {
      const due = addDays(new Date(), idx + 1);
      const total = candidate.impactScore + candidate.urgencyScore;

      return {
        id: candidate.id,
        title: candidate.title,
        owner: candidate.owner,
        dueDate: format(due, "yyyy-MM-dd"),
        impact: total >= 15 ? "high" : total >= 10 ? "medium" : "low",
        status: candidate.blocked ? "blocked" : idx < 3 ? "new" : "in_progress",
      };
    });
}
