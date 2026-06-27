import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-auth";
import { listAdminUsers } from "@/lib/admin-service";

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
