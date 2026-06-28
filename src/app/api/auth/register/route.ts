import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/db";
import { users } from "@/db/schema";
import { normalizeMobile, validateIndianMobile } from "@/lib/mobile";
import { hashPassword } from "@/lib/password";
import { checkRateLimit } from "@/lib/rate-limit";

type RegisterBody = {
  name?: string;
  mobile?: string;
  password?: string;
  confirmPassword?: string;
};

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimit = checkRateLimit(`register:${ip}`);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)),
        },
      },
    );
  }

  let body: RegisterBody;
  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const mobile = normalizeMobile(body.mobile ?? "");
  const password = body.password ?? "";
  const confirmPassword = body.confirmPassword ?? "";

  if (name.length < 2) {
    return NextResponse.json(
      { error: "Please enter your full name." },
      { status: 400 },
    );
  }

  if (!validateIndianMobile(mobile)) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit Indian mobile number." },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: "Passwords do not match." },
      { status: 400 },
    );
  }

  const db = getDb();
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.mobile, mobile))
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { error: "This mobile number is already registered." },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);

  await db.insert(users).values({
    name,
    mobile,
    passwordHash,
    role: "user",
    mustChangePassword: false,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
