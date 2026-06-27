import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-auth";
import { updateAdminActivity } from "@/lib/admin-service";
import { ActivityError } from "@/lib/activities-service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;

  let body: {
    status?: "approved" | "disapproved";
    adminNote?: string | null;
    steps?: number;
    activityDate?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const result = await updateAdminActivity(
      id,
      authResult.session.user.id,
      body,
    );

    return NextResponse.json({
      ok: true,
      activity: result.activity,
      pointsDelta: result.pointsDelta,
      previousBasePoints: result.previousBasePoints,
      nextBasePoints: result.nextBasePoints,
    });
  } catch (error) {
    if (error instanceof ActivityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json(
      { error: "Could not update activity." },
      { status: 500 },
    );
  }
}
