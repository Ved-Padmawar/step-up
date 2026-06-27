import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-auth";
import { getAdminScoringSnapshot } from "@/lib/scoring-admin-service";

export async function GET() {
  const authResult = await requireAdminSession();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const snapshot = await getAdminScoringSnapshot();
  return NextResponse.json(snapshot);
}
