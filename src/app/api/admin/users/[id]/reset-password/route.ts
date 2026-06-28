import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-auth";
import { resetAdminUserPassword } from "@/lib/admin-service";
import { ActivityError } from "@/lib/activities-service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;

  try {
    const user = await resetAdminUserPassword(id, authResult.session.user.id);
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    if (error instanceof ActivityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json(
      { error: "Could not reset password." },
      { status: 500 },
    );
  }
}
