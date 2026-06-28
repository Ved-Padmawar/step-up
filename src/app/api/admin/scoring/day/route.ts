import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-auth";
import { ActivityError } from "@/lib/activities-service";
import { adminScoreDay } from "@/lib/scoring-admin-service";

export async function POST(request: Request) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  let body: { date?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const date = body.date?.trim();
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "date must be YYYY-MM-DD." },
      { status: 400 },
    );
  }

  try {
    const run = await adminScoreDay(date, authResult.session.user.id);
    return NextResponse.json({ ok: true, run });
  } catch (error) {
    if (error instanceof ActivityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ error: "Could not score day." }, { status: 500 });
  }
}
