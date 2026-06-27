import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-auth";
import { listAdminActivities } from "@/lib/admin-service";

export async function GET(request: Request) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { searchParams } = new URL(request.url);
  const activities = await listAdminActivities({
    userId: searchParams.get("userId") ?? undefined,
    date: searchParams.get("date") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  });

  return NextResponse.json({ activities });
}
