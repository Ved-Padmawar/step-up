import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-auth";
import { ActivityError } from "@/lib/activities-service";
import { adminScoreWeek } from "@/lib/scoring-admin-service";

export async function POST(request: Request) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  let body: { weekNo?: number } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const weekNo = body.weekNo;
  if (!Number.isInteger(weekNo) || weekNo! < 1) {
    return NextResponse.json(
      { error: "weekNo must be a positive integer." },
      { status: 400 },
    );
  }

  try {
    const run = await adminScoreWeek(weekNo!, authResult.session.user.id);
    return NextResponse.json({ ok: true, run });
  } catch (error) {
    if (error instanceof ActivityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ error: "Could not score week." }, { status: 500 });
  }
}
