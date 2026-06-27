import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LeaderboardView } from "@/components/leaderboard/leaderboard-view";
import { computeStandings } from "@/lib/standings-service";

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const standings = await computeStandings();

  return (
    <LeaderboardView
      currentUserId={session.user.id}
      standings={standings}
    />
  );
}
