import { NextResponse } from "next/server";
import { resolveRouletteSession, spin } from "@/lib/practice/roulette-store";

export const dynamic = "force-dynamic";

/**
 * POST /api/casino/roulette/spin — no body.
 *
 * Requires a bet already placed on the current round (BET_PLACED). See
 * `spin()` in `lib/practice/roulette-store.ts` for how this stays safe when
 * two spin requests land at almost the same time.
 */
export async function POST() {
  const session = await resolveRouletteSession();
  const result = spin(session);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    roundId: result.roundId,
    result: result.result,
    color: result.color,
    bet: result.bet,
    won: result.won,
    payout: result.payout,
    profit: result.profit,
    balance: result.balance,
  });
}
