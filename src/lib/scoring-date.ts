import { eq } from "drizzle-orm";

import { appConfig } from "@/config";
import { getDb } from "@/db";
import { challengeConfig } from "@/db/schema";
import { getTodayDateString } from "@/lib/dates";

export type ScoringDateState = {
  calendarToday: string;
  scoringAsOfDate: string | null;
  effectiveDate: string;
  usingOverride: boolean;
};

function normalizeDate(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  return String(value);
}

export async function getScoringDateState(): Promise<ScoringDateState> {
  const db = getDb();
  const [row] = await db
    .select({ scoringAsOfDate: challengeConfig.scoringAsOfDate })
    .from(challengeConfig)
    .limit(1);

  const calendarToday = getTodayDateString(appConfig.timezone);
  const scoringAsOfDate = normalizeDate(row?.scoringAsOfDate ?? null);
  const effectiveDate = scoringAsOfDate ?? calendarToday;

  return {
    calendarToday,
    scoringAsOfDate,
    effectiveDate,
    usingOverride: scoringAsOfDate !== null,
  };
}

export async function getEffectiveScoringDate(): Promise<string> {
  const state = await getScoringDateState();
  return state.effectiveDate;
}

export async function setScoringAsOfDate(
  asOfDate: string | null,
): Promise<ScoringDateState> {
  const db = getDb();
  await db
    .update(challengeConfig)
    .set({ scoringAsOfDate: asOfDate })
    .where(eq(challengeConfig.id, 1));

  return getScoringDateState();
}
