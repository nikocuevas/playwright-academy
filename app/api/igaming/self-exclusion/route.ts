import { NextResponse } from "next/server";
import { resolveIgamingSession, selfExclude, serialiseWallet } from "@/lib/practice/igaming-store";

export const dynamic = "force-dynamic";

/**
 * POST /api/igaming/self-exclusion — irreversible for this session. Every
 * money-moving and bet-placing endpoint re-checks `selfExcluded`, so
 * self-exclusion is enforced at the API layer, not just hidden in the UI.
 */
export async function POST() {
  const session = await resolveIgamingSession();
  if (!session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  selfExclude(session);
  return NextResponse.json({ wallet: serialiseWallet(session) });
}
