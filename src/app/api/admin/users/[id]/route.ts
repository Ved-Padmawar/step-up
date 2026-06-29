import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-auth";
import {
  updateAdminUserProfile,
  updateAdminUserRole,
} from "@/lib/admin-service";
import { ActivityError } from "@/lib/activities-service";
import type { Division, Gender } from "@/lib/divisions";
import { isValidGender } from "@/lib/divisions";

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
    role?: "user" | "admin";
    name?: string;
    mobile?: string;
    division?: Division;
    gender?: Gender | null;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    if (body.role !== undefined) {
      if (body.role !== "user" && body.role !== "admin") {
        return NextResponse.json({ error: "Role must be user or admin." }, { status: 400 });
      }
      const user = await updateAdminUserRole(
        id,
        body.role,
        authResult.session.user.id,
      );
      return NextResponse.json({ ok: true, user });
    }

    if (
      body.name !== undefined ||
      body.mobile !== undefined ||
      body.division !== undefined ||
      body.gender !== undefined
    ) {
      if (
        body.gender !== undefined &&
        body.gender !== null &&
        !isValidGender(body.gender)
      ) {
        return NextResponse.json(
          { error: "Gender must be male, female, other, or null." },
          { status: 400 },
        );
      }

      const user = await updateAdminUserProfile(id, {
        name: body.name,
        mobile: body.mobile,
        division: body.division,
        gender: body.gender,
      });
      return NextResponse.json({ ok: true, user });
    }

    return NextResponse.json({ error: "No supported fields to update." }, { status: 400 });
  } catch (error) {
    if (error instanceof ActivityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error(error);
    return NextResponse.json({ error: "Could not update user." }, { status: 500 });
  }
}
