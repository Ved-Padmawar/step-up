import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-auth";
import {
  listDayScoringRunsForDate,
  listWeekScoringRunsForWeek,
} from "@/lib/scoring-admin-service";

export async function GET(request: Request) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const params = new URL(request.url).searchParams;
  const kind = params.get("kind");
  const date = params.get("date");
  const weekNo = params.get("weekNo");

  if (kind === "day") {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "date query param required (YYYY-MM-DD)." },
        { status: 400 },
      );
    }
    const runs = await listDayScoringRunsForDate(date);
    return NextResponse.json({ runs });
  }

  if (kind === "week") {
    const parsedWeek = Number(weekNo);
    if (!Number.isInteger(parsedWeek) || parsedWeek < 1) {
      return NextResponse.json(
        { error: "weekNo query param required." },
        { status: 400 },
      );
    }
    const runs = await listWeekScoringRunsForWeek(parsedWeek);
    return NextResponse.json({ runs });
  }

  return NextResponse.json(
    { error: "kind must be day or week." },
    { status: 400 },
  );
}
