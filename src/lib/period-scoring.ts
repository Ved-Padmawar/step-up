import type {
  ActivityInput,
  ChallengeConfigInput,
  ChallengeDayInput,
  UserInput,
} from "./standings";

export type DayScoringEntry = {
  userId: string;
  name: string;
  steps: number;
  basePoints: number;
  targetMet: boolean;
  isStarWinner: boolean;
};

export type DayScoringSnapshot = {
  activityDate: string;
  targetSteps: number;
  starPoints: number;
  maxSteps: number;
  entries: DayScoringEntry[];
};

export type WeekScoringEntry = {
  userId: string;
  name: string;
  weeklySteps: number;
  weeklyBasePoints: number;
  daysMet: number;
  consistencyPoints: number;
  isWeekStar: boolean;
};

export type WeekScoringSnapshot = {
  weekNo: number;
  weekStarPoints: number;
  maxWeeklySteps: number;
  entries: WeekScoringEntry[];
};

function consistencyBonusForWeek(
  daysMetInWeek: number,
  config: ChallengeConfigInput,
): number {
  if (daysMetInWeek >= 7) {
    return config.consistency7;
  }
  if (daysMetInWeek >= 6) {
    return config.consistency6;
  }
  if (daysMetInWeek >= 5) {
    return config.consistency5;
  }
  return 0;
}

export function computeDayScoringSnapshot(input: {
  activityDate: string;
  users: UserInput[];
  activities: ActivityInput[];
  challengeDays: ChallengeDayInput[];
  config: ChallengeConfigInput;
}): DayScoringSnapshot | null {
  const day = input.challengeDays.find(
    (entry) => entry.date === input.activityDate,
  );
  if (!day) {
    return null;
  }

  const approvedByUser = new Map<string, ActivityInput>();
  for (const activity of input.activities) {
    if (activity.activityDate !== input.activityDate || activity.status !== "approved") {
      continue;
    }
    approvedByUser.set(activity.userId, activity);
  }

  const entries: DayScoringEntry[] = input.users.map((user) => {
    const activity = approvedByUser.get(user.id);
    const steps = activity?.steps ?? 0;
    return {
      userId: user.id,
      name: user.name,
      steps,
      basePoints: activity?.basePoints ?? 0,
      targetMet: steps >= day.targetSteps,
      isStarWinner: false,
    };
  });

  const maxSteps = Math.max(0, ...entries.map((entry) => entry.steps));
  const withWinners = entries.map((entry) => ({
    ...entry,
    isStarWinner: maxSteps > 0 && entry.steps === maxSteps,
  }));

  return {
    activityDate: input.activityDate,
    targetSteps: day.targetSteps,
    starPoints: input.config.starOfDayPoints,
    maxSteps,
    entries: withWinners,
  };
}

export function computeWeekScoringSnapshot(input: {
  weekNo: number;
  users: UserInput[];
  activities: ActivityInput[];
  challengeDays: ChallengeDayInput[];
  config: ChallengeConfigInput;
}): WeekScoringSnapshot | null {
  const weekDays = input.challengeDays.filter(
    (day) => day.weekNo === input.weekNo,
  );
  if (weekDays.length === 0) {
    return null;
  }

  const weekDayMap = new Map(weekDays.map((day) => [day.date, day]));
  const totals = new Map<
    string,
    { weeklySteps: number; weeklyBasePoints: number; daysMet: number }
  >();

  for (const user of input.users) {
    totals.set(user.id, { weeklySteps: 0, weeklyBasePoints: 0, daysMet: 0 });
  }

  for (const activity of input.activities) {
    if (activity.status !== "approved") {
      continue;
    }

    const day = weekDayMap.get(activity.activityDate);
    if (!day) {
      continue;
    }

    const current = totals.get(activity.userId)!;
    current.weeklySteps += activity.steps;
    current.weeklyBasePoints += activity.basePoints;
    if (activity.steps >= day.targetSteps) {
      current.daysMet += 1;
    }
  }

  const entries: WeekScoringEntry[] = input.users.map((user) => {
    const current = totals.get(user.id)!;
    return {
      userId: user.id,
      name: user.name,
      weeklySteps: current.weeklySteps,
      weeklyBasePoints: current.weeklyBasePoints,
      daysMet: current.daysMet,
      consistencyPoints: consistencyBonusForWeek(current.daysMet, input.config),
      isWeekStar: false,
    };
  });

  const maxWeeklySteps = Math.max(0, ...entries.map((entry) => entry.weeklySteps));
  const withWinners = entries.map((entry) => ({
    ...entry,
    isWeekStar: maxWeeklySteps > 0 && entry.weeklySteps === maxWeeklySteps,
  }));

  return {
    weekNo: input.weekNo,
    weekStarPoints: input.config.starOfWeekPoints,
    maxWeeklySteps,
    entries: withWinners,
  };
}
