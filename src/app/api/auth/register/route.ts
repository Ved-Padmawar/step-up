import { NextResponse } from "next/server";

export async function POST(_request: Request) {
  return NextResponse.json(
    { error: "Registration is closed. Contact the organizers to join." },
    { status: 403 },
  );
}
