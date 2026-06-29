import type { Division } from "./divisions";
import type { UserStanding, DivisionRoyals } from "./standings";
import {
  computeDivisionRoyals,
  computeStandingsFromData,
  filterStandingsByDivision,
} from "./standings";
import { loadScoringDataset } from "./scoring-dataset";
import {
  buildChallengePeriodContext,
  computeDailyLeaderboard,
  computeWeeklyLeaderboard,
  getWeekSummary,
  type ChallengePeriodContext,
  type PeriodLeaderboardEntry,
} from "./period-leaderboard";

const DIVISIONS: Division[] = ["strider", "elite"];

function computeDailyForDivisions(
  dataset: Awaited<ReturnType<typeof loadScoringDataset>>,
  date: string,
): Record<Division, PeriodLeaderboardEntry[]> {
  return {
    strider: computeDailyLeaderboard({
      date,
      division: "strider",
      users: dataset.users,
      activities: dataset.activities,
      challengeDays: dataset.challengeDays,
      config: dataset.config,
      calendarToday: dataset.calendarToday,
    }),
    elite: computeDailyLeaderboard({
      date,
      division: "elite",
      users: dataset.users,
      activities: dataset.activities,
      challengeDays: dataset.challengeDays,
      config: dataset.config,
      calendarToday: dataset.calendarToday,
    }),
  };
}

function computeWeeklyForDivisions(
  dataset: Awaited<ReturnType<typeof loadScoringDataset>>,
  weekNo: number,
): Record<Division, PeriodLeaderboardEntry[]> {
  return {
    strider: computeWeeklyLeaderboard({
      weekNo,
      division: "strider",
      users: dataset.users,
      activities: dataset.activities,
      challengeDays: dataset.challengeDays,
      config: dataset.config,
      calendarToday: dataset.calendarToday,
    }),
    elite: computeWeeklyLeaderboard({
      weekNo,
      division: "elite",
      users: dataset.users,
      activities: dataset.activities,
      challengeDays: dataset.challengeDays,
      config: dataset.config,
      calendarToday: dataset.calendarToday,
    }),
  };
}

function buildRoyalsByDivision(
  standings: UserStanding[],
  challengeEnded: boolean,
): Record<Division, DivisionRoyals> {
  return {
    strider: computeDivisionRoyals(standings, "strider", challengeEnded),
    elite: computeDivisionRoyals(standings, "elite", challengeEnded),
  };
}

export async function getLeaderboardHubData(currentUserId: string) {
  const dataset = await loadScoringDataset();
  const periods = buildChallengePeriodContext(
    dataset.challengeDays,
    dataset.calendarToday,
  );
  const overallStandings = computeStandingsFromData(dataset);
  const challengeEnded = dataset.calendarToday > dataset.challengeEndDate;
  const royalsByDivision = buildRoyalsByDivision(overallStandings, challengeEnded);

  const currentDaily = periods.currentDay
    ? computeDailyForDivisions(dataset, periods.currentDay.date)
    : { strider: [], elite: [] };

  const currentWeekly = periods.currentWeek
    ? computeWeeklyForDivisions(dataset, periods.currentWeek.weekNo)
    : { strider: [], elite: [] };

  const viewer = overallStandings.find((row) => row.userId === currentUserId);

  return {
    currentUserId,
    periods,
    challengeEndDate: dataset.challengeEndDate,
    overallStandings,
    standingsByDivision: {
      strider: filterStandingsByDivision(overallStandings, "strider"),
      elite: filterStandingsByDivision(overallStandings, "elite"),
    },
    royalsByDivision,
    currentDaily,
    currentWeekly,
    viewerDivision: viewer?.division ?? "strider",
  };
}

export async function getDailyLeaderboardPage(date: string) {
  const dataset = await loadScoringDataset();
  const day = dataset.challengeDays.find((entry) => entry.date === date);
  if (!day) {
    return null;
  }

  const overallStandings = computeStandingsFromData(dataset);
  const challengeEnded = dataset.calendarToday > dataset.challengeEndDate;

  return {
    calendarToday: dataset.calendarToday,
    challengeEndDate: dataset.challengeEndDate,
    day,
    entriesByDivision: computeDailyForDivisions(dataset, date),
    royalsByDivision: buildRoyalsByDivision(overallStandings, challengeEnded),
  };
}

export async function getWeeklyLeaderboardPage(weekNo: number) {
  const dataset = await loadScoringDataset();
  const week = getWeekSummary(dataset.challengeDays, weekNo);
  if (!week) {
    return null;
  }

  const overallStandings = computeStandingsFromData(dataset);
  const challengeEnded = dataset.calendarToday > dataset.challengeEndDate;

  return {
    calendarToday: dataset.calendarToday,
    challengeEndDate: dataset.challengeEndDate,
    week,
    entriesByDivision: computeWeeklyForDivisions(dataset, weekNo),
    royalsByDivision: buildRoyalsByDivision(overallStandings, challengeEnded),
  };
}

export async function getLeaderboardPeriodIndexes() {
  const dataset = await loadScoringDataset();
  const periods = buildChallengePeriodContext(
    dataset.challengeDays,
    dataset.calendarToday,
  );

  return {
    calendarToday: dataset.calendarToday,
    currentDay: periods.currentDay,
    currentWeek: periods.currentWeek,
    pastDays: periods.pastDays,
    pastWeeks: periods.pastWeeks,
  };
}

export type { ChallengePeriodContext, PeriodLeaderboardEntry };
