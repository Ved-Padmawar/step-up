"use client";

import {
  DivisionSubTabs,
  useActiveDivision,
} from "@/components/leaderboard/division-sub-tabs";
import { PeriodLeaderboardView } from "@/components/leaderboard/period-leaderboard-view";
import type { Division } from "@/lib/divisions";
import type { PeriodLeaderboardEntry } from "@/lib/period-leaderboard";

type DivisionPeriodBoardProps = {
  currentUserId: string;
  entriesByDivision: Record<Division, PeriodLeaderboardEntry[]>;
  title: string;
  subtitle: string;
  metricLabel: string;
  periodEnded: boolean;
  showBasePoints?: boolean;
  backHref: string;
  backLabel: string;
};

export function DivisionPeriodBoard({
  currentUserId,
  entriesByDivision,
  title,
  subtitle,
  metricLabel,
  periodEnded,
  showBasePoints = false,
  backHref,
  backLabel,
}: DivisionPeriodBoardProps) {
  const activeDivision = useActiveDivision("strider");

  return (
    <div className="space-y-4">
      <DivisionSubTabs />
      <PeriodLeaderboardView
        backHref={backHref}
        backLabel={backLabel}
        currentUserId={currentUserId}
        entries={entriesByDivision[activeDivision]}
        metricLabel={metricLabel}
        periodEnded={periodEnded}
        showBasePoints={showBasePoints}
        subtitle={subtitle}
        title={title}
      />
    </div>
  );
}
