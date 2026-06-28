import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-auth";
import { createAdminParticipant, listAdminUsers } from "@/lib/admin-service";
import { ActivityError } from "@/lib/activities-service";

export async function GET() {
  const authResult = await requireAdminSession();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const users = await listAdminUsers();
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  let body: { name?: string; mobile?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const user = await createAdminParticipant({
      name: body.name ?? "",
      mobile: body.mobile ?? "",
    });

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (error) {
    if (error instanceof ActivityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json(
      { error: "Could not add participant." },
      { status: 500 },
    );
  }
}
