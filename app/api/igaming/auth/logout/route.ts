import { NextResponse } from "next/server";
import { resolveIgamingSession, signOut } from "@/lib/practice/igaming-store";

export const dynamic = "force-dynamic";

/** POST /api/igaming/auth/logout */
export async function POST() {
  const session = await resolveIgamingSession();
  await signOut(session);
  return NextResponse.json({ ok: true });
}
