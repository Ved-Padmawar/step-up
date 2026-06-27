import { addDaysToDateString } from "@/lib/dates";
import { computeStandings } from "@/lib/standings-service";
import type { UserStanding } from "@/lib/standings";
import {
  getScoringDateState,
  setScoringAsOfDate,
  type ScoringDateState,
} from "@/lib/scoring-date";

export type AdminScoringResult = {
  state: ScoringDateState;
  standings: UserStanding[];
  computedAt: string;
};

export async function getAdminScoringSnapshot(): Promise<AdminScoringResult> {
  const [state, standings] = await Promise.all([
    getScoringDateState(),
    computeStandings(),
  ]);

  return {
    state,
    standings,
    computedAt: new Date().toISOString(),
  };
}

export async function adminRecomputeStandings(input?: {
  asOfDate?: string | null;
  advanceDays?: number;
}): Promise<AdminScoringResult> {
  if (input?.asOfDate !== undefined) {
    await setScoringAsOfDate(input.asOfDate);
  } else if (input?.advanceDays) {
    const current = await getScoringDateState();
    await setScoringAsOfDate(
      addDaysToDateString(current.effectiveDate, input.advanceDays),
    );
  }

  const [state, standings] = await Promise.all([
    getScoringDateState(),
    computeStandings(),
  ]);

  return {
    state,
    standings,
    computedAt: new Date().toISOString(),
  };
}
