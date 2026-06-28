import { computeStandingsFromData } from "./standings";
import { loadScoringDataset } from "./scoring-dataset";

export async function computeStandings() {
  const dataset = await loadScoringDataset();
  return computeStandingsFromData(dataset);
}

export { getStandingForUser } from "./standings";
export type { StandingsBreakdown, UserStanding } from "./standings";
