import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  computeDayScoringSnapshot,
  computeWeekScoringSnapshot,
} from "../src/lib/period-scoring";

const config = {
  starOfDayPoints: 10,
  starOfWeekPoints: 25,
  consistency5: 10,
  consistency6: 20,
  consistency7: 35,
};

const users = [
  { id: "u1", name: "Alice", registeredAt: new Date("2026-01-01") },
  { id: "u2", name: "Bob", registeredAt: new Date("2026-01-02") },
];

const challengeDays = [
  { date: "2026-06-01", weekNo: 1, targetSteps: 5000 },
  { date: "2026-06-02", weekNo: 1, targetSteps: 5000 },
];

describe("computeDayScoringSnapshot", () => {
  it("marks all tied top steppers as star winners", () => {
    const snapshot = computeDayScoringSnapshot({
      activityDate: "2026-06-01",
      users,
      challengeDays,
      config,
      activities: [
        {
          userId: "u1",
          activityDate: "2026-06-01",
          steps: 8000,
          basePoints: 20,
          status: "approved",
        },
        {
          userId: "u2",
          activityDate: "2026-06-01",
          steps: 8000,
          basePoints: 20,
          status: "approved",
        },
      ],
    });

    assert.ok(snapshot);
    assert.equal(snapshot!.maxSteps, 8000);
    assert.deepEqual(
      snapshot!.entries.filter((entry) => entry.isStarWinner).map((entry) => entry.name),
      ["Alice", "Bob"],
    );
  });
});

describe("computeWeekScoringSnapshot", () => {
  it("awards week star and consistency from approved activities", () => {
    const snapshot = computeWeekScoringSnapshot({
      weekNo: 1,
      users,
      challengeDays,
      config,
      activities: [
        {
          userId: "u1",
          activityDate: "2026-06-01",
          steps: 6000,
          basePoints: 10,
          status: "approved",
        },
        {
          userId: "u1",
          activityDate: "2026-06-02",
          steps: 7000,
          basePoints: 15,
          status: "approved",
        },
        {
          userId: "u2",
          activityDate: "2026-06-01",
          steps: 5000,
          basePoints: 5,
          status: "approved",
        },
      ],
    });

    assert.ok(snapshot);
    const alice = snapshot!.entries.find((entry) => entry.userId === "u1");
    const bob = snapshot!.entries.find((entry) => entry.userId === "u2");
    assert.equal(alice?.isWeekStar, true);
    assert.equal(alice?.consistencyPoints, 0);
    assert.equal(bob?.isWeekStar, false);
    assert.equal(bob?.daysMet, 1);
  });
});
