import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { ActivityError } from "@/lib/activities-service";
import { changeUserPassword } from "@/lib/user-service";

type ChangePasswordBody = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: ChangePasswordBody;
  try {
    body = (await request.json()) as ChangePasswordBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    await changeUserPassword(session.user.id, {
      currentPassword: body.currentPassword ?? "",
      newPassword: body.newPassword ?? "",
      confirmPassword: body.confirmPassword ?? "",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ActivityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json(
      { error: "Could not change password." },
      { status: 500 },
    );
  }
}
