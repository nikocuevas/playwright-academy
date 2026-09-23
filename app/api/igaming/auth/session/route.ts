import { NextResponse } from "next/server";
import { resolveIgamingSession } from "@/lib/practice/igaming-store";

export const dynamic = "force-dynamic";

/** GET /api/igaming/auth/session — who, if anyone, is signed in. */
export async function GET() {
  const session = await resolveIgamingSession();

  return NextResponse.json({
    authenticated: Boolean(session.user),
    user: session.user,
  });
}
