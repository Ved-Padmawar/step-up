import { desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import {
  dayScoringRun,
  dayScoringRunEntry,
  users,
  weekScoringRun,
  weekScoringRunEntry,
} from "@/db/schema";
import { ActivityError } from "@/lib/activities-service";
import {
  computeDayScoringSnapshot,
  computeWeekScoringSnapshot,
  type DayScoringSnapshot,
  type WeekScoringSnapshot,
} from "@/lib/period-scoring";
import { loadScoringDataset } from "@/lib/scoring-dataset";
import { computeStandingsFromData } from "@/lib/standings";
import type { UserStanding } from "@/lib/standings";

export type DayScoringRunRecord = {
  id: string;
  activityDate: string;
  computedAt: string;
  triggeredByName: string | null;
  starPoints: number;
  maxSteps: number;
  winners: string[];
  entries: Array<{
    userId: string;
    name: string;
    steps: number;
    basePoints: number;
    isStarWinner: boolean;
  }>;
};

export type WeekScoringRunRecord = {
  id: string;
  weekNo: number;
  computedAt: string;
  triggeredByName: string | null;
  weekStarPoints: number;
  maxWeeklySteps: number;
  winners: string[];
  entries: Array<{
    userId: string;
    name: string;
    weeklySteps: number;
    weeklyBasePoints: number;
    daysMet: number;
    consistencyPoints: number;
    isWeekStar: boolean;
  }>;
};

export type AdminScoringSnapshot = {
  calendarToday: string;
  standings: UserStanding[];
  recentDayRuns: DayScoringRunRecord[];
  recentWeekRuns: WeekScoringRunRecord[];
};

async function hydrateDayRun(
  run: typeof dayScoringRun.$inferSelect,
  triggeredByName: string | null,
  entries: Array<
    typeof dayScoringRunEntry.$inferSelect & { userName: string }
  >,
): Promise<DayScoringRunRecord> {
  return {
    id: run.id,
    activityDate: run.activityDate,
    computedAt: run.computedAt.toISOString(),
    triggeredByName,
    starPoints: run.starPoints,
    maxSteps: run.maxSteps,
    winners: entries
      .filter((entry) => entry.isStarWinner)
      .map((entry) => entry.userName),
    entries: entries.map((entry) => ({
      userId: entry.userId,
      name: entry.userName,
      steps: entry.steps,
      basePoints: entry.basePoints,
      isStarWinner: entry.isStarWinner,
    })),
  };
}

async function hydrateWeekRun(
  run: typeof weekScoringRun.$inferSelect,
  triggeredByName: string | null,
  entries: Array<
    typeof weekScoringRunEntry.$inferSelect & { userName: string }
  >,
): Promise<WeekScoringRunRecord> {
  return {
    id: run.id,
    weekNo: run.weekNo,
    computedAt: run.computedAt.toISOString(),
    triggeredByName,
    weekStarPoints: run.weekStarPoints,
    maxWeeklySteps: run.maxWeeklySteps,
    winners: entries
      .filter((entry) => entry.isWeekStar)
      .map((entry) => entry.userName),
    entries: entries.map((entry) => ({
      userId: entry.userId,
      name: entry.userName,
      weeklySteps: entry.weeklySteps,
      weeklyBasePoints: entry.weeklyBasePoints,
      daysMet: entry.daysMet,
      consistencyPoints: entry.consistencyPoints,
      isWeekStar: entry.isWeekStar,
    })),
  };
}

async function loadDayRunRecord(runId: string): Promise<DayScoringRunRecord | null> {
  const db = getDb();
  const [run] = await db
    .select()
    .from(dayScoringRun)
    .where(eq(dayScoringRun.id, runId))
    .limit(1);

  if (!run) {
    return null;
  }

  const entries = await db
    .select({
      runId: dayScoringRunEntry.runId,
      userId: dayScoringRunEntry.userId,
      steps: dayScoringRunEntry.steps,
      basePoints: dayScoringRunEntry.basePoints,
      isStarWinner: dayScoringRunEntry.isStarWinner,
      userName: users.name,
    })
    .from(dayScoringRunEntry)
    .innerJoin(users, eq(dayScoringRunEntry.userId, users.id))
    .where(eq(dayScoringRunEntry.runId, runId));

  let triggeredByName: string | null = null;
  if (run.triggeredBy) {
    const [admin] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, run.triggeredBy))
      .limit(1);
    triggeredByName = admin?.name ?? null;
  }

  return hydrateDayRun(run, triggeredByName, entries);
}

async function loadWeekRunRecord(runId: string): Promise<WeekScoringRunRecord | null> {
  const db = getDb();
  const [run] = await db
    .select()
    .from(weekScoringRun)
    .where(eq(weekScoringRun.id, runId))
    .limit(1);

  if (!run) {
    return null;
  }

  const entries = await db
    .select({
      runId: weekScoringRunEntry.runId,
      userId: weekScoringRunEntry.userId,
      weeklySteps: weekScoringRunEntry.weeklySteps,
      weeklyBasePoints: weekScoringRunEntry.weeklyBasePoints,
      daysMet: weekScoringRunEntry.daysMet,
      consistencyPoints: weekScoringRunEntry.consistencyPoints,
      isWeekStar: weekScoringRunEntry.isWeekStar,
      userName: users.name,
    })
    .from(weekScoringRunEntry)
    .innerJoin(users, eq(weekScoringRunEntry.userId, users.id))
    .where(eq(weekScoringRunEntry.runId, runId));

  let triggeredByName: string | null = null;
  if (run.triggeredBy) {
    const [admin] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, run.triggeredBy))
      .limit(1);
    triggeredByName = admin?.name ?? null;
  }

  return hydrateWeekRun(run, triggeredByName, entries);
}

async function listRecentDayRuns(limit = 8): Promise<DayScoringRunRecord[]> {
  const db = getDb();
  const runs = await db
    .select()
    .from(dayScoringRun)
    .orderBy(desc(dayScoringRun.computedAt))
    .limit(limit);

  return Promise.all(
    runs.map(async (run) => (await loadDayRunRecord(run.id))!),
  );
}

async function listRecentWeekRuns(limit = 8): Promise<WeekScoringRunRecord[]> {
  const db = getDb();
  const runs = await db
    .select()
    .from(weekScoringRun)
    .orderBy(desc(weekScoringRun.computedAt))
    .limit(limit);

  return Promise.all(
    runs.map(async (run) => (await loadWeekRunRecord(run.id))!),
  );
}

async function persistDayScoringRun(
  snapshot: DayScoringSnapshot,
  triggeredBy: string,
): Promise<DayScoringRunRecord> {
  const db = getDb();
  const [run] = await db
    .insert(dayScoringRun)
    .values({
      activityDate: snapshot.activityDate,
      triggeredBy,
      starPoints: snapshot.starPoints,
      maxSteps: snapshot.maxSteps,
    })
    .returning();

  if (snapshot.entries.length > 0) {
    await db.insert(dayScoringRunEntry).values(
      snapshot.entries.map((entry) => ({
        runId: run!.id,
        userId: entry.userId,
        steps: entry.steps,
        basePoints: entry.basePoints,
        isStarWinner: entry.isStarWinner,
      })),
    );
  }

  return (await loadDayRunRecord(run!.id))!;
}

async function persistWeekScoringRun(
  snapshot: WeekScoringSnapshot,
  triggeredBy: string,
): Promise<WeekScoringRunRecord> {
  const db = getDb();
  const [run] = await db
    .insert(weekScoringRun)
    .values({
      weekNo: snapshot.weekNo,
      triggeredBy,
      weekStarPoints: snapshot.weekStarPoints,
      maxWeeklySteps: snapshot.maxWeeklySteps,
    })
    .returning();

  if (snapshot.entries.length > 0) {
    await db.insert(weekScoringRunEntry).values(
      snapshot.entries.map((entry) => ({
        runId: run!.id,
        userId: entry.userId,
        weeklySteps: entry.weeklySteps,
        weeklyBasePoints: entry.weeklyBasePoints,
        daysMet: entry.daysMet,
        consistencyPoints: entry.consistencyPoints,
        isWeekStar: entry.isWeekStar,
      })),
    );
  }

  return (await loadWeekRunRecord(run!.id))!;
}

export async function getAdminScoringSnapshot(): Promise<AdminScoringSnapshot> {
  const dataset = await loadScoringDataset();
  const [standings, recentDayRuns, recentWeekRuns] = await Promise.all([
    Promise.resolve(computeStandingsFromData(dataset)),
    listRecentDayRuns(),
    listRecentWeekRuns(),
  ]);

  return {
    calendarToday: dataset.calendarToday,
    standings,
    recentDayRuns,
    recentWeekRuns,
  };
}

export async function adminScoreDay(
  activityDate: string,
  adminUserId: string,
): Promise<DayScoringRunRecord> {
  const dataset = await loadScoringDataset();
  const snapshot = computeDayScoringSnapshot({
    activityDate,
    users: dataset.users,
    activities: dataset.activities,
    challengeDays: dataset.challengeDays,
    config: dataset.config,
  });

  if (!snapshot) {
    throw new ActivityError("Challenge day not found.", 404);
  }

  return persistDayScoringRun(snapshot, adminUserId);
}

export async function adminScoreWeek(
  weekNo: number,
  adminUserId: string,
): Promise<WeekScoringRunRecord> {
  const dataset = await loadScoringDataset();
  const snapshot = computeWeekScoringSnapshot({
    weekNo,
    users: dataset.users,
    activities: dataset.activities,
    challengeDays: dataset.challengeDays,
    config: dataset.config,
  });

  if (!snapshot) {
    throw new ActivityError("Challenge week not found.", 404);
  }

  return persistWeekScoringRun(snapshot, adminUserId);
}

export async function listDayScoringRunsForDate(
  activityDate: string,
): Promise<DayScoringRunRecord[]> {
  const db = getDb();
  const runs = await db
    .select()
    .from(dayScoringRun)
    .where(eq(dayScoringRun.activityDate, activityDate))
    .orderBy(desc(dayScoringRun.computedAt));

  return Promise.all(
    runs.map(async (run) => (await loadDayRunRecord(run.id))!),
  );
}

export async function listWeekScoringRunsForWeek(
  weekNo: number,
): Promise<WeekScoringRunRecord[]> {
  const db = getDb();
  const runs = await db
    .select()
    .from(weekScoringRun)
    .where(eq(weekScoringRun.weekNo, weekNo))
    .orderBy(desc(weekScoringRun.computedAt));

  return Promise.all(
    runs.map(async (run) => (await loadWeekRunRecord(run.id))!),
  );
}
