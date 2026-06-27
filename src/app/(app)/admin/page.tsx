import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminPanel } from "@/components/admin/admin-panel";
import {
  listAdminActivities,
  listAdminUsers,
} from "@/lib/admin-service";
import { getChallengeWindow } from "@/lib/activities-service";
import { getAdminScoringSnapshot } from "@/lib/scoring-admin-service";

export default async function AdminPage() {
  const session = await auth();

  if (session?.user.role !== "admin") {
    redirect("/activities");
  }

  const [{ days }, activities, users, initialScoring] = await Promise.all([
    getChallengeWindow(),
    listAdminActivities(),
    listAdminUsers(),
    getAdminScoringSnapshot(),
  ]);

  return (
    <AdminPanel
      challengeDays={days}
      currentAdminId={session.user.id}
      initialActivities={activities}
      initialScoring={initialScoring}
      users={users}
    />
  );
}
