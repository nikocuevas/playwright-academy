import { NextResponse } from "next/server";
import { resolveIgamingSession, serialiseWallet, settleBet } from "@/lib/practice/igaming-store";

export const dynamic = "force-dynamic";

/**
 * POST /api/igaming/bets/[id]/settle — body: { outcome: "win" | "lose" }
 *
 * On a real platform this would be an internal/backoffice or settlement-engine
 * action, never a player-facing endpoint. It's exposed here purely so the
 * practice app can demonstrate the ACCEPTED -> SETTLED transition for
 * automation practice.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await resolveIgamingSession();
  if (!session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { outcome?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const allowed = ["win", "lose"] as const;
  const outcome = allowed.find((o) => o === body.outcome);

  if (!outcome) {
    return NextResponse.json(
      { error: "outcome must be 'win' or 'lose'", allowed },
      { status: 400 },
    );
  }

  const result = settleBet(session, id, outcome);
  if ("error" in result) {
    const status = result.error === "Bet not found" ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ bet: result.bet, wallet: serialiseWallet(session) });
}
