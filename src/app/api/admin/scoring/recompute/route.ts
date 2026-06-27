import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-auth";
import { adminRecomputeStandings } from "@/lib/scoring-admin-service";

export async function POST(request: Request) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  let body: { asOfDate?: string | null; advanceDays?: number } = {};

  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  if (
    body.asOfDate !== undefined &&
    body.asOfDate !== null &&
    !/^\d{4}-\d{2}-\d{2}$/.test(body.asOfDate)
  ) {
    return NextResponse.json(
      { error: "asOfDate must be YYYY-MM-DD or null." },
      { status: 400 },
    );
  }

  if (
    body.advanceDays !== undefined &&
    (!Number.isInteger(body.advanceDays) || body.advanceDays < 1)
  ) {
    return NextResponse.json(
      { error: "advanceDays must be a positive integer." },
      { status: 400 },
    );
  }

  const result = await adminRecomputeStandings(body);
  return NextResponse.json(result);
}
